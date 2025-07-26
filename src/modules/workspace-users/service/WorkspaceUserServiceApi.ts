// مسیر فایل: src/modules/workspace-users/service/WorkspaceUserServiceApi.ts

import { NotFoundException } from "@/@Server/Exceptions/BaseException";
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

  /**
   * متد create برای پیاده‌سازی منطق "دعوت عضو جدید" بازنویسی می‌شود.
   */
  async create(data: any, context: AuthContext): Promise<any> {
    const validatedData = this.validate(this.createSchema, data);
    const { name, phone, roleId } = validatedData;

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
        },
        include: {
          user: true,
          role: true,
        },
      });

      return workspaceUser;
    });
  }

  /**
   * متد update برای تغییر نقش کاربر بازنویسی می‌شود.
   */
  async update(id: number, data: any): Promise<any> {
    const validatedData = this.validate(this.updateSchema, data);

    const workspaceUser = await this.repository.findById(id);
    if (!workspaceUser) {
      throw new NotFoundException("Workspace user not found");
    }

    return this.repository.update(id, validatedData);
  }
}
