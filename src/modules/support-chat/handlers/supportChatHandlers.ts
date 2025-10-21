/**
 * Support Chat Event Handlers
 * Handles all support chat related socket events
 */

import { Server as IOServer, Socket } from "socket.io";
import { ERROR_MESSAGES, SOCKET_EVENTS, SUCCESS_MESSAGES } from "../constants";
import { SocketMiddleware } from "../middleware/socketMiddleware";
import { RateLimitService } from "../services/RateLimitService";
import { SupportChatService } from "../services/SupportChatService";
import {
  logger,
  messageLogger,
  roomLogger,
  socketLogger,
} from "../utils/logger";
import { generateRoomKey, validateTicketId } from "../utils/roomManagement";
import {
  getUserId,
  getUserType,
  isGuestUser,
  isRegisteredUser,
} from "../utils/socketAuth";

export class SupportChatHandlers {
  private io: IOServer;
  private service: SupportChatService;

  constructor(io: IOServer) {
    this.io = io;
    this.service = new SupportChatService();
  }

  /**
   * Handles support-chat:join event
   */
  async handleJoin(socket: Socket, ticketId: number): Promise<void> {
    try {
      // Validate socket data
      const validation = SocketMiddleware.validateSocketData(socket);
      if (!validation.isValid) {
        SocketMiddleware.emitError(socket, validation.error!);
        return;
      }

      // Validate ticket ID
      if (!validateTicketId(ticketId)) {
        SocketMiddleware.emitError(socket, ERROR_MESSAGES.INVALID_TICKET_ID);
        return;
      }

      const userInfo = SocketMiddleware.getUserInfo(socket)!;
      const isRegistered = isRegisteredUser(userInfo);
      const isGuest = isGuestUser(userInfo);
      const userType = getUserType(userInfo);
      const userId = getUserId(userInfo);

      logger.info("Support chat join request", {
        ticketId,
        userType,
        userId,
        socketId: socket.id,
      });

      // Get ticket information
      let ticket = await this.service.getTicketInfo(ticketId);

      // Create ticket for registered users if not found
      if (
        !ticket &&
        isRegistered &&
        userInfo.workspaceUserId &&
        userInfo.workspaceId
      ) {
        const newTicketId = await this.service.createTicketForRegisteredUser(
          userInfo.workspaceUserId,
          userInfo.workspaceId
        );

        if (newTicketId) {
          ticket = await this.service.getTicketInfo(newTicketId);
          if (ticket) {
            ticketId = newTicketId; // Update ticketId to the new one
          }
        }
      }

      // Handle case where guest user becomes registered
      if (
        ticket &&
        isRegistered &&
        userInfo.workspaceUserId &&
        userInfo.workspaceId &&
        ticket.guestUserId &&
        !ticket.workspaceUserId
      ) {
        // Update ticket to associate with registered user
        await this.service.updateTicketUser(ticketId, {
          workspaceUserId: userInfo.workspaceUserId,
          workspaceId: userInfo.workspaceId,
        });

        // Refresh ticket info
        ticket = await this.service.getTicketInfo(ticketId);
      }

      if (!ticket) {
        logger.error("Ticket not found", { ticketId, userType, userId });
        SocketMiddleware.emitError(socket, ERROR_MESSAGES.TICKET_NOT_FOUND);
        return;
      }

      // Validate user authorization
      const isAuthorized = this.service.validateUserAuthorization(
        userInfo,
        ticket
      );
      logger.info("Authorization check", {
        ticketId,
        userType,
        userId,
        isAuthorized,
        ticketGuestUserId: ticket.guestUserId,
        ticketWorkspaceUserId: ticket.workspaceUserId,
        userGuestId: userInfo.guestId,
        userWorkspaceUserId: userInfo.workspaceUserId,
        socketId: socket.id,
      });

      if (!isAuthorized) {
        roomLogger.unauthorized(socket.id, ticketId);
        SocketMiddleware.emitError(socket, ERROR_MESSAGES.UNAUTHORIZED);
        return;
      }

      // Join room
      const roomKey = generateRoomKey(ticketId);
      socket.join(roomKey);
      SocketMiddleware.setTicketId(socket, ticketId);

      // Get room size
      const roomSize = this.io.sockets.adapter.rooms.get(roomKey)?.size || 0;
      roomLogger.joined(roomKey, roomSize);

      logger.info(SUCCESS_MESSAGES.ROOM_JOINED, {
        ticketId,
        ticketNumber: ticket.ticketNumber,
        userType,
        userId,
        socketId: socket.id,
        roomKey,
        roomSize,
      });

      SocketMiddleware.emitSuccess(socket, SOCKET_EVENTS.JOINED, { ticketId });
    } catch (error: any) {
      logger.error("Error in support-chat:join", {
        error: error?.message,
        stack: error?.stack,
        socketId: socket.id,
      });
      SocketMiddleware.emitError(socket, "Internal server error");
    }
  }

  /**
   * Handles support-chat:message event
   */
  async handleMessage(socket: Socket, payload: any): Promise<void> {
    try {
      // Validate socket data
      const validation = SocketMiddleware.validateSocketData(socket);
      if (!validation.isValid) {
        SocketMiddleware.emitError(socket, validation.error!);
        return;
      }

      const userInfo = SocketMiddleware.getUserInfo(socket)!;
      const ticketId = SocketMiddleware.getTicketId(socket) || payload.ticketId;

      if (!ticketId) {
        SocketMiddleware.emitError(socket, ERROR_MESSAGES.INVALID_TICKET_ID);
        return;
      }

      // Validate message payload
      const messageValidation = this.service.validateMessage(payload);
      if (!messageValidation.isValid) {
        SocketMiddleware.emitError(
          socket,
          ERROR_MESSAGES.MESSAGE_VALIDATION_FAILED,
          {
            errors: messageValidation.errors,
          }
        );
        return;
      }

      const isGuest = isGuestUser(userInfo);
      const userType = getUserType(userInfo);
      const userId = getUserId(userInfo);

      // Check rate limiting
      const rateLimitUserId = isRegisteredUser(userInfo)
        ? `registered_${userInfo.workspaceUserId}`
        : isGuest
        ? `guest_${userInfo.guestId}`
        : `anonymous_${socket.id}`;

      if (!RateLimitService.canSendMessage(rateLimitUserId)) {
        const status = RateLimitService.getRateLimitStatus(rateLimitUserId);
        SocketMiddleware.emitError(
          socket,
          "Rate limit exceeded. Please wait before sending another message.",
          {
            remaining: status.remaining,
            timeUntilReset: status.timeUntilReset,
          }
        );
        return;
      }

      logger.info("Support chat message received", {
        ticketId,
        userType,
        userId,
        bodyLength: payload.body?.length || 0,
        socketId: socket.id,
      });

      // Save message to database
      const savedMessage = await this.service.saveMessage(
        payload,
        userInfo,
        ticketId
      );

      // Send ACK to sender
      if (payload.tempId) {
        socket.emit(SOCKET_EVENTS.MESSAGE_ACK, {
          tempId: payload.tempId,
          messageId: savedMessage.id,
          savedMessage,
        });
        messageLogger.ack(payload.tempId, savedMessage.id);
      }

      // Broadcast message to room
      const roomKey = generateRoomKey(ticketId);
      const recipientsCount =
        this.io.sockets.adapter.rooms.get(roomKey)?.size || 0;

      // Broadcast message to room
      this.io.to(roomKey).emit(SOCKET_EVENTS.MESSAGE_RECEIVED, savedMessage);

      messageLogger.sent(ticketId, savedMessage.id, recipientsCount);

      logger.info("Support chat message sent", {
        ticketId,
        messageId: savedMessage.id,
        recipientsCount,
        userType,
        userId,
      });
    } catch (error: any) {
      logger.error("Error in support-chat:message", {
        error: error?.message,
        stack: error?.stack,
        socketId: socket.id,
      });
      SocketMiddleware.emitError(socket, "Failed to send message");
    }
  }

  /**
   * Handles support-chat:typing event
   */
  handleTyping(socket: Socket, payload: any): void {
    try {
      const validation = SocketMiddleware.validateSocketData(socket);
      if (!validation.isValid) {
        return;
      }

      const userInfo = SocketMiddleware.getUserInfo(socket)!;
      const ticketId = SocketMiddleware.getTicketId(socket) || payload.ticketId;

      if (!ticketId) {
        return;
      }

      const roomKey = generateRoomKey(ticketId);
      const userId = getUserId(userInfo);
      const userType = getUserType(userInfo);

      // Broadcast typing status to other users in room
      socket.to(roomKey).emit(SOCKET_EVENTS.TYPING_RECEIVED, {
        ticketId,
        isTyping: payload.isTyping,
        userId,
        userType,
      });

      logger.debug("Typing status broadcasted", {
        ticketId,
        userId,
        isTyping: payload.isTyping,
      });
    } catch (error: any) {
      logger.error("Error in support-chat:typing", {
        error: error?.message,
        socketId: socket.id,
      });
    }
  }

  /**
   * Handles support-chat:message-edit event
   */
  async handleMessageEdit(socket: Socket, payload: any): Promise<void> {
    try {
      const validation = SocketMiddleware.validateSocketData(socket);
      if (!validation.isValid) {
        SocketMiddleware.emitError(socket, validation.error!);
        return;
      }

      const userInfo = SocketMiddleware.getUserInfo(socket)!;
      const ticketId = SocketMiddleware.getTicketId(socket) || payload.ticketId;

      if (!ticketId || !payload.messageId || !payload.newBody) {
        SocketMiddleware.emitError(socket, "Invalid edit request");
        return;
      }

      // Validate new message body
      const messageValidation = this.service.validateMessage({
        ticketId,
        body: payload.newBody,
      });

      if (!messageValidation.isValid) {
        SocketMiddleware.emitError(
          socket,
          ERROR_MESSAGES.MESSAGE_VALIDATION_FAILED,
          {
            errors: messageValidation.errors,
          }
        );
        return;
      }

      // Update message in database
      const success = await this.service.updateMessage(
        payload.messageId,
        payload.newBody,
        userInfo
      );

      if (!success) {
        SocketMiddleware.emitError(socket, "Failed to edit message");
        return;
      }

      // Broadcast edit to room
      const roomKey = generateRoomKey(ticketId);
      const editData = {
        messageId: payload.messageId,
        body: this.service.sanitizeMessage(payload.newBody),
        isEdited: true,
        editCount: 1, // This should be fetched from DB in real implementation
      };

      // Emit both event names for compatibility
      this.io.to(roomKey).emit(SOCKET_EVENTS.MESSAGE_EDITED, editData);
      this.io.to(roomKey).emit("support-chat:message-edited", editData);

      logger.info("Message edited successfully", {
        messageId: payload.messageId,
        ticketId,
        userId: getUserId(userInfo),
      });
    } catch (error: any) {
      logger.error("Error in support-chat:message-edit", {
        error: error?.message,
        socketId: socket.id,
      });
      SocketMiddleware.emitError(socket, "Failed to edit message");
    }
  }

  /**
   * Handles support-chat:message-delete event
   */
  async handleMessageDelete(socket: Socket, payload: any): Promise<void> {
    try {
      const validation = SocketMiddleware.validateSocketData(socket);
      if (!validation.isValid) {
        SocketMiddleware.emitError(socket, validation.error!);
        return;
      }

      const userInfo = SocketMiddleware.getUserInfo(socket)!;
      const ticketId = SocketMiddleware.getTicketId(socket) || payload.ticketId;

      if (!ticketId || !payload.messageId) {
        SocketMiddleware.emitError(socket, "Invalid delete request");
        return;
      }

      // Delete message in database
      const success = await this.service.deleteMessage(
        payload.messageId,
        userInfo
      );

      if (!success) {
        SocketMiddleware.emitError(socket, "Failed to delete message");
        return;
      }

      // Broadcast delete to room
      const roomKey = generateRoomKey(ticketId);
      const deleteData = {
        messageId: payload.messageId,
        isDeleted: true,
        deletedAt: new Date().toISOString(),
      };

      // Emit both event names for compatibility
      this.io.to(roomKey).emit(SOCKET_EVENTS.MESSAGE_DELETED, deleteData);
      this.io.to(roomKey).emit("support-chat:message-deleted", deleteData);

      logger.info("Message deleted successfully", {
        messageId: payload.messageId,
        ticketId,
        userId: getUserId(userInfo),
      });
    } catch (error: any) {
      logger.error("Error in support-chat:message-delete", {
        error: error?.message,
        socketId: socket.id,
      });
      SocketMiddleware.emitError(socket, "Failed to delete message");
    }
  }

  /**
   * Handles support-chat:send-message event
   */
  async handleSendMessage(socket: Socket, payload: any): Promise<void> {
    try {
      const { ticketId, body, messageType = "TEXT" } = payload;

      if (!ticketId || !body) {
        SocketMiddleware.emitError(socket, "Invalid message data");
        return;
      }

      // Get ticket info
      const ticket = await this.service.getTicketById(ticketId);
      if (!ticket) {
        SocketMiddleware.emitError(socket, "Ticket not found");
        return;
      }

      // Create message
      const message = await this.service.createMessage({
        ticketId,
        body,
        messageType,
        isInternal: false,
        isVisible: true,
        workspaceUserId: ticket.workspaceUserId,
        guestUserId: ticket.guestUserId,
      });

      // Broadcast to room
      const roomKey = generateRoomKey(ticketId);
      this.io.to(roomKey).emit(SOCKET_EVENTS.MESSAGE, message);

      logger.info("Message sent via socket", {
        ticketId,
        messageId: message.id,
        body: message.body,
        socketId: socket.id,
        roomKey,
      });
    } catch (error: any) {
      logger.error("Error in send-message handler", {
        error: error?.message,
        stack: error?.stack,
        socketId: socket.id,
      });
      SocketMiddleware.emitError(socket, "Failed to send message");
    }
  }

  /**
   * Handles user type change (guest to registered)
   */
  async handleUserTypeChange(socket: Socket, payload: any): Promise<void> {
    try {
      const validation = SocketMiddleware.validateSocketData(socket);
      if (!validation.isValid) {
        SocketMiddleware.emitError(socket, validation.error!);
        return;
      }

      const userInfo = SocketMiddleware.getUserInfo(socket)!;
      const ticketId = SocketMiddleware.getTicketId(socket);

      if (!ticketId) {
        SocketMiddleware.emitError(
          socket,
          "No ticket associated with this connection"
        );
        return;
      }

      // Check if user is now registered
      if (
        isRegisteredUser(userInfo) &&
        userInfo.workspaceUserId &&
        userInfo.workspaceId
      ) {
        const ticket = await this.service.getTicketInfo(ticketId);

        if (ticket && ticket.guestUserId && !ticket.workspaceUserId) {
          // Update ticket to associate with registered user
          const success = await this.service.updateTicketUser(ticketId, {
            workspaceUserId: userInfo.workspaceUserId,
            workspaceId: userInfo.workspaceId,
          });

          if (success) {
            // Notify all users in the room about the change
            this.io
              .to(`ticket_${ticketId}`)
              .emit("support-chat:user-type-changed", {
                ticketId,
                newUserType: "registered",
                workspaceUserId: userInfo.workspaceUserId,
              });

            logger.info("User type changed from guest to registered", {
              ticketId,
              workspaceUserId: userInfo.workspaceUserId,
              socketId: socket.id,
            });
          }
        }
      }
    } catch (error: any) {
      logger.error("Error handling user type change", {
        error: error?.message,
        socketId: socket.id,
      });
      SocketMiddleware.emitError(socket, "Failed to update user type");
    }
  }

  /**
   * Handles socket disconnection
   */
  handleDisconnect(socket: Socket): void {
    try {
      const userInfo = SocketMiddleware.getUserInfo(socket);
      const ticketId = SocketMiddleware.getTicketId(socket);

      if (userInfo && ticketId) {
        const userType = getUserType(userInfo);
        const userId = getUserId(userInfo);

        logger.info("Support chat user disconnected", {
          socketId: socket.id,
          ticketId,
          userType,
          userId,
        });
      }

      socketLogger.disconnection(socket.id);
    } catch (error: any) {
      logger.error("Error in disconnect handler", {
        error: error?.message,
        socketId: socket.id,
      });
    }
  }
}
