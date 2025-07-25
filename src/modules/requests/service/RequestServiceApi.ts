// مسیر فایل: src/modules/requests/service/RequestServiceApi.ts

import { NotFoundException } from "@/@Server/Exceptions/BaseException";
import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { NotificationServiceApi } from "@/modules/notifications/service/NotificationServiceApi";
import { connects, include, relations, searchFileds } from "../data/fetch";
import { createRequestSchema, updateRequestSchema } from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("request"); // نام مدل در پریزما Request است
  }
}

export class RequestServiceApi extends BaseService<any> {
  protected notifRepo: NotificationServiceApi;

  constructor() {
    super(
      new Repository(),
      createRequestSchema,
      updateRequestSchema,
      searchFileds,
      relations
    );
    this.connect = connects;
    this.repository = new Repository();
    this.notifRepo = new NotificationServiceApi();

    this.afterCreate = this.handleAfterCreate; // هوک اصلی afterCreate
    this.beforeUpdate = this.handleServicesOnUpdate;
    this.afterStatusChange = this.handleAfterChangeStatus;
  }

  /**
   * متد create را برای پیاده‌سازی منطق "ثبت درخواست" بازنویسی می‌کنیم.
   * این نسخه جدید هر دو سناریوی (ثبت توسط مشتری و ثبت توسط کارشناس) را مدیریت می‌کند.
   */
  async create(data: any, context: AuthContext): Promise<any> {
    const validatedData = this.validate(this.createSchema, data);
    const { userId, assignedToId, ...restOfData } = validatedData;
    const currentWorkspaceId = context.workspaceId!;

    return prisma.$transaction(async (tx) => {
      // ۱. پروفایل ورک‌اسپیسی (ویزا) مشتری را در ورک‌اسپیس فعلی پیدا یا ایجاد می‌کنیم.
      const customerWorkspaceUser = await tx.workspaceUser.upsert({
        where: {
          workspaceId_userId: {
            userId: userId,
            workspaceId: currentWorkspaceId,
          },
        },
        update: {},
        create: {
          userId: userId,
          workspaceId: currentWorkspaceId,
          // نکته: این ID باید با شناسه نقش "مشتری" در دیتابیس شما مطابقت داشته باشد
          roleId: 2, // <-- آیدی نقش "مشتری" را اینجا قرار دهید
        },
      });

      // ۲. داده نهایی را برای ساخت درخواست آماده می‌کنیم
      const finalData = {
        ...restOfData,
        workspace: { connect: { id: currentWorkspaceId } },
        workspaceUser: {
          connect: {
            workspaceId_userId: {
              workspaceId: customerWorkspaceUser.workspaceId,
              userId: customerWorkspaceUser.userId,
            },
          },
        },
        // اگر کارشناسی تخصیص داده شده بود، پروفایل او را نیز متصل می‌کنیم
        ...(assignedToId && {
          assignedTo: {
            connect: {
              workspaceId_userId: {
                workspaceId: currentWorkspaceId,
                userId: assignedToId,
              },
            },
          },
        }),
      };

      // ۳. درخواست را در دیتابیس ایجاد می‌کنیم
      const newRequest = await tx.request.create({
        data: finalData,
        include: include, // از include کامل استفاده می‌کنیم تا به تمام روابط دسترسی داشته باشیم
      });

      return newRequest;
    });
  }

  /**
   * این هوک قبل از آپدیت یک درخواست، فراخوانی می‌شود.
   * لیست خدمات را مدیریت کرده و سپس آن را از داده‌ها حذف می‌کند.
   */
  private async handleServicesOnUpdate(
    id: number | string,
    data: any
  ): Promise<any> {
    const { actualServices } = data;
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;

    if (Array.isArray(actualServices)) {
      const existingRequest = await prisma.request.findUnique({
        where: { id: numericId },
      });
      if (!existingRequest) throw new NotFoundException("Request not found");

      await prisma.$transaction([
        prisma.actualServiceOnRequest.deleteMany({
          where: { requestId: numericId },
        }),
        ...(actualServices.length > 0
          ? [
              prisma.actualServiceOnRequest.createMany({
                data: actualServices.map((service: any) => ({
                  requestId: numericId,
                  actualServiceId: service.actualServiceId,
                  quantity: service.quantity,
                  price: service.price,
                  workspaceId: existingRequest.workspaceId,
                })),
              }),
            ]
          : []),
      ]);
    }
    delete data.actualServices;
    return data;
  }

  /**
   * این هوک پس از ایجاد موفق یک درخواست، فراخوانی می‌شود
   * و خدمات مربوطه را ثبت کرده و نوتیفیکیشن ارسال می‌کند.
   */
  private async handleAfterCreate(entity: any, data: any): Promise<void> {
    // بخش اول: ثبت خدمات واقعی
    const { actualServices } = data;
    if (
      entity &&
      actualServices &&
      Array.isArray(actualServices) &&
      actualServices.length > 0
    ) {
      await prisma.actualServiceOnRequest.createMany({
        data: actualServices.map((service: any) => ({
          ...service,
          requestId: entity.id,
          workspaceId: entity.workspaceId,
        })),
      });
    }

    // بخش دوم: ارسال نوتیفیکیشن
    const customer = entity.workspaceUser;
    if (!customer) return;

    const message = `درخواست شما با موفقیت ثبت شد\nشماره پیگیری: ${entity.id}`;
    // با ساختار جدید NotificationServiceApi هماهنگ شده است
    await this.notifRepo.create({
      workspaceId: entity.workspaceId,
      workspaceUserUserId: customer.userId,
      workspaceUserWorkspaceId: entity.workspaceId,
      requestId: entity.id,
      title: "ثبت درخواست",
      message,
    });
  }

  /**
   * این هوک پس از تغییر وضعیت، نوتیفیکیشن ارسال می‌کند.
   */
  private async handleAfterChangeStatus(entity: any, data: any): Promise<void> {
    const customer = entity.workspaceUser;
    if (!customer) return;

    let message = `درخواست شما به روز رسانی شد از وضعیت ${data.oldStatus} به ${data.newStatus}`;
    if (entity.note) message += `\n\n${entity.note}`;
    message += `\nشماره پیگیری: ${entity.id}`;

    await this.notifRepo.create({
      workspaceId: entity.workspaceId,
      workspaceUserUserId: customer.userId,
      workspaceUserWorkspaceId: entity.workspaceId,
      requestId: entity.id,
      title: "تغییر وضعیت",
      message,
      sendSms: data.sendSms,
    });
  }

  // این بخش کامنت شده از کد شما، دست‌نخورده باقی می‌ماند
  // async update(id: number, data: any) {
  //   const updateData: any = { ...data };

  //   // Handle form submission
  //   if (data.formSubmissionid) {
  //     updateData.formSubmissionid = data.formSubmissionid;
  //   }
  //   const entity = await this.repository.update(id, updateData);
  //   return entity;
  // }
}
