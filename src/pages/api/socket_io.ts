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
export default function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (!res.socket.server.io) {
    console.log("🚀 [Socket.IO] Initializing Server...");

    const io = new IOServer(res.socket.server as any, {
      path: "/api/socket_io",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    res.socket.server.io = io;

    // Track online users (shared for both internal and support)
    const onlineUsers = new Map<string, number>(); // socketId -> workspaceUserId
    const userSockets = new Map<number, Set<string>>(); // workspaceUserId -> Set<socketId>

    io.on("connection", (socket) => {
      console.log("✅ [Socket.IO] Client connected:", socket.id);

      // ==================== INTERNAL CHAT ====================

      /**
       * Join an internal chat room
       */
      socket.on("internal-chat:join", (roomId: number) => {
        console.log(
          `📥 [Internal Chat] Socket ${socket.id} joining room ${roomId}`
        );
        if (!roomId) {
          console.warn("⚠️ [Internal Chat] No roomId provided for join");
          return;
        }
        const roomKey = `internal-chat-room:${roomId}`;
        socket.join(roomKey);
        console.log(
          `✅ [Internal Chat] Socket ${socket.id} joined room ${roomId}`
        );
        socket.emit("internal-chat:joined", { roomId });
      });

      /**
       * Leave an internal chat room
       */
      socket.on("internal-chat:leave", (roomId: number) => {
        console.log(
          `📤 [Internal Chat] Socket ${socket.id} leaving room ${roomId}`
        );
        if (!roomId) return;
        const roomKey = `internal-chat-room:${roomId}`;
        socket.leave(roomKey);
        console.log(
          `✅ [Internal Chat] Socket ${socket.id} left room ${roomId}`
        );
      });

      /**
       * Send message to internal chat room
       */
      socket.on(
        "internal-chat:message",
        (payload: {
          roomId: number;
          body: string;
          tempId?: string;
          senderId?: number;
        }) => {
          console.log(`📨 [Internal Chat] Message received:`, {
            roomId: payload.roomId,
            bodyLength: payload.body?.length,
            tempId: payload.tempId,
            senderId: payload.senderId,
          });

          if (!payload?.roomId || !payload?.body) {
            console.warn("⚠️ [Internal Chat] Invalid message payload");
            return;
          }

          const roomKey = `internal-chat-room:${payload.roomId}`;

          // Get sockets in room for debugging
          const socketsInRoom = io.sockets.adapter.rooms.get(roomKey);
          console.log(
            `👥 [Internal Chat] Sockets in room ${payload.roomId}:`,
            socketsInRoom?.size || 0
          );

          const message = {
            id: payload.tempId || `temp-${Date.now()}`,
            roomId: payload.roomId,
            body: payload.body,
            senderId: payload.senderId,
            createdAt: new Date().toISOString(),
            tempId: payload.tempId,
            isRead: false, // پیام‌های جدید همیشه unread هستند برای گیرنده
          };

          // Broadcast to all clients in the room (except sender for now)
          socket.to(roomKey).emit("internal-chat:message", message);
          console.log(
            `💬 [Internal Chat] Message broadcasted to room ${payload.roomId}`
          );
        }
      );

      // Edit internal chat message
      socket.on(
        "internal-chat:message-edit",
        (payload: { roomId: number; messageId: number; body: string }) => {
          if (!payload?.roomId || !payload?.messageId) return;
          const roomKey = `internal-chat-room:${payload.roomId}`;
          console.log("✏️ [Internal Chat] Message edited: ", payload);
          socket.to(roomKey).emit("internal-chat:message-edited", payload);
        }
      );

      // Delete internal chat message
      socket.on(
        "internal-chat:message-delete",
        (payload: { roomId: number; messageId: number }) => {
          if (!payload?.roomId || !payload?.messageId) return;
          const roomKey = `internal-chat-room:${payload.roomId}`;
          console.log("🗑️ [Internal Chat] Message deleted: ", payload);
          socket.to(roomKey).emit("internal-chat:message-deleted", payload);
        }
      );

      /**
       * Typing indicator for internal chat
       */
      socket.on(
        "internal-chat:typing",
        (payload: { roomId: number; isTyping: boolean; userId?: number }) => {
          if (!payload?.roomId) return;
          const roomKey = `internal-chat-room:${payload.roomId}`;

          socket.to(roomKey).emit("internal-chat:typing", {
            roomId: payload.roomId,
            isTyping: payload.isTyping,
            userId: payload.userId,
          });
        }
      );

      /**
       * Read receipt for internal chat
       */
      socket.on("internal-chat:read-receipt", (payload: { roomId: number }) => {
        if (!payload?.roomId) {
          console.warn(
            "⚠️ [Internal Chat] No roomId provided for read receipt"
          );
          return;
        }
        const roomKey = `internal-chat-room:${payload.roomId}`;

        console.log(
          `✅ [Internal Chat] Broadcasting read receipt for room ${payload.roomId}`
        );

        // Broadcast to all other clients in the room
        socket.to(roomKey).emit("internal-chat:read-receipt", {
          roomId: payload.roomId,
        });
      });

      /**
       * User status (online/offline)
       */
      socket.on("internal-chat:user-status", (userId: number) => {
        if (!userId) return;

        onlineUsers.set(socket.id, userId);

        if (!userSockets.has(userId)) {
          userSockets.set(userId, new Set());
        }
        userSockets.get(userId)!.add(socket.id);

        // Broadcast user online status
        socket.broadcast.emit("internal-chat:user-online", { userId });
        console.log(`👤 [Internal Chat] User ${userId} is online`);
      });

      // ==================== SUPPORT CHAT PRESENCE ====================
      socket.on("support-chat:user-status", (userId: number) => {
        if (!userId) return;

        onlineUsers.set(socket.id, userId);

        if (!userSockets.has(userId)) {
          userSockets.set(userId, new Set());
        }
        userSockets.get(userId)!.add(socket.id);

        // Broadcast user online status to all support-chat listeners
        socket.broadcast.emit("support-chat:user-online", { userId });
        console.log(`👤 [Support Chat] User ${userId} is online`);
      });

      // ==================== SUPPORT CHAT ====================

      /**
       * Join a support ticket room
       */
      socket.on("support-chat:join", (ticketId: number) => {
        console.log(
          `📥 [Support Chat] Socket ${socket.id} joining ticket ${ticketId}`
        );
        if (!ticketId) {
          console.warn("⚠️ [Support Chat] No ticketId provided for join");
          return;
        }
        const roomKey = `support-ticket:${ticketId}`;
        socket.join(roomKey);
        console.log(
          `✅ [Support Chat] Socket ${socket.id} joined ticket ${ticketId}`
        );
        socket.emit("support-chat:joined", { ticketId });
      });

      /**
       * Leave a support ticket room
       */
      socket.on("support-chat:leave", (ticketId: number) => {
        console.log(
          `📤 [Support Chat] Socket ${socket.id} leaving ticket ${ticketId}`
        );
        if (!ticketId) return;
        const roomKey = `support-ticket:${ticketId}`;
        socket.leave(roomKey);
        console.log(
          `✅ [Support Chat] Socket ${socket.id} left ticket ${ticketId}`
        );
      });

      /**
       * Send message to support ticket
       */
      socket.on(
        "support-chat:message",
        (payload: {
          ticketId: number;
          body: string;
          tempId?: string;
          isInternal?: boolean;
        }) => {
          console.log(`📨 [Support Chat] Message received:`, {
            ticketId: payload.ticketId,
            bodyLength: payload.body?.length,
            tempId: payload.tempId,
            isInternal: payload.isInternal,
          });

          if (!payload?.ticketId || !payload?.body) {
            console.warn("⚠️ [Support Chat] Invalid message payload");
            return;
          }

          const roomKey = `support-ticket:${payload.ticketId}`;

          // Get sockets in room for debugging
          const socketsInRoom = io.sockets.adapter.rooms.get(roomKey);
          console.log(
            `👥 [Support Chat] Sockets in ticket ${payload.ticketId}:`,
            socketsInRoom?.size || 0
          );

          const message = {
            id: payload.tempId || `temp-${Date.now()}`,
            ticketId: payload.ticketId,
            body: payload.body,
            isInternal: payload.isInternal || false,
            createdAt: new Date().toISOString(),
            tempId: payload.tempId,
          };

          // Broadcast to all clients in the room (except sender)
          socket.to(roomKey).emit("support-chat:message", message);
          console.log(
            `💬 [Support Chat] Message broadcasted to ticket ${payload.ticketId}`
          );
        }
      );

      // Edit support chat message
      socket.on(
        "support-chat:message-edit",
        (payload: { ticketId: number; messageId: number; body: string }) => {
          if (!payload?.ticketId || !payload?.messageId) return;
          const roomKey = `support-ticket:${payload.ticketId}`;
          console.log("✏️ [Support Chat] Message edited:", payload);
          socket.to(roomKey).emit("support-chat:message-edited", payload);
        }
      );

      // Delete support chat message
      socket.on(
        "support-chat:message-delete",
        (payload: { ticketId: number; messageId: number }) => {
          if (!payload?.ticketId || !payload?.messageId) return;
          const roomKey = `support-ticket:${payload.ticketId}`;
          console.log("🗑️ [Support Chat] Message deleted:", payload);
          socket.to(roomKey).emit("support-chat:message-deleted", payload);
        }
      );

      /**
       * Typing indicator for support chat
       */
      socket.on(
        "support-chat:typing",
        (payload: { ticketId: number; isTyping: boolean }) => {
          if (!payload?.ticketId) return;
          const roomKey = `support-ticket:${payload.ticketId}`;

          socket.to(roomKey).emit("support-chat:typing", {
            ticketId: payload.ticketId,
            isTyping: payload.isTyping,
          });
        }
      );

      /**
       * Ticket status changed
       */
      socket.on(
        "support-chat:status-changed",
        (payload: { ticketId: number; status: string }) => {
          if (!payload?.ticketId) return;
          const roomKey = `support-ticket:${payload.ticketId}`;

          io.to(roomKey).emit("support-chat:status-changed", payload);
          console.log(
            `🎫 [Support Chat] Ticket ${payload.ticketId} status changed to ${payload.status}`
          );
        }
      );

      /**
       * Ticket assigned
       */
      socket.on(
        "support-chat:assigned",
        (payload: { ticketId: number; assignedToId: number }) => {
          if (!payload?.ticketId) return;
          const roomKey = `support-ticket:${payload.ticketId}`;

          io.to(roomKey).emit("support-chat:assigned", payload);
          console.log(
            `🎫 [Support Chat] Ticket ${payload.ticketId} assigned to user ${payload.assignedToId}`
          );
        }
      );

      // ==================== DISCONNECT ====================

      socket.on("disconnect", () => {
        console.log("❌ [Socket.IO] Client disconnected:", socket.id);

        // Handle user going offline
        const userId = onlineUsers.get(socket.id);
        if (userId) {
          onlineUsers.delete(socket.id);
          const userSocketSet = userSockets.get(userId);
          if (userSocketSet) {
            userSocketSet.delete(socket.id);

            // If user has no more sockets, they're offline
            if (userSocketSet.size === 0) {
              userSockets.delete(userId);
              socket.broadcast.emit("internal-chat:user-offline", { userId });
              console.log(`👤 [Internal Chat] User ${userId} is offline`);
              // Also broadcast for support-chat listeners
              socket.broadcast.emit("support-chat:user-offline", { userId });
              console.log(`👤 [Support Chat] User ${userId} is offline`);
            }
          }
        }
      });
    });

    console.log("✅ [Socket.IO] Server initialized successfully");
  } else {
    console.log("♻️ [Socket.IO] Server already running");
  }

  res.end();
}
