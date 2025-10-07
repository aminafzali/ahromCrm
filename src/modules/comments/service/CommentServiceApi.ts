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
