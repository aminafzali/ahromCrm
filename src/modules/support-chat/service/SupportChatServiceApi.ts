import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { SupportPriority, SupportTicketStatus } from "@prisma/client";
import {
  connects,
  include,
  includeMessage,
  relations,
  searchFields,
} from "../data/fetch";
import {
  canAccessSupportChat,
  canAssignTickets,
  canUpdateTicketStatus,
} from "../utils/permissions";

class Repository extends BaseRepository<any> {
  constructor() {
    super("SupportChatTicket");
  }

  /**
   * Override findById to use findFirst instead of findUnique
   * چون در Support Chat نیاز داریم workspaceId را هم فیلتر کنیم
   */
  async findById(id: number | string, params: any = {}): Promise<any> {
    const { include = this.defaultInclude, filters } = params;

    const where = {
      id: typeof id === "string" ? parseInt(id) : id,
      ...filters,
    };

    const record = await this.model.findFirst({
      where: where,
      include,
    });

    if (!record) {
      throw new Error(`${this.modelName} not found`);
    }

    return record;
  }
}

export class SupportChatServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      null as any, // Schema will be added later
      null as any,
      searchFields,
      relations
    );
    this.connect = connects;
    this.repository = new Repository();
  }

  /**
   * Create ticket from guest user (unregistered)
   * Called from public website
   */
  async createGuestTicket(
    data: {
      name: string;
      email?: string;
      phone?: string;
      subject: string;
      description: string;
      categoryId?: number;
      ipAddress?: string;
      country?: string;
      userAgent?: string;
    },
    workspaceId: number
  ) {
    console.log("🔄 [Support Chat Service] createGuestTicket - Data:", {
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      workspaceId,
    });

    // Create or get guest user
    let guestUser = await prisma.supportGuestUser.findFirst({
      where: {
        workspaceId,
        OR: [
          data.email ? { email: data.email } : {},
          data.phone ? { phone: data.phone } : {},
        ].filter((obj) => Object.keys(obj).length > 0),
      },
    });

    if (!guestUser) {
      guestUser = await prisma.supportGuestUser.create({
        data: {
          workspaceId,
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          ipAddress: data.ipAddress || "unknown",
          country: data.country || null,
          userAgent: data.userAgent || null,
        },
      });
    }

    // Generate unique ticket number
    const ticketCount = await prisma.supportChatTicket.count({
      where: { workspaceId },
    });
    const ticketNumber = `GUEST-${workspaceId}-${ticketCount + 1}`;

    // Create ticket
    const ticket = await prisma.supportChatTicket.create({
      data: {
        workspaceId,
        ticketNumber,
        subject: data.subject,
        description: data.description,
        categoryId: data.categoryId,
        guestUserId: guestUser.id,
        priority: SupportPriority.MEDIUM,
        status: SupportTicketStatus.OPEN,
      },
      include,
    });

    // Create initial message
    await prisma.supportChatMessage.create({
      data: {
        ticketId: ticket.id,
        guestUserId: guestUser.id,
        body: data.description,
        messageType: "TEXT",
      },
    });

    console.log("✅ [Support Chat Service] Guest ticket created:", {
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      guestUserId: guestUser.id,
    });

    return ticket;
  }

  /**
   * Create ticket from registered customer
   * Only workspace users with "User" role
   */
  async createCustomerTicket(
    data: {
      subject: string;
      description: string;
      categoryId?: number;
      priority?: SupportPriority;
    },
    context: AuthContext
  ) {
    console.log("🔄 [Support Chat Service] createCustomerTicket - Data:", {
      subject: data.subject,
      workspaceUserId: context.workspaceUser?.id,
      workspaceId: context.workspaceId,
    });

    if (!context.workspaceUser?.id) {
      throw new Error("User not authenticated");
    }

    // Verify user has User role (customer)
    const customer = await prisma.workspaceUser.findFirst({
      where: {
        id: context.workspaceUser.id,
        workspaceId: context.workspaceId!,
      },
      include: { role: true },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    // Generate unique ticket number
    const ticketCount = await prisma.supportChatTicket.count({
      where: { workspaceId: context.workspaceId! },
    });
    const ticketNumber = `CUST-${context.workspaceId}-${ticketCount + 1}`;

    // Create ticket
    const ticket = await prisma.supportChatTicket.create({
      data: {
        workspaceId: context.workspaceId!,
        ticketNumber,
        subject: data.subject,
        description: data.description,
        categoryId: data.categoryId,
        workspaceUserId: customer.id,
        priority: data.priority || SupportPriority.MEDIUM,
        status: SupportTicketStatus.OPEN,
      },
      include,
    });

    // Create initial message
    await prisma.supportChatMessage.create({
      data: {
        ticketId: ticket.id,
        workspaceUserId: customer.id,
        body: data.description,
        messageType: "TEXT",
      },
    });

    // Create history entry
    await prisma.supportChatHistory.create({
      data: {
        ticketId: ticket.id,
        changedById: customer.id,
        action: "CREATED",
        note: `Ticket created by ${
          customer.displayName || customer.name || "customer"
        }`,
      },
    });

    console.log("✅ [Support Chat Service] Customer ticket created:", {
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      customerId: customer.id,
    });

    return ticket;
  }

  /**
   * Get all tickets for support team (Admin only)
   */
  async getAllTickets(
    params: {
      page?: number;
      limit?: number;
      status?: SupportTicketStatus;
      priority?: SupportPriority;
      assignedToId?: number;
      categoryId?: number;
    },
    context: AuthContext
  ) {
    if (!context.workspaceUser?.id) {
      throw new Error("User not authenticated");
    }

    // Verify user has support chat access
    const user = await prisma.workspaceUser.findFirst({
      where: {
        id: context.workspaceUser.id,
        workspaceId: context.workspaceId!,
      },
      include: { role: true },
    });

    if (!user || !canAccessSupportChat(user.role)) {
      throw new Error("Only support team members can access all tickets");
    }

    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      workspaceId: context.workspaceId!,
    };

    if (params.status) where.status = params.status;
    if (params.priority) where.priority = params.priority;
    if (params.assignedToId) where.assignedToId = params.assignedToId;
    if (params.categoryId) where.categoryId = params.categoryId;

    const [tickets, total] = await Promise.all([
      prisma.supportChatTicket.findMany({
        where,
        include,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.supportChatTicket.count({ where }),
    ]);

    return {
      data: tickets,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get customer's own tickets
   */
  async getMyTickets(
    params: { page?: number; limit?: number },
    context: AuthContext
  ) {
    if (!context.workspaceUser?.id) {
      throw new Error("User not authenticated");
    }

    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      prisma.supportChatTicket.findMany({
        where: {
          workspaceId: context.workspaceId!,
          workspaceUserId: context.workspaceUser.id,
        },
        include,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.supportChatTicket.count({
        where: {
          workspaceId: context.workspaceId!,
          workspaceUserId: context.workspaceUser.id,
        },
      }),
    ]);

    return {
      data: tickets,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get ticket by ID
   * - Admin can see all tickets
   * - Customer can only see their own tickets
   */
  async getTicketById(ticketId: number, context: AuthContext) {
    if (!context.workspaceUser?.id) {
      throw new Error("User not authenticated");
    }

    const ticket = await prisma.supportChatTicket.findFirst({
      where: {
        id: ticketId,
        workspaceId: context.workspaceId!,
      },
      include,
    });

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // Check permissions
    const user = await prisma.workspaceUser.findFirst({
      where: { id: context.workspaceUser.id },
      include: { role: true },
    });

    const hasAccess = canAccessSupportChat(user?.role);
    const isOwner = ticket.workspaceUserId === context.workspaceUser.id;

    if (!hasAccess && !isOwner) {
      throw new Error("You don't have permission to view this ticket");
    }

    return ticket;
  }

  /**
   * Get ticket messages
   */
  async getTicketMessages(
    ticketId: number,
    params: { page?: number; limit?: number },
    context: AuthContext
  ) {
    if (!context.workspaceUser?.id) {
      throw new Error("User not authenticated");
    }

    // Verify access to ticket
    await this.getTicketById(ticketId, context);

    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.supportChatMessage.findMany({
        where: {
          ticketId,
          isVisible: true,
        },
        include: includeMessage,
        orderBy: {
          createdAt: "asc",
        },
        skip,
        take: limit,
      }),
      prisma.supportChatMessage.count({
        where: {
          ticketId,
          isVisible: true,
        },
      }),
    ]);

    return {
      data: messages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Send message to ticket
   */
  async sendMessage(
    ticketId: number,
    data: { body: string; messageType?: string },
    context: AuthContext
  ) {
    console.log("📤 [Support Chat Service] sendMessage:", {
      ticketId,
      messageLength: data.body.length,
      workspaceUserId: context.workspaceUser?.id,
      workspaceId: context.workspaceId,
    });

    if (!context.workspaceUser?.id) {
      console.error("❌ [Support Chat Service] User not authenticated");
      throw new Error("User not authenticated");
    }

    // Verify access to ticket
    console.log("🔍 [Support Chat Service] Verifying ticket access...");
    const ticket = await this.getTicketById(ticketId, context);

    // Determine if sender is support agent or customer
    const user = await prisma.workspaceUser.findFirst({
      where: { id: context.workspaceUser.id },
      include: { role: true },
    });

    const isSupportAgent = canAccessSupportChat(user?.role);
    console.log("👤 [Support Chat Service] Sender role:", {
      isSupportAgent,
      roleName: user?.role?.name,
    });

    const message = await prisma.supportChatMessage.create({
      data: {
        ticketId,
        supportAgentId: isSupportAgent ? context.workspaceUser.id : undefined,
        workspaceUserId: !isSupportAgent ? context.workspaceUser.id : undefined,
        body: data.body,
        messageType: "TEXT",
        isInternal: false,
      },
      include: includeMessage,
    });

    console.log("✅ [Support Chat Service] Message created:", message.id);
    return message;
  }

  /**
   * Edit support chat message (owner only)
   */
  async editMessage(
    ticketId: number,
    messageId: number,
    data: { body: string },
    context: AuthContext
  ) {
    if (!context.workspaceUser?.id) {
      throw new Error("User not authenticated");
    }
    // Ensure user has access to the ticket
    await this.getTicketById(ticketId, context);

    const existing = await prisma.supportChatMessage.findFirst({
      where: {
        id: messageId,
        ticketId,
        OR: [
          { supportAgentId: context.workspaceUser.id },
          { workspaceUserId: context.workspaceUser.id },
        ],
      },
    });
    if (!existing) throw new Error("Message not found or not owned by user");

    const updated = await prisma.supportChatMessage.update({
      where: { id: messageId },
      data: { body: data.body },
      include: includeMessage,
    });
    // add isEdited hint for UI
    return { ...updated, isEdited: true } as any;
  }

  /**
   * Soft delete support chat message (owner only)
   */
  async deleteMessage(
    ticketId: number,
    messageId: number,
    context: AuthContext
  ) {
    if (!context.workspaceUser?.id) {
      throw new Error("User not authenticated");
    }
    await this.getTicketById(ticketId, context);

    const existing = await prisma.supportChatMessage.findFirst({
      where: {
        id: messageId,
        ticketId,
        OR: [
          { supportAgentId: context.workspaceUser.id },
          { workspaceUserId: context.workspaceUser.id },
        ],
      },
    });
    if (!existing) throw new Error("Message not found or not owned by user");

    const updated = await prisma.supportChatMessage.update({
      where: { id: messageId },
      data: { isVisible: false },
      include: includeMessage,
    });
    // add isDeleted hint for UI
    return { ...updated, isDeleted: true } as any;
  }

  /**
   * Assign ticket to support agent (Admin only)
   */
  async assignTicket(
    ticketId: number,
    assignToId: number,
    context: AuthContext
  ) {
    if (!context.workspaceUser?.id) {
      throw new Error("User not authenticated");
    }

    // Verify user has permission to assign tickets
    const user = await prisma.workspaceUser.findFirst({
      where: {
        id: context.workspaceUser.id,
        workspaceId: context.workspaceId!,
      },
      include: { role: true },
    });

    if (!user || !canAssignTickets(user.role)) {
      throw new Error("Only support team members can assign tickets");
    }

    // Verify assignee has support chat access
    const assignee = await prisma.workspaceUser.findFirst({
      where: {
        id: assignToId,
        workspaceId: context.workspaceId!,
      },
      include: { role: true },
    });

    if (!assignee || !canAccessSupportChat(assignee.role)) {
      throw new Error("Can only assign to support team members");
    }

    const ticket = await prisma.supportChatTicket.update({
      where: {
        id: ticketId,
        workspaceId: context.workspaceId!,
      },
      data: {
        assignedToId: assignToId,
      },
      include,
    });

    // Create history entry
    await prisma.supportChatHistory.create({
      data: {
        ticketId,
        changedById: context.workspaceUser.id,
        action: "ASSIGNED",
        note: `Ticket assigned to ${assignee.displayName}`,
      },
    });

    return ticket;
  }

  /**
   * Update ticket status (Admin only)
   */
  async updateTicketStatus(
    ticketId: number,
    status: SupportTicketStatus,
    context: AuthContext
  ) {
    if (!context.workspaceUser?.id) {
      throw new Error("User not authenticated");
    }

    // Verify user has permission to update ticket status
    const user = await prisma.workspaceUser.findFirst({
      where: {
        id: context.workspaceUser.id,
        workspaceId: context.workspaceId!,
      },
      include: { role: true },
    });

    if (!user || !canUpdateTicketStatus(user.role)) {
      throw new Error("Only support team members can update ticket status");
    }

    const ticket = await prisma.supportChatTicket.update({
      where: {
        id: ticketId,
        workspaceId: context.workspaceId!,
      },
      data: {
        status,
        closedAt: status === SupportTicketStatus.CLOSED ? new Date() : null,
      },
      include,
    });

    // Create history entry
    await prisma.supportChatHistory.create({
      data: {
        ticketId,
        changedById: context.workspaceUser.id,
        action: "STATUS_CHANGED",
        note: `Status changed to ${status}`,
      },
    });

    return ticket;
  }

  /**
   * Get support categories
   */
  async getCategories(context: AuthContext) {
    const categories = await prisma.supportChatCategory.findMany({
      where: {
        workspaceId: context.workspaceId!,
      },
      include: {
        parent: true,
        _count: {
          select: {
            tickets: true,
            children: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return categories;
  }

  /**
   * Get support labels
   */
  async getLabels(context: AuthContext) {
    const labels = await prisma.supportChatLabel.findMany({
      where: {
        workspaceId: context.workspaceId!,
      },
      include: {
        _count: {
          select: {
            tickets: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return labels;
  }
}
