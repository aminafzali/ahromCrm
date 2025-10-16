import type { NextApiRequest } from "next";
import { Server as IOServer } from "socket.io";
import type { NextApiResponseServerIO } from "./types";

/**
 * Socket.IO Server for Real-time Communication
 * Supports:
 * - Internal Chat (Organization Chat)
 * - Support Chat (Customer Support Tickets)
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (!res.socket.server.io) {
    console.log("🚀 Initializing Socket.IO Server...");

    const io = new IOServer(res.socket.server as any, {
      path: "/api/socket_io",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    // Track online users
    const onlineUsers = new Map<string, number>(); // socketId -> userId
    const userSockets = new Map<number, Set<string>>(); // userId -> Set<socketId>

    io.on("connection", (socket) => {
      console.log("✅ Client connected:", socket.id);

      // ==================== INTERNAL CHAT ====================

      /**
       * Join an internal chat room
       * Event: internal-chat:join
       */
      socket.on("internal-chat:join", (roomId: number) => {
        if (!roomId) return;
        const roomKey = `internal-chat:${roomId}`;
        socket.join(roomKey);
        console.log(
          `📥 Socket ${socket.id} joined Internal Chat room ${roomId}`
        );
        socket.emit("internal-chat:joined", { roomId });
      });

      /**
       * Leave an internal chat room
       * Event: internal-chat:leave
       */
      socket.on("internal-chat:leave", (roomId: number) => {
        if (!roomId) return;
        const roomKey = `internal-chat:${roomId}`;
        socket.leave(roomKey);
        console.log(`📤 Socket ${socket.id} left Internal Chat room ${roomId}`);
      });

      /**
       * Send message to internal chat room
       * Event: internal-chat:message
       */
      socket.on(
        "internal-chat:message",
        (payload: {
          roomId: number;
          body: string;
          tempId?: string;
          senderId?: number;
        }) => {
          if (!payload?.roomId || !payload?.body) return;

          const roomKey = `internal-chat:${payload.roomId}`;
          const message = {
            id: payload.tempId || `temp-${Date.now()}`,
            roomId: payload.roomId,
            body: payload.body,
            senderId: payload.senderId,
            createdAt: new Date().toISOString(),
            isOwnMessage: false,
          };

          // Broadcast to all clients in the room (including sender)
          io.to(roomKey).emit("internal-chat:message", message);
          console.log(
            `💬 Message sent to Internal Chat room ${payload.roomId}`
          );
        }
      );

      /**
       * Typing indicator for internal chat
       * Event: internal-chat:typing
       */
      socket.on(
        "internal-chat:typing",
        (payload: {
          roomId: number;
          isTyping: boolean;
          userId?: number;
          userName?: string;
        }) => {
          if (!payload?.roomId) return;

          const roomKey = `internal-chat:${payload.roomId}`;
          // Broadcast to others in the room (not to sender)
          socket.to(roomKey).emit("internal-chat:typing", {
            roomId: payload.roomId,
            isTyping: payload.isTyping,
            userId: payload.userId,
            userName: payload.userName,
            timestamp: Date.now(),
          });
        }
      );

      /**
       * User status (online/offline) for internal chat
       * Event: internal-chat:user-status
       */
      socket.on(
        "internal-chat:set-status",
        (payload: { userId: number; status: "online" | "offline" }) => {
          if (!payload?.userId) return;

          if (payload.status === "online") {
            onlineUsers.set(socket.id, payload.userId);
            if (!userSockets.has(payload.userId)) {
              userSockets.set(payload.userId, new Set());
            }
            userSockets.get(payload.userId)?.add(socket.id);
          } else {
            onlineUsers.delete(socket.id);
            userSockets.get(payload.userId)?.delete(socket.id);
            if (userSockets.get(payload.userId)?.size === 0) {
              userSockets.delete(payload.userId);
            }
          }

          // Broadcast user status to all clients
          io.emit("internal-chat:user-status", {
            userId: payload.userId,
            status: payload.status,
            timestamp: Date.now(),
          });

          console.log(`👤 User ${payload.userId} is now ${payload.status}`);
        }
      );

      // ==================== SUPPORT CHAT ====================

      /**
       * Join a support chat ticket
       * Event: support-chat:join
       */
      socket.on("support-chat:join", (ticketId: number) => {
        if (!ticketId) return;
        const roomKey = `support-chat:${ticketId}`;
        socket.join(roomKey);
        console.log(
          `📥 Socket ${socket.id} joined Support Chat ticket ${ticketId}`
        );
        socket.emit("support-chat:joined", { ticketId });
      });

      /**
       * Leave a support chat ticket
       * Event: support-chat:leave
       */
      socket.on("support-chat:leave", (ticketId: number) => {
        if (!ticketId) return;
        const roomKey = `support-chat:${ticketId}`;
        socket.leave(roomKey);
        console.log(
          `📤 Socket ${socket.id} left Support Chat ticket ${ticketId}`
        );
      });

      /**
       * Send message to support chat ticket
       * Event: support-chat:message
       */
      socket.on(
        "support-chat:message",
        (payload: {
          ticketId: number;
          body: string;
          tempId?: string;
          senderId?: number;
          senderType?: "agent" | "customer" | "guest";
          isInternal?: boolean;
        }) => {
          if (!payload?.ticketId || !payload?.body) return;

          const roomKey = `support-chat:${payload.ticketId}`;
          const message = {
            id: payload.tempId || `temp-${Date.now()}`,
            ticketId: payload.ticketId,
            body: payload.body,
            senderId: payload.senderId,
            senderType: payload.senderType || "customer",
            isInternal: payload.isInternal || false,
            createdAt: new Date().toISOString(),
          };

          // Broadcast to all clients in the ticket
          io.to(roomKey).emit("support-chat:message", message);
          console.log(
            `💬 Message sent to Support Chat ticket ${payload.ticketId}`
          );
        }
      );

      /**
       * Typing indicator for support chat
       * Event: support-chat:typing
       */
      socket.on(
        "support-chat:typing",
        (payload: {
          ticketId: number;
          isTyping: boolean;
          userId?: number;
          userName?: string;
        }) => {
          if (!payload?.ticketId) return;

          const roomKey = `support-chat:${payload.ticketId}`;
          // Broadcast to others in the ticket (not to sender)
          socket.to(roomKey).emit("support-chat:typing", {
            ticketId: payload.ticketId,
            isTyping: payload.isTyping,
            userId: payload.userId,
            userName: payload.userName,
            timestamp: Date.now(),
          });
        }
      );

      /**
       * Ticket status update
       * Event: support-chat:ticket-update
       */
      socket.on(
        "support-chat:ticket-update",
        (payload: {
          ticketId: number;
          status?: string;
          assignedTo?: number;
          priority?: string;
        }) => {
          if (!payload?.ticketId) return;

          const roomKey = `support-chat:${payload.ticketId}`;
          // Broadcast ticket update to all clients in the ticket
          io.to(roomKey).emit("support-chat:ticket-update", {
            ticketId: payload.ticketId,
            status: payload.status,
            assignedTo: payload.assignedTo,
            priority: payload.priority,
            timestamp: Date.now(),
          });

          console.log(`🔄 Ticket ${payload.ticketId} updated:`, payload);
        }
      );

      /**
       * Support agent status (available/busy/offline)
       * Event: support-chat:agent-status
       */
      socket.on(
        "support-chat:agent-status",
        (payload: {
          agentId: number;
          status: "available" | "busy" | "offline";
        }) => {
          if (!payload?.agentId) return;

          // Broadcast agent status to all support chat clients
          io.emit("support-chat:agent-status", {
            agentId: payload.agentId,
            status: payload.status,
            timestamp: Date.now(),
          });

          console.log(
            `👨‍💼 Support Agent ${payload.agentId} is now ${payload.status}`
          );
        }
      );

      // ==================== DISCONNECT ====================

      /**
       * Handle client disconnect
       */
      socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);

        // Clean up online users
        const userId = onlineUsers.get(socket.id);
        if (userId) {
          onlineUsers.delete(socket.id);
          userSockets.get(userId)?.delete(socket.id);

          // If user has no more active sockets, set them offline
          if (userSockets.get(userId)?.size === 0) {
            userSockets.delete(userId);
            io.emit("internal-chat:user-status", {
              userId,
              status: "offline",
              timestamp: Date.now(),
            });
          }
        }
      });
    });

    res.socket.server.io = io as any;
    console.log("✅ Socket.IO Server initialized successfully");
  } else {
    console.log("ℹ️ Socket.IO Server already running");
  }

  res.end();
}
