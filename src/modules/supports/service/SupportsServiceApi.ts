import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { connects, include, relations, searchFileds } from "../data/fetch";
import {
  createSupportsSchema,
  updateSupportsSchema,
} from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("SupportTicket");
  }
}

export class SupportsServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createSupportsSchema,
      updateSupportsSchema,
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
    const validated = this.validate(this.createSchema, data);
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
    const ticket = await prisma.supportTicket.create({
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
    const ops: any[] = [];
    if (Array.isArray(tasks) && tasks.length) {
      ops.push(
        prisma.supportTicketTask.createMany({
          data: tasks.map((t: any) => ({ ticketId: ticket.id, taskId: t.id })),
        })
      );
    }
    if (Array.isArray(documents) && documents.length) {
      ops.push(
        prisma.supportTicketDocument.createMany({
          data: documents.map((d: any) => ({
            ticketId: ticket.id,
            documentId: d.id,
          })),
        })
      );
    }
    if (Array.isArray(knowledge) && knowledge.length) {
      ops.push(
        prisma.supportTicketKnowledge.createMany({
          data: knowledge.map((k: any) => ({
            ticketId: ticket.id,
            knowledgeId: k.id,
          })),
        })
      );
    }
    if (ops.length) await prisma.$transaction(ops);
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
    const ticket = await prisma.supportTicket.update({
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
      prisma.supportTicketTask.deleteMany({ where: { ticketId: id } }),
      prisma.supportTicketDocument.deleteMany({ where: { ticketId: id } }),
      prisma.supportTicketKnowledge.deleteMany({ where: { ticketId: id } }),
    ];
    if (Array.isArray(tasks) && tasks.length) {
      ops.push(
        prisma.supportTicketTask.createMany({
          data: tasks.map((t: any) => ({ ticketId: id, taskId: t.id })),
        })
      );
    }
    if (Array.isArray(documents) && documents.length) {
      ops.push(
        prisma.supportTicketDocument.createMany({
          data: documents.map((d: any) => ({ ticketId: id, documentId: d.id })),
        })
      );
    }
    if (Array.isArray(knowledge) && knowledge.length) {
      ops.push(
        prisma.supportTicketKnowledge.createMany({
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
