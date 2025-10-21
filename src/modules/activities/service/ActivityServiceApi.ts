import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { connects, include, relations, searchFileds } from "../data/fetch";
import {
  createActivitySchema,
  updateActivitySchema,
} from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("Activity");
  }
}

export class ActivityServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createActivitySchema,
      updateActivitySchema,
      searchFileds,
      relations
    );
    this.repository = new Repository();
    this.connect = connects;
  }

  async getAll(params: any, context: AuthContext) {
    if (!params.filters) params.filters = {};
    if (params.filters.user === "me" && context.workspaceUser) {
      delete params.filters.user;
      params.filters.userId = context.workspaceUser.id;
    }
    return super.getAll(params, context);
  }

  async create(data: any, context: AuthContext): Promise<any> {
    console.log("🚀 SupportsServiceApi: Starting create with data:", data);
    console.log("🚀 SupportsServiceApi: Context:", context);

    const validated = this.validate(this.createSchema, data);
    console.log("✅ SupportsServiceApi: Validation passed:", validated);

    const {
      user,
      assignedAdmin,
      assignedTeam,
      category,
      labels,
      tasks,
      documents,
      knowledge,
      ...rest
    } = validated as any;
    console.log("🚀 SupportsServiceApi: Creating D with data:", {
      ...rest,
      workspaceId: context.workspaceId,
      userId: user?.id,
      assignedAdminId: assignedAdmin?.id,
      assignedTeamId: assignedTeam?.id,
      categoryId: category?.id,
    });

    const activity = await prisma.activity.create({
      data: {
        ...rest,
        workspaceId: context.workspaceId,
        userId: user?.id,
        assignedAdminId: assignedAdmin?.id,
        assignedTeamId: assignedTeam?.id,
        categoryId: category?.id,
        ...(labels && labels.length
          ? { labels: { connect: labels.map((l: any) => ({ id: l.id })) } }
          : {}),
      },
      include,
    });

    console.log("✅ SupportsServiceApi: Activity created:", activity);
    const ops: any[] = [];
    if (Array.isArray(tasks) && tasks.length) {
      ops.push(
        prisma.activityTask.createMany({
          data: tasks.map((t: any) => ({
            activityId: activity.id,
            taskId: t.id,
          })),
        })
      );
    }
    if (Array.isArray(documents) && documents.length) {
      ops.push(
        prisma.activityDocument.createMany({
          data: documents.map((d: any) => ({
            activityId: activity.id,
            documentId: d.id,
          })),
        })
      );
    }
    if (Array.isArray(knowledge) && knowledge.length) {
      ops.push(
        prisma.activityKnowledge.createMany({
          data: knowledge.map((k: any) => ({
            activityId: activity.id,
            knowledgeId: k.id,
          })),
        })
      );
    }
    if (ops.length) {
      console.log("🚀 SupportsServiceApi: Creating relations:", ops.length);
      await prisma.$transaction(ops);
    }
    console.log("✅ SupportsServiceApi: All operations completed successfully");
    return activity;
  }

  async update(id: number, data: any): Promise<any> {
    const validated = this.validate(this.updateSchema, data);
    const {
      user,
      assignedAdmin,
      assignedTeam,
      category,
      labels,
      tasks,
      documents,
      knowledge,
      ...rest
    } = validated as any;
    const activity = await prisma.activity.update({
      where: { id },
      data: {
        ...rest,
        ...(user ? { userId: user.id } : {}),
        ...(assignedAdmin ? { assignedAdminId: assignedAdmin.id } : {}),
        ...(assignedTeam ? { assignedTeamId: assignedTeam.id } : {}),
        ...(category ? { categoryId: category.id } : {}),
        ...(labels
          ? { labels: { set: labels.map((l: any) => ({ id: l.id })) } }
          : {}),
      },
      include,
    });
    const ops: any[] = [
      prisma.activityTask.deleteMany({ where: { activityId: id } }),
      prisma.activityDocument.deleteMany({ where: { activityId: id } }),
      prisma.activityKnowledge.deleteMany({ where: { activityId: id } }),
    ];
    if (Array.isArray(tasks) && tasks.length) {
      ops.push(
        prisma.activityTask.createMany({
          data: tasks.map((t: any) => ({ activityId: id, taskId: t.id })),
        })
      );
    }
    if (Array.isArray(documents) && documents.length) {
      ops.push(
        prisma.activityDocument.createMany({
          data: documents.map((d: any) => ({
            activityId: id,
            documentId: d.id,
          })),
        })
      );
    }
    if (Array.isArray(knowledge) && knowledge.length) {
      ops.push(
        prisma.activityKnowledge.createMany({
          data: knowledge.map((k: any) => ({
            activityId: id,
            knowledgeId: k.id,
          })),
        })
      );
    }
    if (ops.length) await prisma.$transaction(ops);
    return activity;
  }
}
