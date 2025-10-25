/**
 * Socket.IO Server for Internal Chat and Support Chat
 * Clean, modular implementation following Clean Code principles
 */

import { INTERNAL_SOCKET_EVENTS } from "@/modules/internal-chat/constants";
import { InternalChatHandlers } from "@/modules/internal-chat/handlers/internalChatHandlers";
import { logger, socketLogger, SocketMiddleware } from "@/utils/socketUtils";
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
    const internalChatHandlers = new InternalChatHandlers(io);

    // Apply authentication and workspace verification middleware
    io.use(SocketMiddleware.authenticate);
    io.use(SocketMiddleware.verifyWorkspaceAccess);

    // Handle connections
    io.on("connection", (socket) => {
      console.log("✅ [Socket.IO] Socket connected successfully:", socket.id);
      console.log("✅ [Socket.IO] Socket user:", (socket as any).user);
      console.log(
        "✅ [Socket.IO] Socket workspaceId:",
        (socket as any).workspaceId
      );
      console.log(
        "✅ [Socket.IO] Socket workspaceUserId:",
        (socket as any).workspaceUserId
      );
      console.log("✅ [Socket.IO] Socket userRole:", (socket as any).userRole);
      socketLogger.connection(socket.id);

      // ==================== INTERNAL CHAT EVENTS ====================

      // Internal Chat Join
      socket.on(INTERNAL_SOCKET_EVENTS.JOIN, (roomId: number) => {
        console.log("🏠 [Socket.IO] User trying to join room:", roomId);
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
      // Handle disconnection
      socket.on("disconnect", () => {
        internalChatHandlers.handleDisconnect(socket);
        // supportChatHandlers.handleDisconnect(socket); // Removed - support-chat module deleted
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
