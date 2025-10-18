/**
 * Internal Chat Event Handlers
 * Handles all internal chat related socket events
 */

import { logger } from "@/modules/support-chat/utils/logger";
import { Server as IOServer, Socket } from "socket.io";
import { INTERNAL_SOCKET_EVENTS } from "../constants";
import {
  InternalChatService,
  InternalMessagePayload,
} from "../services/InternalChatService";

export class InternalChatHandlers {
  private io: IOServer;
  private service: InternalChatService;
  private onlineUsers: Map<string, number>; // socketId -> workspaceUserId
  private userSockets: Map<number, Set<string>>; // workspaceUserId -> Set<socketId>

  constructor(io: IOServer) {
    this.io = io;
    this.service = new InternalChatService();
    this.onlineUsers = new Map();
    this.userSockets = new Map();
  }

  /**
   * Handles internal-chat:join event
   */
  async handleJoin(socket: Socket, roomId: number): Promise<void> {
    try {
      if (!roomId) {
        this.emitError(socket, "INVALID_ROOM_ID", "roomId is required");
        return;
      }

      const currentUserId = this.onlineUsers.get(socket.id);
      if (!currentUserId) {
        this.emitError(socket, "UNAUTHORIZED", "Unknown user");
        return;
      }

      // Check if user is member of room
      const isMember = await this.service.isUserMemberOfRoom(
        roomId,
        currentUserId
      );
      if (!isMember) {
        this.emitError(socket, "FORBIDDEN", "Not a member of this room", {
          roomId,
        });
        return;
      }

      const roomKey = `internal-chat-room:${roomId}`;
      socket.join(roomKey);

      logger.info("Internal chat room joined", {
        socketId: socket.id,
        roomId,
        userId: currentUserId,
      });

      socket.emit(INTERNAL_SOCKET_EVENTS.JOINED, { roomId });
    } catch (error: any) {
      logger.error("Error in internal-chat:join", {
        error: error?.message,
        stack: error?.stack,
        socketId: socket.id,
      });
      this.emitError(socket, "JOIN_ERROR", "Failed to join room");
    }
  }

  /**
   * Handles internal-chat:leave event
   */
  handleLeave(socket: Socket, roomId: number): void {
    if (!roomId) return;

    const roomKey = `internal-chat-room:${roomId}`;
    socket.leave(roomKey);

    logger.debug("Internal chat room left", {
      socketId: socket.id,
      roomId,
    });
  }

  /**
   * Handles internal-chat:message event
   */
  async handleMessage(
    socket: Socket,
    payload: InternalMessagePayload
  ): Promise<void> {
    try {
      if (!payload?.roomId || !payload?.body) {
        this.emitError(
          socket,
          "INVALID_PAYLOAD",
          "roomId and body are required"
        );
        return;
      }

      const roomKey = `internal-chat-room:${payload.roomId}`;
      const currentUserId = this.onlineUsers.get(socket.id) || payload.senderId;

      if (!currentUserId) {
        this.emitError(socket, "UNAUTHORIZED", "Unknown sender");
        return;
      }

      // Validate message
      const validation = this.service.validateMessage(payload);
      if (!validation.isValid) {
        this.emitError(
          socket,
          "MESSAGE_VALIDATION_FAILED",
          "Message validation failed",
          {
            errors: validation.errors,
          }
        );
        return;
      }

      // Check membership
      const isMember = await this.service.isUserMemberOfRoom(
        payload.roomId,
        currentUserId
      );
      if (!isMember) {
        this.emitError(socket, "FORBIDDEN", "Not a member of this room", {
          roomId: payload.roomId,
        });
        return;
      }

      // Save message
      const savedMessage = await this.service.saveMessage(
        payload,
        currentUserId
      );

      // ACK to sender
      socket.emit(INTERNAL_SOCKET_EVENTS.MESSAGE_ACK, {
        tempId: payload.tempId,
        message: { ...savedMessage, isRead: false },
      });

      // Broadcast to others
      const out = { ...savedMessage } as any;
      if (!out.replyTo && payload.replySnapshot) {
        out.replyTo = payload.replySnapshot;
        out.replyToId = payload.replyToId;
      }

      socket.to(roomKey).emit(INTERNAL_SOCKET_EVENTS.MESSAGE_RECEIVED, out);

      logger.info("Internal message sent", {
        roomId: payload.roomId,
        messageId: savedMessage.id,
        senderId: currentUserId,
      });
    } catch (error: any) {
      logger.error("Error in internal-chat:message", {
        error: error?.message,
        stack: error?.stack,
        socketId: socket.id,
      });
      this.emitError(socket, "MESSAGE_ERROR", "Failed to handle message");
    }
  }

  /**
   * Handles internal-chat:message-edit event
   */
  async handleMessageEdit(
    socket: Socket,
    payload: {
      roomId: number;
      messageId: number;
      body: string;
    }
  ): Promise<void> {
    try {
      if (!payload?.roomId || !payload?.messageId) return;

      const currentUserId = this.onlineUsers.get(socket.id);
      if (!currentUserId) {
        this.emitError(socket, "UNAUTHORIZED", "Unknown user");
        return;
      }

      const success = await this.service.updateMessage(
        payload.messageId,
        payload.body,
        currentUserId,
        payload.roomId
      );

      if (!success) {
        this.emitError(
          socket,
          "EDIT_ERROR",
          "Not allowed to edit this message"
        );
        return;
      }

      const roomKey = `internal-chat-room:${payload.roomId}`;
      socket.to(roomKey).emit(INTERNAL_SOCKET_EVENTS.MESSAGE_EDITED, payload);

      logger.debug("Internal message edited", payload);
    } catch (error: any) {
      logger.error("Error in internal-chat:message-edit", {
        error: error?.message,
        socketId: socket.id,
      });
      this.emitError(socket, "EDIT_ERROR", "Failed to edit message");
    }
  }

  /**
   * Handles internal-chat:message-delete event
   */
  async handleMessageDelete(
    socket: Socket,
    payload: {
      roomId: number;
      messageId: number;
    }
  ): Promise<void> {
    try {
      if (!payload?.roomId || !payload?.messageId) return;

      const currentUserId = this.onlineUsers.get(socket.id);
      if (!currentUserId) {
        this.emitError(socket, "UNAUTHORIZED", "Unknown user");
        return;
      }

      const success = await this.service.deleteMessage(
        payload.messageId,
        currentUserId,
        payload.roomId
      );

      if (!success) {
        this.emitError(
          socket,
          "DELETE_ERROR",
          "Not allowed to delete this message"
        );
        return;
      }

      const roomKey = `internal-chat-room:${payload.roomId}`;
      socket.to(roomKey).emit(INTERNAL_SOCKET_EVENTS.MESSAGE_DELETED, payload);

      logger.debug("Internal message deleted", payload);
    } catch (error: any) {
      logger.error("Error in internal-chat:message-delete", {
        error: error?.message,
        socketId: socket.id,
      });
      this.emitError(socket, "DELETE_ERROR", "Failed to delete message");
    }
  }

  /**
   * Handles internal-chat:typing event
   */
  handleTyping(
    socket: Socket,
    payload: {
      roomId: number;
      isTyping: boolean;
      userId?: number;
    }
  ): void {
    if (!payload?.roomId) return;

    const roomKey = `internal-chat-room:${payload.roomId}`;
    socket.to(roomKey).emit(INTERNAL_SOCKET_EVENTS.TYPING_RECEIVED, {
      roomId: payload.roomId,
      isTyping: payload.isTyping,
      userId: payload.userId,
    });
  }

  /**
   * Handles internal-chat:read-receipt event
   */
  async handleReadReceipt(
    socket: Socket,
    payload: {
      roomId: number;
      lastReadMessageId?: number;
    }
  ): Promise<void> {
    try {
      if (!payload?.roomId) {
        this.emitError(
          socket,
          "INVALID_ROOM_ID",
          "roomId is required for read receipt"
        );
        return;
      }

      const currentUserId = this.onlineUsers.get(socket.id);
      if (!currentUserId) {
        this.emitError(socket, "UNAUTHORIZED", "Unknown user");
        return;
      }

      const success = await this.service.saveReadReceipts(
        payload.roomId,
        currentUserId,
        payload.lastReadMessageId
      );

      if (!success) {
        return;
      }

      const roomKey = `internal-chat-room:${payload.roomId}`;
      socket.to(roomKey).emit(INTERNAL_SOCKET_EVENTS.READ_RECEIPT_RECEIVED, {
        roomId: payload.roomId,
        lastReadMessageId: payload.lastReadMessageId,
      });

      logger.debug("Read receipt sent", {
        roomId: payload.roomId,
        userId: currentUserId,
        lastReadMessageId: payload.lastReadMessageId,
      });
    } catch (error: any) {
      logger.error("Error in internal-chat:read-receipt", {
        error: error?.message,
        socketId: socket.id,
      });
      this.emitError(
        socket,
        "READ_RECEIPT_ERROR",
        "Failed to persist read receipt"
      );
    }
  }

  /**
   * Handles internal-chat:user-status event
   */
  handleUserStatus(socket: Socket, userId: number): void {
    if (!userId) return;

    this.onlineUsers.set(socket.id, userId);

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socket.id);

    // Broadcast user online status
    socket.broadcast.emit(INTERNAL_SOCKET_EVENTS.USER_ONLINE, { userId });

    logger.debug("Internal chat user online", { userId });
  }

  /**
   * Handles socket disconnection
   */
  handleDisconnect(socket: Socket): void {
    const userId = this.onlineUsers.get(socket.id);
    if (userId) {
      this.onlineUsers.delete(socket.id);
      const userSocketSet = this.userSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.delete(socket.id);

        // If user has no more sockets, they're offline
        if (userSocketSet.size === 0) {
          this.userSockets.delete(userId);
          socket.broadcast.emit(INTERNAL_SOCKET_EVENTS.USER_OFFLINE, {
            userId: userId,
          });
          logger.debug("Internal chat user offline", { userId });
        }
      }
    }

    logger.info("Internal chat user disconnected", {
      socketId: socket.id,
      userId,
    });
  }

  /**
   * Emits error to socket
   */
  private emitError(
    socket: Socket,
    code: string,
    message: string,
    meta?: any
  ): void {
    socket.emit(INTERNAL_SOCKET_EVENTS.ERROR, {
      code,
      message,
      ...(meta || {}),
    });
  }
}
