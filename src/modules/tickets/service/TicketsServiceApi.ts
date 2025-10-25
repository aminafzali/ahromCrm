import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { connects, include, relations, searchFileds } from "../data/fetch";
import { createTicketSchema, updateTicketSchema } from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("Ticket");
  }
}

export class TicketsServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createTicketSchema,
      updateTicketSchema,
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
      params.filters.workspaceUserId = context.workspaceUser.id;
    }
    return super.getAll(params, context);
  }

  async create(data: any, context: AuthContext): Promise<any> {
    console.log("🚀 TicketsServiceApi: Starting create with data:", data);
    console.log("🚀 TicketsServiceApi: Context:", context);

    const validated = this.validate(this.createSchema, data);
    console.log("✅ TicketsServiceApi: Validation passed:", validated);

    const { workspaceUser, guestUser, assignedTo, category, labels, ...rest } =
      validated as any;
    console.log("🚀 TicketsServiceApi: Creating ticket with data:", {
      ...rest,
      workspaceId: context.workspaceId,
      workspaceUserId: workspaceUser?.id,
      guestUserId: guestUser?.id,
      assignedToId: assignedTo?.id,
      categoryId: category?.id,
    });

    const ticket = await prisma.ticket.create({
      data: {
        ...rest,
        workspaceId: context.workspaceId,
        workspaceUserId: workspaceUser?.id,
        guestUserId: guestUser?.id,
        assignedToId: assignedTo?.id,
        categoryId: category?.id,
        ...(labels && labels.length
          ? { labels: { connect: labels.map((l: any) => ({ id: l.id })) } }
          : {}),
      },
      include,
    });

    console.log("✅ TicketsServiceApi: Ticket created:", ticket);
    return ticket;
  }

  async update(id: number, data: any): Promise<any> {
    const validated = this.validate(this.updateSchema, data);
    const { workspaceUser, guestUser, assignedTo, category, labels, ...rest } =
      validated as any;
    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        ...rest,
        ...(workspaceUser ? { workspaceUserId: workspaceUser.id } : {}),
        ...(guestUser ? { guestUserId: guestUser.id } : {}),
        ...(assignedTo ? { assignedToId: assignedTo.id } : {}),
        ...(category ? { categoryId: category.id } : {}),
        ...(labels
          ? { labels: { set: labels.map((l: any) => ({ id: l.id })) } }
          : {}),
      },
      include,
    });
    return ticket;
  }

  async getMyTickets(params: any, context: AuthContext): Promise<any> {
    if (!context.workspaceUser) {
      throw new Error("کاربر وارد نشده است");
    }

    const { page = 1, limit = 20, ...filters } = params;
    const where: any = {
      workspaceId: context.workspaceId,
      workspaceUserId: context.workspaceUser.id,
    };

    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.ticket.count({ where }),
    ]);

    return {
      data: tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async assignTicket(
    ticketId: number,
    assignedToId: number,
    context: AuthContext
  ): Promise<any> {
    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { assignedToId },
      include,
    });
    return ticket;
  }

  async updateTicketStatus(
    ticketId: number,
    status: string,
    context: AuthContext
  ): Promise<any> {
    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: status as any },
      include,
    });
    return ticket;
  }
}
