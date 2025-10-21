/**
 * Socket.IO Server for Internal Chat and Support Chat
 * Clean, modular implementation following Clean Code principles
 */

import { INTERNAL_SOCKET_EVENTS } from "@/modules/internal-chat/constants";
import { InternalChatHandlers } from "@/modules/internal-chat/handlers/internalChatHandlers";
import { SOCKET_EVENTS } from "@/modules/support-chat/constants";
import { SupportChatHandlers } from "@/modules/support-chat/handlers/supportChatHandlers";
import { SocketMiddleware } from "@/modules/support-chat/middleware/socketMiddleware";
import { logger, socketLogger } from "@/modules/support-chat/utils/logger";
import type { NextApiRequest } from "next";
import { Server as IOServer } from "socket.io";
import type { NextApiResponseServerIO } from "./types";

/**
 * Socket.IO Server Endpoint
 * Path: /api/socket_io
 *
 * Handles real-time communication for:
 * - Internal Chat (درون سازمانی)
 * - Support Chat (پشتیبانی)
 */

let io: IOServer | null = null;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (res.socket.server.io) {
    console.log("Socket.IO already running");
    res.end();
    return;
  }

  try {
    // Initialize Socket.IO server
    io = new IOServer(res.socket.server, {
      path: "/api/socket_io",
      cors: {
        origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    // Set response
    res.socket.server.io = io;

    // Initialize chat handlers
    const supportChatHandlers = new SupportChatHandlers(io);
    const internalChatHandlers = new InternalChatHandlers(io);

    // Apply authentication middleware
    io.use(SocketMiddleware.authenticate);

    // Handle connections
    io.on("connection", (socket) => {
      socketLogger.connection(socket.id);

      // ==================== INTERNAL CHAT EVENTS ====================

      // Internal Chat Join
      socket.on(INTERNAL_SOCKET_EVENTS.JOIN, (roomId: number) => {
        SocketMiddleware.updateActivity(socket);
        internalChatHandlers.handleJoin(socket, roomId);
      });

      // Internal Chat Leave
      socket.on(INTERNAL_SOCKET_EVENTS.LEAVE, (roomId: number) => {
        SocketMiddleware.updateActivity(socket);
        internalChatHandlers.handleLeave(socket, roomId);
      });

      // Internal Chat Message
      socket.on(INTERNAL_SOCKET_EVENTS.MESSAGE, (payload: any) => {
        SocketMiddleware.updateActivity(socket);
        internalChatHandlers.handleMessage(socket, payload);
      });

      // Internal Chat Message Edit
      socket.on(INTERNAL_SOCKET_EVENTS.MESSAGE_EDIT, (payload: any) => {
        SocketMiddleware.updateActivity(socket);
        internalChatHandlers.handleMessageEdit(socket, payload);
      });

      // Internal Chat Message Delete
      socket.on(INTERNAL_SOCKET_EVENTS.MESSAGE_DELETE, (payload: any) => {
        SocketMiddleware.updateActivity(socket);
        internalChatHandlers.handleMessageDelete(socket, payload);
      });

      // Internal Chat Typing
      socket.on(INTERNAL_SOCKET_EVENTS.TYPING, (payload: any) => {
        SocketMiddleware.updateActivity(socket);
        internalChatHandlers.handleTyping(socket, payload);
      });

      // Internal Chat Read Receipt
      socket.on(INTERNAL_SOCKET_EVENTS.READ_RECEIPT, (payload: any) => {
        SocketMiddleware.updateActivity(socket);
        internalChatHandlers.handleReadReceipt(socket, payload);
      });

      // Internal Chat User Status
      socket.on(INTERNAL_SOCKET_EVENTS.USER_STATUS, (userId: number) => {
        SocketMiddleware.updateActivity(socket);
        internalChatHandlers.handleUserStatus(socket, userId);
      });

      // ==================== SUPPORT CHAT EVENTS ====================

      // Support Chat Join
      socket.on(SOCKET_EVENTS.JOIN, (ticketId: number) => {
        SocketMiddleware.updateActivity(socket);
        supportChatHandlers.handleJoin(socket, ticketId);
      });

      // Support Chat Message
      socket.on(SOCKET_EVENTS.MESSAGE, (payload: any) => {
        SocketMiddleware.updateActivity(socket);
        supportChatHandlers.handleMessage(socket, payload);
      });

      // Support Chat Send Message
      socket.on("support-chat:send-message", (payload: any) => {
        SocketMiddleware.updateActivity(socket);
        supportChatHandlers.handleSendMessage(socket, payload);
      });

      // Support Chat Typing
      socket.on(SOCKET_EVENTS.TYPING, (payload: any) => {
        SocketMiddleware.updateActivity(socket);
        supportChatHandlers.handleTyping(socket, payload);
      });

      // Support Chat Message Edit
      socket.on(SOCKET_EVENTS.MESSAGE_EDIT, (payload: any) => {
        SocketMiddleware.updateActivity(socket);
        supportChatHandlers.handleMessageEdit(socket, payload);
      });

      // Support Chat Message Delete
      socket.on(SOCKET_EVENTS.MESSAGE_DELETE, (payload: any) => {
        SocketMiddleware.updateActivity(socket);
        supportChatHandlers.handleMessageDelete(socket, payload);
      });

      // Support Chat Message Edit (alternative event name)
      socket.on("support-chat:message-edit", (payload: any) => {
        SocketMiddleware.updateActivity(socket);
        supportChatHandlers.handleMessageEdit(socket, payload);
      });

      // Support Chat Message Delete (alternative event name)
      socket.on("support-chat:message-delete", (payload: any) => {
        SocketMiddleware.updateActivity(socket);
        supportChatHandlers.handleMessageDelete(socket, payload);
      });

      // Support Chat User Type Change
      socket.on("support-chat:user-type-change", (payload: any) => {
        SocketMiddleware.updateActivity(socket);
        supportChatHandlers.handleUserTypeChange(socket, payload);
      });

      // ==================== DISCONNECT ====================

      // Handle disconnection
      socket.on("disconnect", () => {
        internalChatHandlers.handleDisconnect(socket);
        supportChatHandlers.handleDisconnect(socket);
      });

      // Error handling
      socket.on("error", (error: any) => {
        logger.error("Socket error", {
          socketId: socket.id,
          error: error?.message || "Unknown error",
        });
      });
    });

    logger.info("Socket.IO server initialized successfully");
    res.end();
  } catch (error: any) {
    logger.error("Failed to initialize Socket.IO server", {
      error: error?.message,
      stack: error?.stack,
    });
    res.status(500).json({ error: "Socket.IO initialization failed" });
  }
}

// Graceful shutdown
process.on("SIGTERM", () => {
  if (io) {
    logger.info("Shutting down Socket.IO server");
    io.close();
  }
});

process.on("SIGINT", () => {
  if (io) {
    logger.info("Shutting down Socket.IO server");
    io.close();
  }
});
