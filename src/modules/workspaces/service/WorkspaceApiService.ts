// مسیر فایل: src/modules/workspaces/service/WorkspaceApiService.ts

import { ForbiddenException } from "@/@Server/Exceptions/BaseException";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { Workspace } from "@prisma/client";
import { searchFileds } from "../data/fetch";
import { workspaceSchema } from "../validation/schema";

class Repository extends BaseRepository<Workspace> {
  constructor() {
    super("Workspace");
  }
}

export class WorkspaceApiService extends BaseService<Workspace> {
  constructor() {
    super(
      new Repository(),
      workspaceSchema,
      workspaceSchema.partial(),
      searchFileds
    );
  }

  // ++ اصلاحیه: متد create اکنون context را به عنوان پارامتر دوم می‌پذیرد ++
  async create(data: any, context?: any): Promise<Workspace> {
    if (!context || !context.user) {
      throw new ForbiddenException(
        "User must be logged in to create a workspace."
      );
    }

    // اعتبارسنجی داده‌های ورودی با اسکیمای اصلی
    const validatedData = this.createSchema.parse(data);
    const { name, slug } = validatedData;
    const ownerId = context.user.id;

    return prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: { name, slug, ownerId },
      });
      const adminRole = await tx.role.upsert({
        where: { name: "Admin" },
        update: {},
        create: { name: "Admin", description: "دسترسی کامل" },
      });
      await tx.workspaceUser.create({
        data: {
          workspaceId: workspace.id,
          userId: ownerId,
          roleId: adminRole.id,
        },
      });
      return workspace;
    });
  }
}
