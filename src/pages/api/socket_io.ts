/**
 * Socket.IO Server for Internal Chat
 * Clean, modular implementation following Clean Code principles
 */

import { INTERNAL_SOCKET_EVENTS } from "@/modules/internal-chat/constants";
import { InternalChatHandlers } from "@/modules/internal-chat/handlers/internalChatHandlers";
import { logger } from "@/modules/internal-chat/utils/logger";
import type { NextApiRequest } from "next";
import { Server as IOServer } from "socket.io";
import type { NextApiResponseServerIO } from "./types";

/**
 * Socket.IO Server Endpoint
 * Path: /api/socket_io
 *
 * Handles real-time communication for:
 * - Internal Chat (درون سازمانی)
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
    const internalChatHandlers = new InternalChatHandlers(io);

    // Handle connections
    io.on("connection", (socket) => {
      logger.info("Socket connected", { socketId: socket.id });

      // ==================== INTERNAL CHAT EVENTS ====================

      // Internal Chat Join
      socket.on(INTERNAL_SOCKET_EVENTS.JOIN, (roomId: number) => {
        internalChatHandlers.handleJoin(socket, roomId);
      });

      // Internal Chat Leave
      socket.on(INTERNAL_SOCKET_EVENTS.LEAVE, (roomId: number) => {
        internalChatHandlers.handleLeave(socket, roomId);
      });

      // Internal Chat Message
      socket.on(INTERNAL_SOCKET_EVENTS.MESSAGE, (payload: any) => {
        internalChatHandlers.handleMessage(socket, payload);
      });

      // Internal Chat Message Edit
      socket.on(INTERNAL_SOCKET_EVENTS.MESSAGE_EDIT, (payload: any) => {
        internalChatHandlers.handleMessageEdit(socket, payload);
      });

      // Internal Chat Message Delete
      socket.on(INTERNAL_SOCKET_EVENTS.MESSAGE_DELETE, (payload: any) => {
        internalChatHandlers.handleMessageDelete(socket, payload);
      });

      // Internal Chat Typing
      socket.on(INTERNAL_SOCKET_EVENTS.TYPING, (payload: any) => {
        internalChatHandlers.handleTyping(socket, payload);
      });

      // Internal Chat Read Receipt
      socket.on(INTERNAL_SOCKET_EVENTS.READ_RECEIPT, (payload: any) => {
        internalChatHandlers.handleReadReceipt(socket, payload);
      });

      // Internal Chat User Status
      socket.on(INTERNAL_SOCKET_EVENTS.USER_STATUS, (userId: number) => {
        internalChatHandlers.handleUserStatus(socket, userId);
      });

      // ==================== DISCONNECT ====================

      // Handle disconnection
      socket.on("disconnect", () => {
        internalChatHandlers.handleDisconnect(socket);
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
