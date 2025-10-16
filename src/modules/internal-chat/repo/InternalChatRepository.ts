import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import apiClient from "@/@Client/lib/axios";
import { InternalChatRoom } from "../types";

export class InternalChatRepository extends BaseRepository<
  InternalChatRoom,
  number
> {
  constructor() {
    super("internal-chat");
  }

  /**
   * Get or create direct room with another user
   */
  async getOrCreateDirectRoom(workspaceUserId: number): Promise<any> {
    const response = await apiClient.post(`/internal-chat/rooms?type=direct`, {
      workspaceUserId,
    });
    return response.data;
  }

  /**
   * Get or create team room
   */
  async getOrCreateTeamRoom(teamId: number): Promise<any> {
    const response = await apiClient.post(`/internal-chat/rooms?type=team`, {
      teamId,
    });
    return response.data;
  }

  /**
   * Get messages for a room
   */
  async getMessages(
    roomId: number,
    params: { page?: number; limit?: number } = {}
  ): Promise<any> {
    const { page = 1, limit = 200 } = params;
    const response = await apiClient.get(`/internal-chat/messages`, {
      params: { roomId, page, limit },
    });
    return response.data;
  }

  /**
   * Send a message to a room
   */
  async sendMessage(
    roomId: number,
    data: { body: string; replyToId?: number }
  ): Promise<any> {
    const response = await apiClient.post(`/internal-chat/messages`, {
      roomId,
      ...data,
    });
    return response.data;
  }

  async editMessage(messageId: number, text: string): Promise<any> {
    const response = await apiClient.patch(`/internal-chat/messages`, {
      messageId,
      text,
    });
    return response.data;
  }

  async deleteMessage(messageId: number): Promise<any> {
    const response = await apiClient.delete(`/internal-chat/messages`, {
      params: { messageId },
    });
    return response.data;
  }

  /**
   * Get admin users and teams for contacts list
   */
  async getContacts(): Promise<{ users: any[]; teams: any[] }> {
    console.log("🔄 [Internal Chat Repo] Fetching contacts from API...");
    const response = await apiClient.get(`/internal-chat/contacts`);
    console.log("✅ [Internal Chat Repo] API Response:", response.data);
    return response.data;
  }

  /**
   * Get room members
   */
  async getMembers(roomId: number): Promise<any> {
    const response = await apiClient.get(
      `/internal-chat/rooms/${roomId}/members`
    );
    return response.data;
  }

  /**
   * Add member to room
   */
  async addMember(
    roomId: number,
    data: { workspaceUserId: number; role?: string }
  ): Promise<any> {
    const response = await apiClient.post(
      `/internal-chat/rooms/${roomId}/members`,
      data
    );
    return response.data;
  }

  /**
   * Get unread message count for a user's direct room
   */
  async getUnreadCount(workspaceUserId: number): Promise<number> {
    try {
      const response = await apiClient.get(
        `/internal-chat/unread-count/${workspaceUserId}`
      );
      return response.data?.count || 0;
    } catch (error) {
      console.warn(
        `Failed to get unread count for user ${workspaceUserId}:`,
        error
      );
      return 0;
    }
  }

  /**
   * Mark all messages in a room as read
   */
  async markAsRead(roomId: number): Promise<{ marked: number } | void> {
    try {
      const res = await apiClient.post(`/internal-chat/mark-as-read/${roomId}`);
      return res.data;
    } catch (error) {
      console.error(`Failed to mark room ${roomId} as read:`, error);
    }
  }
}
