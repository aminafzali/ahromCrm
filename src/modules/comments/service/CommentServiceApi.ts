import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { FullQueryParams } from "@/@Server/types";
import prisma from "@/lib/prisma";
import { z } from "zod";
import {
  connects,
  include as defaultInclude,
  relations,
  searchFileds,
} from "../data/fetch";

const createSchema = z
  .object({
    taskId: z.coerce.number().int().positive().optional().nullable(),
    knowledgeId: z.coerce.number().int().positive().optional().nullable(),
    documentId: z.coerce.number().int().positive().optional().nullable(),
    projectId: z.coerce.number().int().positive().optional().nullable(),
    body: z.string().min(1),
    parent: z.object({ id: z.coerce.number() }).optional().nullable(),
    // Support old format for backward compatibility during migration
    entityType: z.string().optional(),
    entityId: z.coerce.number().int().positive().optional(),
  })
  .refine(
    (data) => {
      // At least one relation must be provided
      return (
        data.taskId ||
        data.knowledgeId ||
        data.documentId ||
        data.projectId ||
        data.entityId
      );
    },
    {
      message:
        "At least one relation (taskId, knowledgeId, documentId, or projectId) must be provided",
    }
  );
const updateSchema = z.object({ body: z.string().min(1).optional() });

class Repository extends BaseRepository<any> {
  constructor() {
    super("Comment");
  }
}

export class CommentServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createSchema,
      updateSchema,
      searchFileds,
      relations
    );
    this.repository = new Repository();
    this.connect = connects;
  }

  /**
   * getAll: استفاده از BaseService.getAll
   * - بررسی می‌کند که حداقل یک relation filter (taskId, knowledgeId, documentId, projectId) ارسال شده باشد
   * - از BaseService.getAll استفاده می‌کند که خودش filters را parse می‌کند
   * - likes را به صورت dynamic به include اضافه می‌کند
   */
  async getAll(
    params: FullQueryParams = { page: 1, limit: 10 },
    context?: AuthContext
  ) {
    console.log(
      "🚀 CommentServiceApi.getAll: Received params:",
      JSON.stringify(params, null, 2)
    );

    const { filters = {} } = params;

    console.log(
      "🔍 CommentServiceApi.getAll: Extracted filters:",
      JSON.stringify(filters, null, 2)
    );

    // بررسی اینکه حداقل یک relation filter ارسال شده باشد
    const hasRelationFilter =
      (filters.taskId !== undefined && filters.taskId !== null) ||
      (filters.knowledgeId !== undefined && filters.knowledgeId !== null) ||
      (filters.documentId !== undefined && filters.documentId !== null) ||
      (filters.projectId !== undefined && filters.projectId !== null) ||
      // Backward compatibility: support old entityType/entityId format
      (filters.entityType &&
        filters.entityId !== undefined &&
        filters.entityId !== null);

    if (!hasRelationFilter) {
      console.warn("⚠️ CommentServiceApi: No relation filter provided!");
      console.warn("⚠️ CommentServiceApi: Filters received:", filters);
      return {
        data: [],
        pagination: {
          total: 0,
          pages: 0,
          page: params.page || 1,
          limit: params.limit || 10,
        },
      };
    }

    // افزودن likes به include به صورت dynamic
    // BaseController از this.include استفاده می‌کند، اما ما باید likes را dynamic کنیم
    const workspaceUserId = context?.workspaceUser?.id;
    const baseInclude =
      (params.include as Record<string, any>) || defaultInclude;
    const dynamicInclude = {
      ...baseInclude,
      likes: workspaceUserId
        ? {
            where: {
              workspaceUserId,
            },
            select: {
              workspaceUserId: true,
            },
          }
        : false,
    };

    // استفاده از BaseService.getAll با include اصلاح شده
    const result = await super.getAll(
      { ...params, include: dynamicInclude },
      context
    );

    // افزودن liked flag و likeCount به هر کامنت
    result.data = result.data.map((item: any) => ({
      ...item,
      liked: workspaceUserId ? item.likes && item.likes.length > 0 : false,
      likeCount: item._count?.likes ?? 0,
    }));

    return result;
  }

  async create(data: any, context: any) {
    console.log("🚀 CommentServiceApi: Starting create with data:", data);
    console.log("🚀 CommentServiceApi: Context:", context);

    const validated = this.validate(this.createSchema, data);
    console.log("✅ CommentServiceApi: Validation passed:", validated);

    const { parent, entityType, entityId, ...rest } = validated as any;

    // Get the correct user ID from context
    const userId = context.workspaceUser?.id || context.userId;
    const workspaceId = context.workspaceId;

    console.log(
      "🔍 CommentServiceApi: Using userId:",
      userId,
      "workspaceId:",
      workspaceId
    );

    if (!userId || !workspaceId) {
      throw new Error("Missing required context: userId or workspaceId");
    }

    // Backward compatibility: convert old entityType/entityId to new format
    const relationConnect: any = {};
    if (entityType && entityId) {
      if (entityType === "Task") {
        relationConnect.task = { connect: { id: Number(entityId) } };
      } else if (entityType === "Knowledge") {
        relationConnect.knowledge = { connect: { id: Number(entityId) } };
      } else if (entityType === "Document") {
        relationConnect.document = { connect: { id: Number(entityId) } };
      } else if (entityType === "Project") {
        relationConnect.project = { connect: { id: Number(entityId) } };
      }
    } else {
      // Use new format
      if (rest.taskId) {
        relationConnect.task = { connect: { id: Number(rest.taskId) } };
        delete rest.taskId;
      }
      if (rest.knowledgeId) {
        relationConnect.knowledge = {
          connect: { id: Number(rest.knowledgeId) },
        };
        delete rest.knowledgeId;
      }
      if (rest.documentId) {
        relationConnect.document = { connect: { id: Number(rest.documentId) } };
        delete rest.documentId;
      }
      if (rest.projectId) {
        relationConnect.project = { connect: { id: Number(rest.projectId) } };
        delete rest.projectId;
      }
    }

    const finalData: any = {
      ...rest,
      // Only use relations, not direct IDs
      workspace: { connect: { id: Number(workspaceId) } },
      author: { connect: { id: Number(userId) } },
      ...relationConnect,
      ...(parent?.id ? { parent: { connect: { id: Number(parent.id) } } } : {}),
    };

    console.log("🚀 CommentServiceApi: Creating comment with data:", finalData);

    const result = await (prisma as any).comment.create({
      data: {
        ...finalData,
        likeCount: 0, // Initialize likeCount to 0
      },
    });
    console.log("✅ CommentServiceApi: Comment created successfully:", result);

    return result;
  }

  async update(id: number, data: any, context?: any) {
    const validated = this.validate(this.updateSchema, data);
    const result = await this.repository.update(id, validated);

    // Update likeCount based on actual likes count
    const updated = await (prisma as any).comment.findUnique({
      where: { id },
      include: { _count: { select: { likes: true } } },
    });

    if (updated) {
      await (prisma as any).comment.update({
        where: { id },
        data: { likeCount: updated._count.likes },
      });
    }

    return result;
  }
}
