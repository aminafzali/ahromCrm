// مسیر فایل: src/modules/workspace-users/service/WorkspaceUserServiceApi.ts

import { NotFoundException } from "@/@Server/Exceptions/BaseException";
import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { connects, include, relations, searchFileds } from "../data/fetch";
import {
  createWorkspaceUserSchema,
  updateWorkspaceUserSchema,
} from "../validation/schema";

// ریپازیتوری سرور به صورت یک کلاس داخلی تعریف می‌شود، دقیقاً مانند ماژول brands
class Repository extends BaseRepository<any> {
  constructor() {
    super("workspaceUser");
  }
}

export class WorkspaceUserServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createWorkspaceUserSchema,
      updateWorkspaceUserSchema,
      searchFileds,
      relations
    );
    this.repository = new Repository();
    this.connect = connects;
  }

  /**
   * متد create را برای پیاده‌سازی منطق "دعوت عضو جدید" و ترجمه داده‌ها بازنویسی می‌کنیم.
   */
  async create(data: any, context: AuthContext): Promise<any> {
    const validatedData = this.validate(this.createSchema, data);
    const { name, phone, role, displayName, labels, userGroups } =
      validatedData;

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { phone },
        update: { name },
        create: { phone, name },
      });

      const workspaceUser = await tx.workspaceUser.create({
        data: {
          workspaceId: context.workspaceId!,
          userId: user.id,
          // ===== شروع اصلاحیه (ترجمه) =====
          // شناسه را از آبجکت role استخراج کرده و به فیلد roleId پاس می‌دهیم
          roleId: role.id,
          displayName: displayName || name,

          // برای روابط چند به چند نیز داده‌ها را به فرمت صحیح Prisma ترجمه می‌کنیم
          labels: labels
            ? {
                connect: labels.map((label: { id: number }) => ({
                  id: label.id,
                })),
              }
            : undefined,
          userGroups: userGroups
            ? {
                connect: userGroups.map((group: { id: number }) => ({
                  id: group.id,
                })),
              }
            : undefined,
          // ===== پایان اصلاحیه (ترجمه) =====
        },
        include: include,
      });

      return workspaceUser;
    });
  }

  /**
   * متد update را برای تغییر نقش و پروفایل کاربر بازنویسی می‌کنیم.
   */
  async update(id: number, data: any): Promise<any> {
    const validatedData = this.validate(this.updateSchema, data);
    const { role, displayName, labels, userGroups } = validatedData;

    // داده‌ها را برای Prisma ترجمه می‌کنیم
    const finalData = {
      displayName,
      roleId: role.id,
      labels: labels
        ? {
            // set تمام روابط قبلی را حذف و روابط جدید را جایگزین می‌کند
            set: labels.map((label: { id: number }) => ({ id: label.id })),
          }
        : undefined,
      userGroups: userGroups
        ? {
            set: userGroups.map((group: { id: number }) => ({ id: group.id })),
          }
        : undefined,
    };

    const workspaceUser = await this.repository.findById(id);
    if (!workspaceUser) {
      throw new NotFoundException("Workspace user not found");
    }

    return this.repository.update(id, finalData);
  }
}
