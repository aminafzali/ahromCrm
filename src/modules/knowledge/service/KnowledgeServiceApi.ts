import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { connects, include, relations, searchFileds } from "../data/fetch";
import {
  createKnowledgeSchema,
  updateKnowledgeSchema,
} from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("Knowledge");
  }
}

export class KnowledgeServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createKnowledgeSchema,
      updateKnowledgeSchema,
      searchFileds,
      relations
    );
    this.repository = new Repository();
    this.connect = connects;
  }
  async create(data: any, context: any) {
    console.log("🚀 KnowledgeServiceApi: Creating knowledge with data:", data);
    console.log("🚀 KnowledgeServiceApi: Context:", context);

    const validated = this.validate(this.createSchema, data);
    const { labels, assignees, teamACL, category, ...rest } = validated as any;

    // Get proper user ID from context
    const userId = context.workspaceUser?.id || context.userId;
    const workspaceId = context.workspaceId;

    console.log(
      "🚀 KnowledgeServiceApi: User ID:",
      userId,
      "Workspace ID:",
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
      ...(category?.id
        ? { category: { connect: { id: Number(category.id) } } }
        : {}),
      // write join tables correctly
      labels:
        Array.isArray(labels) && labels.length > 0
          ? { create: labels.map((l: any) => ({ labelId: Number(l.id) })) }
          : undefined,
      assignees:
        Array.isArray(assignees) && assignees.length > 0
          ? {
              create: assignees.map((u: any) => ({
                workspaceUserId: Number(u.id),
              })),
            }
          : undefined,
    };

    console.log("🚀 KnowledgeServiceApi: Final data for Prisma:", finalData);

    return (prisma as any).knowledge.create({ data: finalData, include });
  }
  async update(id: number, data: any) {
    const validated = this.validate(this.updateSchema, data);
    const { labels, assignees, teamACL, category, ...rest } = validated as any;
    const finalData: any = {
      ...rest,
      ...(category?.id ? { categoryId: Number(category.id) } : {}),
      // For now do not mutate join tables here to avoid validation pitfalls
    };
    return (prisma as any).knowledge.update({
      where: { id },
      data: finalData,
      include,
    });
  }
}
