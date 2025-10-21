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
   * Gets ticket by ID (alias for getTicketInfo)
   */
  async getTicketById(ticketId: number): Promise<TicketInfo | null> {
    return this.getTicketInfo(ticketId);
  }

  /**
   * Updates ticket user association
   */
  async updateTicketUser(
    ticketId: number,
    userData: {
      workspaceUserId: number;
      workspaceId: number;
    }
  ): Promise<boolean> {
    try {
      await prisma.supportChatTicket.update({
        where: { id: ticketId },
        data: {
          workspaceUserId: userData.workspaceUserId,
          workspaceId: userData.workspaceId,
        },
      });

      logger.info("Ticket user updated", {
        ticketId,
        workspaceUserId: userData.workspaceUserId,
        workspaceId: userData.workspaceId,
      });

      return true;
    } catch (error: any) {
      logger.error("Failed to update ticket user", {
        ticketId,
        error: error?.message,
      });
      return false;
    }
  }

  /**
   * Creates a new message
   */
  async createMessage(data: {
    ticketId: number;
    body: string;
    messageType: string;
    isInternal: boolean;
    isVisible: boolean;
    workspaceUserId?: number | null;
    guestUserId?: number | null;
  }) {
    try {
      const message = await prisma.supportChatMessage.create({
        data: {
          ticketId: data.ticketId,
          body: data.body,
          messageType: data.messageType as any,
          isInternal: data.isInternal,
          isVisible: data.isVisible,
          workspaceUserId: data.workspaceUserId,
          guestUserId: data.guestUserId,
        },
        include: {
          supportAgent: {
            select: {
              id: true,
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          guestUser: {
            select: {
              id: true,
              name: true,
            },
          },
          workspaceUser: {
            select: {
              id: true,
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      // Create sender object for frontend
      const messageWithSender = {
        ...message,
        sender: message.supportAgent
          ? {
              name: message.supportAgent.user.name,
              type: "support" as const,
            }
          : message.workspaceUser
          ? {
              name: message.workspaceUser.user.name,
              type: "registered" as const,
              workspaceUserId: message.workspaceUser.id,
            }
          : message.guestUser
          ? {
              name: message.guestUser.name,
              type: "guest" as const,
              guestId: message.guestUser.id,
            }
          : undefined,
      };

      return messageWithSender;
    } catch (error: any) {
      logger.error("Failed to create message", {
        ticketId: data.ticketId,
        error: error?.message,
      });
      throw error;
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

      // Create sender object for frontend
      const messageWithSender = {
        ...savedMessage,
        sender: savedMessage.supportAgent
          ? {
              name: savedMessage.supportAgent.displayName,
              type: "support" as const,
            }
          : savedMessage.workspaceUser
          ? {
              name: savedMessage.workspaceUser.user.name,
              type: "registered" as const,
              workspaceUserId: savedMessage.workspaceUser.id,
            }
          : savedMessage.guestUser
          ? {
              name: savedMessage.guestUser.name,
              type: "guest" as const,
              guestId: savedMessage.guestUser.id,
            }
          : undefined,
      };

      return messageWithSender;
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
