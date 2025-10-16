import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import apiClient from "@/@Client/lib/axios";
import { SupportTicketWithRelations } from "../types";

export class SupportChatRepository extends BaseRepository<
  SupportTicketWithRelations,
  number
> {
  constructor() {
    super("support-chat");
  }

  /**
   * Create ticket from guest (public)
   */
  async createGuestTicket(
    data: {
      name: string;
      email?: string;
      phone?: string;
      subject: string;
      description: string;
      categoryId?: number;
    },
    workspaceId: number
  ): Promise<any> {
    const response = await apiClient.post(`/support-chat/public/tickets`, {
      ...data,
      workspaceId,
    });
    return response.data;
  }

  /**
   * Create ticket from customer
   */
  async createCustomerTicket(data: {
    subject: string;
    description: string;
    categoryId?: number;
    priority?: string;
  }): Promise<any> {
    const response = await apiClient.post(`/support-chat/tickets`, data);
    return response.data;
  }

  /**
   * Get all tickets (Admin only)
   */
  async getAllTickets(params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    assignedToId?: number;
    categoryId?: number;
  }): Promise<any> {
    const response = await apiClient.get(`/support-chat/tickets`, {
      params,
    });
    return response.data;
  }

  /**
   * Get customer's own tickets
   */
  async getMyTickets(params?: { page?: number; limit?: number }): Promise<any> {
    const response = await apiClient.get(`/support-chat/my-tickets`, {
      params,
    });
    return response.data;
  }

  /**
   * Get ticket by ID
   */
  async getTicketById(ticketId: number): Promise<any> {
    const response = await apiClient.get(`/support-chat/tickets/${ticketId}`);
    return response.data;
  }

  /**
   * Get ticket messages
   */
  async getTicketMessages(
    ticketId: number,
    params?: { page?: number; limit?: number }
  ): Promise<any> {
    const response = await apiClient.get(
      `/support-chat/tickets/${ticketId}/messages`,
      {
        params,
      }
    );
    return response.data;
  }

  /**
   * Send message to ticket
   */
  async sendMessage(
    ticketId: number,
    data: { body: string; messageType?: string; isInternal?: boolean }
  ): Promise<any> {
    const response = await apiClient.post(
      `/support-chat/tickets/${ticketId}/messages`,
      data
    );
    return response.data;
  }

  async editMessage(ticketId: number, messageId: number, text: string) {
    const response = await apiClient.patch(
      `/support-chat/tickets/${ticketId}/messages`,
      { messageId, text }
    );
    return response.data;
  }

  async deleteMessage(ticketId: number, messageId: number) {
    const response = await apiClient.delete(
      `/support-chat/tickets/${ticketId}/messages`,
      { params: { messageId } }
    );
    return response.data;
  }

  /**
   * Assign ticket (Admin only)
   */
  async assignTicket(ticketId: number, assignToId: number): Promise<any> {
    const response = await apiClient.patch(
      `/support-chat/tickets/${ticketId}/assign`,
      {
        assignToId,
      }
    );
    return response.data;
  }

  /**
   * Update ticket status (Admin only)
   */
  async updateTicketStatus(ticketId: number, status: string): Promise<any> {
    const response = await apiClient.patch(
      `/support-chat/tickets/${ticketId}/status`,
      {
        status,
      }
    );
    return response.data;
  }

  /**
   * Get categories
   */
  async getCategories(): Promise<any> {
    const response = await apiClient.get(`/support-chat/categories`);
    return response.data;
  }

  /**
   * Get labels
   */
  async getLabels(): Promise<any> {
    const response = await apiClient.get(`/support-chat/labels`);
    return response.data;
  }
}
