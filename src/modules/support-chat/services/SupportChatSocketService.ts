/**
 * Support Chat Socket Service
 * Handles real-time operations for support chat via Socket.IO
 */

import prisma from "@/lib/prisma";
import { MESSAGE_CONFIG, SUPPORT_ERROR_MESSAGES } from "../constants";
import {
  RateLimitData,
  SupportMessage,
  SupportMessagePayload,
  ValidationResult,
} from "../types";
import { logger } from "../utils/logger";

export class SupportChatSocketService {
  private rateLimits = new Map<string, RateLimitData>();

  /**
   * Validates message payload
   */
  validateMessage(payload: SupportMessagePayload): ValidationResult {
    const errors: string[] = [];

    if (!payload.ticketId || typeof payload.ticketId !== "number") {
      errors.push(SUPPORT_ERROR_MESSAGES.INVALID_TICKET_ID);
    }

    if (!payload.body || typeof payload.body !== "string") {
      errors.push(SUPPORT_ERROR_MESSAGES.INVALID_MESSAGE_BODY);
    }

    if (
      payload.body &&
      payload.body.trim().length < MESSAGE_CONFIG.MIN_LENGTH
    ) {
      errors.push(SUPPORT_ERROR_MESSAGES.INVALID_MESSAGE_BODY);
    }

    if (payload.body && payload.body.length > MESSAGE_CONFIG.MAX_LENGTH) {
      errors.push(SUPPORT_ERROR_MESSAGES.MESSAGE_TOO_LONG);
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
   * Checks rate limiting for user
   */
  checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const rateLimit = this.rateLimits.get(userId) || {
      messageCount: 0,
      lastReset: now,
    };

    // Reset if window has passed
    if (now - rateLimit.lastReset >= MESSAGE_CONFIG.RATE_LIMIT.WINDOW_MS) {
      rateLimit.messageCount = 0;
      rateLimit.lastReset = now;
    }

    // Check if limit exceeded
    if (rateLimit.messageCount >= MESSAGE_CONFIG.RATE_LIMIT.MAX_MESSAGES) {
      return false;
    }

    // Increment counter
    rateLimit.messageCount++;
    this.rateLimits.set(userId, rateLimit);

    return true;
  }

  /**
   * Saves message to database
   */
  async saveMessage(
    payload: SupportMessagePayload,
    senderId: number,
    isGuest: boolean = false
  ): Promise<SupportMessage> {
    try {
      const messageData: any = {
        ticketId: payload.ticketId,
        body: this.sanitizeMessage(payload.body),
        messageType: "TEXT",
        isInternal: payload.isInternal || false,
        replyToId: payload.replyToId,
        replySnapshot: payload.replySnapshot,
      };

      // Set appropriate user ID based on type
      if (isGuest) {
        messageData.guestUserId = senderId;
      } else {
        messageData.workspaceUserId = senderId;
      }

      const savedMessage = await prisma.supportChatMessage.create({
        data: messageData,
        include: {
          guestUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          workspaceUser: {
            select: {
              id: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          supportAgent: {
            select: {
              id: true,
              displayName: true,
            },
          },
          replyTo: {
            include: {
              guestUser: { select: { id: true, name: true } },
              workspaceUser: {
                select: {
                  id: true,
                  user: { select: { name: true } },
                },
              },
              supportAgent: { select: { id: true, displayName: true } },
            },
          },
        },
      });

      logger.info("Support message saved successfully", {
        messageId: savedMessage.id,
        ticketId: payload.ticketId,
        senderId,
        isGuest,
      });

      return {
        ...savedMessage,
        createdAt: savedMessage.createdAt.toISOString(),
        updatedAt: savedMessage.updatedAt?.toISOString(),
        editedAt: savedMessage.editedAt?.toISOString(),
        deletedAt: savedMessage.deletedAt?.toISOString(),
      } as SupportMessage;
    } catch (error: any) {
      logger.error("Failed to save support message", {
        ticketId: payload.ticketId,
        senderId,
        isGuest,
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
    isGuest: boolean = false
  ): Promise<SupportMessage> {
    try {
      // Verify message ownership
      const whereClause: any = {
        id: messageId,
      };

      if (isGuest) {
        whereClause.guestUserId = senderId;
      } else {
        whereClause.workspaceUserId = senderId;
      }

      const message = await prisma.supportChatMessage.findFirst({
        where: whereClause,
        select: { id: true },
      });

      if (!message) {
        throw new Error(SUPPORT_ERROR_MESSAGES.NOT_SENDER_OF_MESSAGE);
      }

      const updatedMessage = await prisma.supportChatMessage.update({
        where: { id: messageId },
        data: {
          body: this.sanitizeMessage(newBody),
          isEdited: true,
          editedAt: new Date(),
          editCount: { increment: 1 },
        },
        include: {
          guestUser: { select: { id: true, name: true } },
          workspaceUser: {
            select: {
              id: true,
              user: { select: { name: true } },
            },
          },
          supportAgent: { select: { id: true, displayName: true } },
          replyTo: {
            include: {
              guestUser: { select: { id: true, name: true } },
              workspaceUser: {
                select: {
                  id: true,
                  user: { select: { name: true } },
                },
              },
              supportAgent: { select: { id: true, displayName: true } },
            },
          },
        },
      });

      logger.info("Support message updated successfully", {
        messageId,
        senderId,
        isGuest,
      });

      return {
        ...updatedMessage,
        createdAt: updatedMessage.createdAt.toISOString(),
        updatedAt: updatedMessage.updatedAt?.toISOString(),
        editedAt: updatedMessage.editedAt?.toISOString(),
        deletedAt: updatedMessage.deletedAt?.toISOString(),
      } as SupportMessage;
    } catch (error: any) {
      logger.error("Failed to update support message", {
        messageId,
        senderId,
        isGuest,
        error: error?.message,
      });
      throw error;
    }
  }

  /**
   * Soft deletes message in database
   */
  async deleteMessage(
    messageId: number,
    senderId: number,
    isGuest: boolean = false
  ): Promise<SupportMessage> {
    try {
      // Verify message ownership
      const whereClause: any = {
        id: messageId,
      };

      if (isGuest) {
        whereClause.guestUserId = senderId;
      } else {
        whereClause.workspaceUserId = senderId;
      }

      const message = await prisma.supportChatMessage.findFirst({
        where: whereClause,
        select: { id: true },
      });

      if (!message) {
        throw new Error(SUPPORT_ERROR_MESSAGES.NOT_SENDER_OF_MESSAGE);
      }

      const deletedMessage = await prisma.supportChatMessage.update({
        where: { id: messageId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          body: "پیام حذف شده",
        },
        include: {
          guestUser: { select: { id: true, name: true } },
          workspaceUser: {
            select: {
              id: true,
              user: { select: { name: true } },
            },
          },
          supportAgent: { select: { id: true, displayName: true } },
          replyTo: {
            include: {
              guestUser: { select: { id: true, name: true } },
              workspaceUser: {
                select: {
                  id: true,
                  user: { select: { name: true } },
                },
              },
              supportAgent: { select: { id: true, displayName: true } },
            },
          },
        },
      });

      logger.info("Support message deleted successfully", {
        messageId,
        senderId,
        isGuest,
      });

      return {
        ...deletedMessage,
        createdAt: deletedMessage.createdAt.toISOString(),
        updatedAt: deletedMessage.updatedAt?.toISOString(),
        editedAt: deletedMessage.editedAt?.toISOString(),
        deletedAt: deletedMessage.deletedAt?.toISOString(),
      } as SupportMessage;
    } catch (error: any) {
      logger.error("Failed to delete support message", {
        messageId,
        senderId,
        isGuest,
        error: error?.message,
      });
      throw error;
    }
  }

  /**
   * Gets ticket information for authorization
   */
  async getTicketInfo(ticketId: number) {
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

      return ticket;
    } catch (error: any) {
      logger.error("Failed to get ticket info", {
        ticketId,
        error: error?.message,
      });
      return null;
    }
  }

  /**
   * Creates message ACK payload
   */
  createMessageAck(tempId: string, messageId: number, message: SupportMessage) {
    return {
      tempId,
      messageId,
      savedMessage: message,
    };
  }

  /**
   * Creates message broadcast payload
   */
  createMessageBroadcast(
    message: SupportMessage,
    roomKey: string,
    recipientsCount: number
  ) {
    return {
      ...message,
      roomKey,
      recipientsCount,
    };
  }
}
