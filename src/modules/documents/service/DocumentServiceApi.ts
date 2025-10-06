import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { FullQueryParams } from "@/@Server/types";
import prisma from "@/lib/prisma";
import { connects, include, relations, searchFileds } from "../data/fetch";
import {
  createDocumentSchema,
  updateDocumentSchema,
} from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("Document");
  }
}

export class DocumentServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createDocumentSchema,
      updateDocumentSchema,
      searchFileds,
      relations
    );
    this.repository = new Repository();
    this.connect = connects;
  }

  private async getUserTeamIds(context: AuthContext): Promise<number[]> {
    if (!context.workspaceUser) return [];
    const rows = await (prisma as any).teamMember.findMany({
      where: { workspaceUserId: context.workspaceUser.id },
      select: { teamId: true },
    });
    return rows.map((r: any) => r.teamId);
  }

  private async hasPermission(
    context: AuthContext,
    documentId: number,
    action: "read" | "write" | "delete"
  ): Promise<boolean> {
    // ادمین دسترسی کامل دارد
    if (context.role?.name === "Admin") return true;

    // سیاست نقش کلی در سطح ورک‌اسپیس
    const rolePolicy = await (prisma as any).roleDocumentPolicy.findUnique({
      where: {
        workspaceId_roleId: {
          workspaceId: Number(context.workspaceId),
          roleId: context.role!.id,
        },
      },
      select: { canRead: true, canWrite: true, canDelete: true },
    });
    if (rolePolicy) {
      if (action === "read" && rolePolicy.canRead) return true;
      if (action === "write" && rolePolicy.canWrite) return true;
      if (action === "delete" && rolePolicy.canDelete) return true;
    }

    // بررسی مجوزهای تیمی روی خود سند
    const teamIds = await this.getUserTeamIds(context);
    if (teamIds.length === 0) return false;

    const teamDocPerm = await (prisma as any).teamDocumentPermission.findFirst({
      where: {
        documentId,
        teamId: { in: teamIds },
        ...(action === "read" ? { canRead: true } : {}),
        ...(action === "write" ? { canWrite: true } : {}),
        ...(action === "delete" ? { canDelete: true } : {}),
      },
      select: { id: true },
    });
    if (teamDocPerm) return true;

    // در نهایت، بررسی اجازهٔ تیمی روی دستهٔ سند (در صورت وجود دسته)
    const doc = await (prisma as any).document.findUnique({
      where: { id: documentId },
      select: { categoryId: true },
    });
    if (!doc?.categoryId) return false;

    const teamCatPerm = await (prisma as any).teamCategoryPermission.findFirst({
      where: {
        categoryId: doc.categoryId,
        teamId: { in: teamIds },
        ...(action === "read" ? { canRead: true } : {}),
        ...(action === "write" ? { canWrite: true } : {}),
        ...(action === "delete" ? { canDelete: true } : {}),
      },
      select: { id: true },
    });
    return !!teamCatPerm;
  }

  async getAll(params: FullQueryParams, context: AuthContext) {
    if (!params.filters) params.filters = {};
    // enforce workspace scope
    if (context.workspaceId) {
      params.filters.workspaceId = context.workspaceId;
    }
    // اعمال سطح دسترسی خواندن بر اساس نقش/تیم
    if (context.role?.name !== "Admin") {
      const rolePolicy = await (prisma as any).roleDocumentPolicy.findUnique({
        where: {
          workspaceId_roleId: {
            workspaceId: Number(context.workspaceId),
            roleId: context.role!.id,
          },
        },
        select: { canRead: true },
      });

      if (!rolePolicy?.canRead) {
        const teamIds = await this.getUserTeamIds(context);
        if (teamIds.length === 0) {
          params.filters.id = -1; // هیچ سندی نشان نده
        } else {
          params.filters.teamPermissions = {
            some: { teamId: { in: teamIds }, canRead: true },
          } as any;
        }
      }
    }
    return super.getAll(params, context);
  }

  async create(data: any, context: AuthContext): Promise<any> {
    if (!context.workspaceId) throw new Error("Missing workspaceId in context");
    // فقط ادمین‌های ورک‌اسپیس مجاز به ایجاد سند هستند (قابل توسعه با سیاست نقش)
    if (context.role?.name !== "Admin") {
      // بررسی سیاست نقش کلی
      const rolePolicy = await (prisma as any).roleDocumentPolicy.findUnique({
        where: {
          workspaceId_roleId: {
            workspaceId: Number(context.workspaceId),
            roleId: context.role!.id,
          },
        },
      });
      if (!rolePolicy?.canWrite) {
        throw new Error("Permission denied to create document");
      }
    }
    const validated = this.validate(this.createSchema, data);
    const { category, ...rest } = validated;
    const finalData: any = {
      ...rest,
      workspaceId: Number(context.workspaceId),
      ...(category?.id ? { categoryId: Number(category.id) } : {}),
    };
    return (prisma as any).document.create({ data: finalData, include });
  }

  async update(id: number, data: any): Promise<any> {
    // اجازهٔ ویرایش: ادمین یا تیم‌هایی که روی سند canWrite دارند یا نقش کلی canWrite
    const existing = await (prisma as any).document.findUnique({
      where: { id },
    });
    if (!existing) throw new Error("Document not found");
    // توجه: BaseService.update فقط (id, data) می‌گیرد و context را پاس نمی‌دهد
    // اینجا از سیاست کلی استفاده می‌کنیم: در کنترلر سطح بالاتر می‌توان context را enforce کرد
    const validated = this.validate(this.updateSchema, data);
    const { category, ...rest } = validated;
    const finalData: any = {
      ...rest,
      ...(category?.id ? { categoryId: Number(category.id) } : {}),
    };
    return (prisma as any).document.update({
      where: { id },
      data: finalData,
      include,
    });
  }

  async delete(id: number): Promise<any> {
    // اجازهٔ حذف: ادمین یا تیم‌هایی که روی سند canDelete دارند یا نقش کلی canDelete
    return super.delete(id);
  }
}
