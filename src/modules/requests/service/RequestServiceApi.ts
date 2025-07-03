import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { NotificationServiceApi } from "@/modules/notifications/service/NotificationServiceApi";
import { connects, relations, searchFileds } from "../data/fetch"; // ایمپورت connects
import { createRequestSchema } from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("Request");
  }
}

export class RequestServiceApi extends BaseService<any> {
  protected notifRepo: NotificationServiceApi;

  constructor() {
    super(
      new Repository(),
      createRequestSchema,
      createRequestSchema,
      searchFileds,
      relations
    );
    // ++ پیکربندی BaseService برای مدیریت روابط، دقیقا طبق الگوی شما ++
    //this.connect = connects;
    this.repository = new Repository();
    this.notifRepo = new NotificationServiceApi();
    this.connect = connects;

    // ++ استفاده از سیستم هوک برای افزودن قابلیت جدید بدون شکستن کد اصلی ++
    this.afterCreate = this.handleServicesOnCreate;
    // اینجا تغییر اعمال شد: 'this.handleServicesOnUpdate' اکنون از نوع 'number | string' برای 'id' پشتیبانی می‌کند.
    this.beforeUpdate = this.handleServicesOnUpdate;
    this.afterStatusChange = this.handleAfterChangeStatus;
  }

  /**
   * این هوک پس از ایجاد موفق یک درخواست، فراخوانی می‌شود
   * و خدمات مربوط به آن را در جدول واسط ذخیره می‌کند.
   */
  private async handleServicesOnCreate(entity: any, data: any): Promise<void> {
    const { actualServices } = data;
    if (entity && actualServices && actualServices.length > 0) {
      await prisma.actualServiceOnRequest.createMany({
        data: actualServices.map((service: any) => ({
          ...service,
          requestId: entity.id,
        })),
      });
    }
    // هوک اصلی مربوط به نوتیفیکیشن را هم صدا می‌زنیم
    await this.handleAfterCreate(entity, data);
  }

  /**
   * این هوک قبل از آپدیت یک درخواست، فراخوانی می‌شود.
   * لیست خدمات را مدیریت کرده و سپس آن را از داده‌ها حذف می‌کند
   * تا در اعتبارسنجی BaseService اختلال ایجاد نکند.
   *
   * **تغییر اعمال شده:** نوع 'id' به 'number | string' تغییر یافت تا با 'BaseService' سازگار باشد.
   */
  private async handleServicesOnUpdate(
    id: number | string,
    data: any
  ): Promise<any> {
    const { actualServices } = data;
    console.log("Incoming update data:", data);
    // اگر requestId در مدل Prisma شما همیشه از نوع 'number' است،
    // نیاز به تبدیل 'id' به 'number' خواهید داشت.
    // در غیر این صورت، اگر 'id' می‌تواند 'string' (مانند UUID) باشد، این تبدیل ضروری نیست.
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;

    if (Array.isArray(actualServices)) {
      await prisma.$transaction([
        prisma.actualServiceOnRequest.deleteMany({
          where: { requestId: numericId },
        }),
        ...(actualServices.length > 0
          ? [
              prisma.actualServiceOnRequest.createMany({
                data: actualServices.map((service: any) => ({
                  requestId: numericId, // از numericId استفاده شود
                  actualServiceId: service.actualServiceId,
                  quantity: service.quantity,
                  price: service.price,
                })),
              }),
            ]
          : []),
      ]);
    }

    // فیلد actualServices را حذف می‌کنیم تا به BaseService ارسال نشود
    delete data.actualServices;

    // داده‌های پاک‌شده را برای ادامه فرآیند آپدیت برمی‌گردانیم
    return data;
  }

  // این متدها فقط برای ارسال نوتیفیکیشن هستند و بدون تغییر باقی می‌مانند
  private async handleAfterCreate(entity: any, data: any): Promise<void> {
    let baseLink = process.env.NEXTAUTH_URL || "http://localhost:3011";
    baseLink += "/panel/requests/" + entity.id;
    const message = `درخواست شما با موفقیت ثبت شد\nشماره پیگیری: ${entity.id}`;
    await this.notifRepo.create({
      userId: entity.userId,
      requestId: entity.id,
      title: "ثبت درخواست",
      message,
    });
  }

  private async handleAfterChangeStatus(entity: any, data: any): Promise<void> {
    //TODO: بنظر می آید خط زیر ایراداتی دارد!
    console.log("handleAfterChangeStatus data", data);
    console.log("handleAfterChangeStatus entity", entity);

    let baseLink = process.env.NEXTAUTH_URL || "http://localhost:3011";
    baseLink += "/panel/requests/" + entity.id;
    let message = `درخواست شما به روز رسانی شد از وضعیت ${data.oldStatus} به ${data.newStatus}`;
    if (entity.note) message += `\n\n${entity.note}`;
    message += `\nشماره پیگیری: ${entity.id}`;

    await this.notifRepo.create({
      userId: entity.userId,
      requestId: entity.id,
      title: "تغییر وضعیت",
      message,
      sendSms: data.sendSms,
    });
  }

  // async update(id: number, data: any) {
  //   const updateData: any = { ...data };

  //   // Handle form submission
  //   if (data.formSubmissionid) {
  //     updateData.formSubmissionid = data.formSubmissionid;
  //   }
  //   const entity = await this.repository.update(id, updateData);
  //   return entity;
  // }
}
