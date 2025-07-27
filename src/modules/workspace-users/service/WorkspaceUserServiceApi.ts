// مسیر فایل: src/modules/workspace-users/service/WorkspaceUserServiceApi.ts

import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { connects, relations, searchFileds } from "../data/fetch";
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
    this.connect = connects;
    this.repository = new Repository(); // این خط نیز دقیقاً مانند ماژول brands است
  }

  async create(data: any, context: AuthContext): Promise<any> {
    const validatedData = this.validate(this.createSchema, data);
    const { name, phone, roleId, displayName, labels, userGroups } =
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
          roleId: roleId,
          displayName: displayName || name, // اگر نام نمایشی نبود، از نام اصلی استفاده کن
          // اتصال به برچسب‌ها و گروه‌های کاربری
          labels: labels
            ? {
                create: labels.map((labelId: number) => ({
                  label: { connect: { id: labelId } },
                })),
              }
            : undefined,
          userGroups: userGroups
            ? {
                create: userGroups.map((groupId: number) => ({
                  userGroup: { connect: { id: groupId } },
                })),
              }
            : undefined,
        },
        include: { user: true, role: true, labels: true, userGroups: true },
      });

      return workspaceUser;
    });
  }

  async update(id: number, data: any): Promise<any> {
    const validatedData = this.validate(this.updateSchema, data);
    const { roleId, displayName, labels, userGroups } = validatedData;

    const finalData = {
      roleId,
      displayName,
      labels: labels
        ? {
            // تمام روابط قبلی را حذف و روابط جدید را جایگزین می‌کند
            deleteMany: {},
            create: labels.map((labelId: number) => ({
              label: { connect: { id: labelId } },
            })),
          }
        : undefined,
      userGroups: userGroups
        ? {
            deleteMany: {},
            create: userGroups.map((groupId: number) => ({
              userGroup: { connect: { id: groupId } },
            })),
          }
        : undefined,
    };

    return this.repository.update(id, finalData);
  }
}
