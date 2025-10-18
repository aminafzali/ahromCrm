/**
 * Support Chat Repository
 * Handles API calls for support chat functionality
 */

import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import apiClient from "@/@Client/lib/axios";
import { SupportMessage, SupportTicket } from "../types";

export class SupportChatRepository extends BaseRepository<
  SupportTicket,
  number
> {
  constructor() {
    super("support-chat");
  }

  /**
   * Get all tickets for support team
   */
  async getAllTickets(
    params: {
      page?: number;
      limit?: number;
      status?: string;
      priority?: string;
      assignedToId?: number;
      categoryId?: number;
    } = {}
  ): Promise<any> {
    const response = await apiClient.get("/support-chat/tickets", { params });
    return response.data;
  }

  /**
   * Get customer's own tickets
   */
  async getMyTickets(
    params: {
      page?: number;
      limit?: number;
    } = {}
  ): Promise<any> {
    const response = await apiClient.get("/support-chat/my-tickets", {
      params,
    });
    return response.data;
  }

  /**
   * Get ticket by ID
   */
  async getTicket(ticketId: number): Promise<SupportTicket> {
    const response = await apiClient.get(`/support-chat/tickets/${ticketId}`);
    return response.data;
  }

  /**
   * Get ticket by ID (alias for compatibility)
   */
  async getTicketById(ticketId: number): Promise<SupportTicket> {
    return this.getTicket(ticketId);
  }

  /**
   * Get ticket messages
   */
  async getTicketMessages(
    ticketId: number,
    params: { page?: number; limit?: number } = {}
  ): Promise<any> {
    const response = await apiClient.get(
      `/support-chat/tickets/${ticketId}/messages`,
      { params }
    );
    return response.data;
  }

  /**
   * Send message to ticket
   */
  async sendMessage(
    ticketId: number,
    data: { body: string; messageType?: string }
  ): Promise<SupportMessage> {
    const response = await apiClient.post(
      `/support-chat/tickets/${ticketId}/messages`,
      data
    );
    return response.data;
  }

  /**
   * Edit message
   */
  async editMessage(
    ticketId: number,
    messageId: number,
    data: { body: string }
  ): Promise<SupportMessage> {
    const response = await apiClient.patch(
      `/support-chat/tickets/${ticketId}/messages/${messageId}`,
      data
    );
    return response.data;
  }

  /**
   * Delete message
   */
  async deleteMessage(ticketId: number, messageId: number): Promise<void> {
    await apiClient.delete(
      `/support-chat/tickets/${ticketId}/messages/${messageId}`
    );
  }

  /**
   * Assign ticket to support agent
   */
  async assignTicket(
    ticketId: number,
    assignedToId: number
  ): Promise<SupportTicket> {
    const response = await apiClient.post(
      `/support-chat/tickets/${ticketId}/assign`,
      {
        assignedToId,
      }
    );
    return response.data;
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(
    ticketId: number,
    status: string
  ): Promise<SupportTicket> {
    const response = await apiClient.patch(
      `/support-chat/tickets/${ticketId}/status`,
      {
        status,
      }
    );
    return response.data;
  }

  /**
   * Get support categories
   */
  async getCategories(): Promise<any[]> {
    const response = await apiClient.get("/support-chat/categories");
    return response.data;
  }

  /**
   * Get support labels
   */
  async getLabels(): Promise<any[]> {
    const response = await apiClient.get("/support-chat/labels");
    return response.data;
  }

  /**
   * Create ticket from guest
   */
  async createGuestTicket(data: {
    name: string;
    email?: string;
    phone?: string;
    subject: string;
    description: string;
    categoryId?: number;
  }): Promise<SupportTicket> {
    const response = await apiClient.post("/support-chat/guest-tickets", data);
    return response.data;
  }

  /**
   * Create ticket from registered user
   */
  async createCustomerTicket(data: {
    subject: string;
    description: string;
    categoryId?: number;
    priority?: string;
  }): Promise<SupportTicket> {
    const response = await apiClient.post(
      "/support-chat/customer-tickets",
      data
    );
    return response.data;
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(ticketId: number): Promise<number> {
    try {
      const response = await apiClient.get(
        `/support-chat/tickets/${ticketId}/unread-count`
      );
      return response.data?.count || 0;
    } catch (error) {
      console.warn(`Failed to get unread count for ticket ${ticketId}:`, error);
      return 0;
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(ticketId: number): Promise<{ marked: number } | void> {
    try {
      const response = await apiClient.post(
        `/support-chat/tickets/${ticketId}/mark-read`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to mark ticket ${ticketId} as read:`, error);
    }
  }
}
