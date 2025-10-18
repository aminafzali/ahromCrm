/**
 * Support Chat Service
 * Business logic for support chat operations
 */

import prisma from "@/lib/prisma";
import { logger } from "../utils/logger";
import {
  MessagePayload,
  sanitizeMessageBody,
  validateMessagePayload,
} from "../utils/messageHandling";
import { TicketInfo, isAuthorizedToJoinRoom } from "../utils/roomManagement";
import { SocketUser, isGuestUser, isRegisteredUser } from "../utils/socketAuth";

export class SupportChatService {
  /**
   * Gets ticket information with relations
   */
  async getTicketInfo(ticketId: number): Promise<TicketInfo | null> {
    try {
      const ticket = await prisma.supportChatTicket.findUnique({
        where: { id: ticketId },
        include: {
          guestUser: {
            select: {
              id: true,
              name: true,
              ipAddress: true,
              country: true,
            },
          },
          workspaceUser: {
            select: {
              id: true,
              user: { select: { name: true, email: true } },
            },
          },
        },
      });

      return ticket as TicketInfo | null;
    } catch (error: any) {
      logger.error("Failed to get ticket info", {
        ticketId,
        error: error?.message,
      });
      return null;
    }
  }

  /**
   * Creates a new support chat ticket for registered users
   */
  async createTicketForRegisteredUser(
    workspaceUserId: number,
    workspaceId: number
  ): Promise<number | null> {
    try {
      const ticket = await prisma.supportChatTicket.create({
        data: {
          ticketNumber: `TICKET-${Date.now()}`,
          workspaceUserId,
          workspaceId,
          subject: "پشتیبانی از طریق چت",
          description: "درخواست پشتیبانی از طریق چت عمومی",
          status: "OPEN",
          priority: "MEDIUM",
        },
      });

      logger.info("Created ticket for registered user", {
        ticketId: ticket.id,
        workspaceUserId,
        workspaceId,
      });

      return ticket.id;
    } catch (error: any) {
      logger.error("Failed to create ticket for registered user", {
        workspaceUserId,
        workspaceId,
        error: error?.message,
      });
      return null;
    }
  }

  /**
   * Validates user authorization to join ticket
   */
  validateUserAuthorization(userInfo: SocketUser, ticket: TicketInfo): boolean {
    return isAuthorizedToJoinRoom(userInfo, ticket);
  }

  /**
   * Validates message payload
   */
  validateMessage(payload: MessagePayload): {
    isValid: boolean;
    errors: string[];
  } {
    return validateMessagePayload(payload);
  }

  /**
   * Sanitizes message body
   */
  sanitizeMessage(body: string): string {
    return sanitizeMessageBody(body);
  }

  /**
   * Saves message to database
   */
  async saveMessage(
    payload: MessagePayload,
    userInfo: SocketUser,
    ticketId: number
  ): Promise<any> {
    try {
      const isGuest = isGuestUser(userInfo);
      const isRegistered = isRegisteredUser(userInfo);

      const messageData: any = {
        ticketId,
        body: this.sanitizeMessage(payload.body),
        isInternal: payload.isInternal || false,
        replyToId: payload.replyToId,
        replySnapshot: payload.replySnapshot,
      };

      // Set appropriate user ID based on user type
      if (isGuest && userInfo.guestId) {
        messageData.guestUserId = parseInt(userInfo.guestId);
      } else if (isRegistered && userInfo.workspaceUserId) {
        messageData.workspaceUserId = userInfo.workspaceUserId;
      }

      const savedMessage = await prisma.supportChatMessage.create({
        data: messageData,
        include: {
          guestUser: {
            select: {
              id: true,
              name: true,
              ipAddress: true,
              country: true,
            },
          },
          workspaceUser: {
            select: {
              id: true,
              user: { select: { name: true, email: true } },
            },
          },
          supportAgent: {
            select: {
              id: true,
              displayName: true,
            },
          },
          replyTo: {
            select: {
              id: true,
              body: true,
              isDeleted: true,
              guestUser: { select: { name: true } },
              workspaceUser: { select: { user: { select: { name: true } } } },
              supportAgent: { select: { displayName: true } },
            },
          },
        },
      });

      logger.info("Message saved successfully", {
        messageId: savedMessage.id,
        ticketId,
        userType: isGuest ? "guest" : "registered",
        userId: isGuest ? userInfo.guestId : userInfo.workspaceUserId,
      });

      return savedMessage;
    } catch (error: any) {
      logger.error("Failed to save message", {
        ticketId,
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
    userInfo: SocketUser
  ): Promise<boolean> {
    try {
      const isGuest = isGuestUser(userInfo);
      const isRegistered = isRegisteredUser(userInfo);

      const whereClause: any = { id: messageId };

      // Ensure user can only edit their own messages
      if (isGuest && userInfo.guestId) {
        whereClause.guestUserId = parseInt(userInfo.guestId);
      } else if (isRegistered && userInfo.workspaceUserId) {
        whereClause.workspaceUserId = userInfo.workspaceUserId;
      }

      const updatedMessage = await prisma.supportChatMessage.update({
        where: whereClause,
        data: {
          body: this.sanitizeMessage(newBody),
          isEdited: true,
          editedAt: new Date(),
          editCount: { increment: 1 },
        },
      });

      logger.info("Message updated successfully", {
        messageId,
        userId: isGuest ? userInfo.guestId : userInfo.workspaceUserId,
      });

      return true;
    } catch (error: any) {
      logger.error("Failed to update message", {
        messageId,
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
    userInfo: SocketUser
  ): Promise<boolean> {
    try {
      const isGuest = isGuestUser(userInfo);
      const isRegistered = isRegisteredUser(userInfo);

      const whereClause: any = { id: messageId };

      // Ensure user can only delete their own messages
      if (isGuest && userInfo.guestId) {
        whereClause.guestUserId = parseInt(userInfo.guestId);
      } else if (isRegistered && userInfo.workspaceUserId) {
        whereClause.workspaceUserId = userInfo.workspaceUserId;
      }

      const deletedMessage = await prisma.supportChatMessage.update({
        where: whereClause,
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          body: "پیام حذف شده",
        },
      });

      logger.info("Message deleted successfully", {
        messageId,
        userId: isGuest ? userInfo.guestId : userInfo.workspaceUserId,
      });

      return true;
    } catch (error: any) {
      logger.error("Failed to delete message", {
        messageId,
        error: error?.message,
      });
      return false;
    }
  }
}
