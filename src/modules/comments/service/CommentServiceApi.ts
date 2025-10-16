import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  entityType: z.string().min(1),
  entityId: z.coerce.number().int().positive(),
  body: z.string().min(1),
  parent: z.object({ id: z.coerce.number() }).optional().nullable(),
});
const updateSchema = z.object({ body: z.string().min(1).optional() });

class Repository extends BaseRepository<any> {
  constructor() {
    super("Comment");
  }
}

export class CommentServiceApi extends BaseService<any> {
  constructor() {
    super(new Repository(), createSchema, updateSchema, ["body"], []);
    this.repository = new Repository();
  }

  async getAll(params: any = { page: 1, limit: 10 }, context?: any) {
    console.log("🚀 CommentServiceApi: getAll called with params:", params);

    const { page = 1, limit = 10, filters = {} } = params;

    // Build where clause manually to ensure entityType and entityId filters work
    const where: any = {
      workspaceId: context?.workspaceId,
    };

    // Add entity filters if provided
    if (filters.entityType) {
      where.entityType = filters.entityType;
    }
    if (filters.entityId) {
      where.entityId = parseInt(filters.entityId);
    }

    console.log("🚀 CommentServiceApi: Final where clause:", where);

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      (prisma as any).comment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          parent: {
            select: {
              id: true,
              body: true,
              author: {
                select: {
                  displayName: true,
                },
              },
            },
          },
        },
      }),
      (prisma as any).comment.count({ where }),
    ]);

    const result = {
      data: items,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };

    console.log(
      "✅ CommentServiceApi: Found",
      items.length,
      "comments for",
      filters
    );
    return result;
  }

  async create(data: any, context: any) {
    console.log("🚀 CommentServiceApi: Starting create with data:", data);
    console.log("🚀 CommentServiceApi: Context:", context);

    const validated = this.validate(this.createSchema, data);
    console.log("✅ CommentServiceApi: Validation passed:", validated);

    const { parent, ...rest } = validated as any;

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

    const finalData: any = {
      ...rest,
      // Only use relations, not direct IDs
      workspace: { connect: { id: Number(workspaceId) } },
      author: { connect: { id: Number(userId) } },
      ...(parent?.id ? { parent: { connect: { id: Number(parent.id) } } } : {}),
    };

    console.log("🚀 CommentServiceApi: Creating comment with data:", finalData);

    const result = await (prisma as any).comment.create({ data: finalData });
    console.log("✅ CommentServiceApi: Comment created successfully:", result);

    return result;
  }
}
