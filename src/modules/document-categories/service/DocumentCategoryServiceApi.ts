import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { FullQueryParams } from "@/@Server/types";
import prisma from "@/lib/prisma";
import { connects, relations, searchFileds } from "../data/fetch";
import {
  createDocumentCategorySchema,
  updateDocumentCategorySchema,
} from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("DocumentCategory");
  }
}

export class DocumentCategoryServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createDocumentCategorySchema,
      updateDocumentCategorySchema,
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

  async getAll(params: FullQueryParams, context: AuthContext) {
    if (!params.filters) params.filters = {};
    if (context.workspaceId) {
      params.filters.workspaceId = context.workspaceId as any;
    }

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
          params.filters.id = -1;
        } else {
          // فقط دسته‌هایی که تیم کاربر روی آن‌ها مجوز دارند
          params.filters.teamCategoryPermission = {
            some: { teamId: { in: teamIds }, canRead: true },
          } as any;
        }
      }
    }

    return super.getAll(params, context);
  }
}
