// مسیر فایل: src/@Server/services/workspaces/WorkspaceApiService.ts

import { ForbiddenException } from "@/@Server/Exceptions/BaseException";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { Workspace } from "@prisma/client";
import { z } from "zod";

// اسکیمای اعتبارسنجی در همین فایل تعریف می‌شود تا کاملا مستقل باشد
export const workspaceSchema = z.object({
  name: z.string().min(3, "نام ورک‌اسپیس باید حداقل ۳ کاراکتر باشد."),
  slug: z
    .string()
    .min(3, "اسلاگ باید حداقل ۳ کاراکتر باشد.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

class Repository extends BaseRepository<Workspace> {
  constructor() {
    super("Workspace");
  }
}

export class WorkspaceApiService extends BaseService<Workspace> {
  constructor() {
    super(new Repository(), workspaceSchema, workspaceSchema.partial(), [
      "name",
      "slug",
    ]);
  }

  async create(data: any, context?: any): Promise<Workspace> {
    if (!context || !context.user) {
      throw new ForbiddenException(
        "User must be logged in to create a workspace."
      );
    }
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
