/**
 * Internal Chat Service
 * Business logic for internal chat operations
 */

import prisma from "@/lib/prisma";
import { logger } from "@/utils/socketUtils";

export interface InternalMessagePayload {
  roomId: number;
  body: string;
  tempId?: string;
  senderId?: number;
  replyToId?: number;
  replySnapshot?: {
    id: number;
    body?: string | null;
    senderId?: number | null;
    sender?: { displayName?: string | null } | null;
    isDeleted?: boolean;
  } | null;
}

export interface InternalMessageValidationResult {
  isValid: boolean;
  errors: string[];
}

export class InternalChatService {
  /**
   * Validates message payload
   */
  validateMessage(
    payload: InternalMessagePayload
  ): InternalMessageValidationResult {
    const errors: string[] = [];

    if (!payload.roomId || typeof payload.roomId !== "number") {
      errors.push("Room ID is required and must be a number");
    }

    if (!payload.body || typeof payload.body !== "string") {
      errors.push("Message body is required and must be a string");
    }

    if (payload.body && payload.body.trim().length === 0) {
      errors.push("Message body cannot be empty");
    }

    if (payload.body && payload.body.length > 4000) {
      errors.push("Message body cannot exceed 4000 characters");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitizes message body
   */
  sanitizeMessage(body: string): string {
    return body.trim().replace(/\s+/g, " ");
  }

  /**
   * Checks if user is member of room
   */
  async isUserMemberOfRoom(roomId: number, userId: number): Promise<boolean> {
    try {
      const membership = await prisma.chatRoomMember.findFirst({
        where: {
          roomId,
          workspaceUserId: userId,
          leftAt: null,
        },
        select: { id: true },
      });

      return !!membership;
    } catch (error: any) {
      logger.error("Failed to check room membership", {
        roomId,
        userId,
        error: error?.message,
      });
      return false;
    }
  }

  /**
   * Saves message to database
   */
  async saveMessage(
    payload: InternalMessagePayload,
    senderId: number
  ): Promise<any> {
    try {
      const savedMessage = await prisma.chatMessage.create({
        data: {
          roomId: payload.roomId,
          senderId,
          body: this.sanitizeMessage(payload.body),
          replyToId: payload.replyToId,
          messageType: "TEXT",
        },
        include: {
          sender: { select: { id: true, displayName: true } },
          replyTo: {
            select: {
              id: true,
              body: true,
              senderId: true,
              sender: { select: { displayName: true } },
              isDeleted: true,
            },
          },
        },
      });

      // Update room activity
      await prisma.chatRoom.update({
        where: { id: payload.roomId },
        data: { lastActivityAt: new Date() },
      });

      logger.info("Internal message saved successfully", {
        messageId: savedMessage.id,
        roomId: payload.roomId,
        senderId,
      });

      return savedMessage;
    } catch (error: any) {
      logger.error("Failed to save internal message", {
        roomId: payload.roomId,
        senderId,
        error: error?.message,
        stack: error?.stack,
      });
      throw error;
    }
  }

  /**
   * Updates message in database
   */
  async updateMessage(
    messageId: number,
    newBody: string,
    senderId: number,
    roomId: number
  ): Promise<boolean> {
    try {
      // Ensure message is owned by user and in the same room
      const message = await prisma.chatMessage.findFirst({
        where: {
          id: messageId,
          roomId,
          senderId,
        },
        select: { id: true },
      });

      if (!message) {
        return false;
      }

      await prisma.chatMessage.update({
        where: { id: messageId },
        data: {
          body: this.sanitizeMessage(newBody),
          isEdited: true,
        },
      });

      logger.info("Internal message updated successfully", {
        messageId,
        roomId,
        senderId,
      });

      return true;
    } catch (error: any) {
      logger.error("Failed to update internal message", {
        messageId,
        roomId,
        senderId,
        error: error?.message,
      });
      return false;
    }
  }

  /**
   * Soft deletes message in database
   */
  async deleteMessage(
    messageId: number,
    senderId: number,
    roomId: number
  ): Promise<boolean> {
    try {
      // Ensure message is owned by user and in the same room
      const message = await prisma.chatMessage.findFirst({
        where: {
          id: messageId,
          roomId,
          senderId,
        },
        select: { id: true },
      });

      if (!message) {
        return false;
      }

      await prisma.chatMessage.update({
        where: { id: messageId },
        data: {
          isDeleted: true,
        },
      });

      logger.info("Internal message deleted successfully", {
        messageId,
        roomId,
        senderId,
      });

      return true;
    } catch (error: any) {
      logger.error("Failed to delete internal message", {
        messageId,
        roomId,
        senderId,
        error: error?.message,
      });
      return false;
    }
  }

  /**
   * Saves read receipts for messages
   */
  async saveReadReceipts(
    roomId: number,
    userId: number,
    lastReadMessageId?: number
  ): Promise<boolean> {
    try {
      // Get user's membership
      const membership = await prisma.chatRoomMember.findFirst({
        where: {
          roomId,
          workspaceUserId: userId,
          leftAt: null,
        },
        select: { id: true },
      });

      if (!membership) {
        return false;
      }

      // Get unread messages
      const unreadMessages = await prisma.chatMessage.findMany({
        where: {
          roomId,
          senderId: { not: userId },
          id: lastReadMessageId ? { lte: lastReadMessageId } : undefined,
          readReceipts: { none: { memberId: membership.id } },
        },
        select: { id: true },
      });

      if (unreadMessages.length > 0) {
        await prisma.chatMessageReadReceipt.createMany({
          data: unreadMessages.map((m) => ({
            messageId: m.id,
            memberId: membership.id,
            readAt: new Date(),
          })),
          skipDuplicates: true,
        });
      }

      logger.info("Read receipts saved successfully", {
        roomId,
        userId,
        messageCount: unreadMessages.length,
      });

      return true;
    } catch (error: any) {
      logger.error("Failed to save read receipts", {
        roomId,
        userId,
        error: error?.message,
      });
      return false;
    }
  }
}
