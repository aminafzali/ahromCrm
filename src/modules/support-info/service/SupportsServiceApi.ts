import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { connects, include, relations, searchFileds } from "../data/fetch";
import {
  createSupportInfoSchema,
  updateSupportInfoSchema,
} from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("SupportInfo");
  }
}

export class SupportInfoServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createSupportInfoSchema,
      updateSupportInfoSchema,
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
    console.log("🚀 SupportsServiceApi: Creating ticket with data:", {
      ...rest,
      workspaceId: context.workspaceId,
      userId: user?.id,
      assignedAdminId: assignedAdmin?.id,
      assignedTeamId: assignedTeam?.id,
      categoryId: category?.id,
    });

    const ticket = await prisma.supportInfo.create({
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

    console.log("✅ SupportsServiceApi: Ticket created:", ticket);
    const ops: any[] = [];
    if (Array.isArray(tasks) && tasks.length) {
      ops.push(
        prisma.supportInfoTask.createMany({
          data: tasks.map((t: any) => ({ ticketId: ticket.id, taskId: t.id })),
        })
      );
    }
    if (Array.isArray(documents) && documents.length) {
      ops.push(
        prisma.supportInfoDocument.createMany({
          data: documents.map((d: any) => ({
            ticketId: ticket.id,
            documentId: d.id,
          })),
        })
      );
    }
    if (Array.isArray(knowledge) && knowledge.length) {
      ops.push(
        prisma.supportInfoKnowledge.createMany({
          data: knowledge.map((k: any) => ({
            ticketId: ticket.id,
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
    return ticket;
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
    const ticket = await prisma.supportInfo.update({
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
      prisma.supportInfoTask.deleteMany({ where: { ticketId: id } }),
      prisma.supportInfoDocument.deleteMany({ where: { ticketId: id } }),
      prisma.supportInfoKnowledge.deleteMany({ where: { ticketId: id } }),
    ];
    if (Array.isArray(tasks) && tasks.length) {
      ops.push(
        prisma.supportInfoTask.createMany({
          data: tasks.map((t: any) => ({ ticketId: id, taskId: t.id })),
        })
      );
    }
    if (Array.isArray(documents) && documents.length) {
      ops.push(
        prisma.supportInfoDocument.createMany({
          data: documents.map((d: any) => ({ ticketId: id, documentId: d.id })),
        })
      );
    }
    if (Array.isArray(knowledge) && knowledge.length) {
      ops.push(
        prisma.supportInfoKnowledge.createMany({
          data: knowledge.map((k: any) => ({
            ticketId: id,
            knowledgeId: k.id,
          })),
        })
      );
    }
    if (ops.length) await prisma.$transaction(ops);
    return ticket;
  }
}
