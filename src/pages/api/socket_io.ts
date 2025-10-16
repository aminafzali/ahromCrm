import prisma from "@/lib/prisma";
import type { NextApiRequest } from "next";
import { Server as IOServer } from "socket.io";
import type { NextApiResponseServerIO } from "./types";

const isProd = process.env.NODE_ENV === "production";
const logger = {
  debug: (...args: any[]) => {
    if (!isProd) console.log(...args);
  },
  info: (...args: any[]) => console.log(...args),
  warn: (...args: any[]) => console.warn(...args),
  error: (...args: any[]) => console.error(...args),
};

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
    logger.info("🚀 [Socket.IO] Initializing Server...");

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

    // Lightweight handshake auth (pluggable): expects handshake.auth.workspaceUserId
    io.use((socket, next) => {
      try {
        const auth = socket.handshake.auth as any;
        if (auth && typeof auth.workspaceUserId === "number") {
          (socket.data as any).user = {
            workspaceUserId: auth.workspaceUserId,
            workspaceId: auth.workspaceId,
            role: auth.role,
          };
        }
        return next();
      } catch (e) {
        return next();
      }
    });

    io.on("connection", (socket) => {
      logger.info("✅ [Socket.IO] Client connected:", socket.id);

      // Helper: emit structured error to client
      const emitError = (code: string, message: string, meta?: any) => {
        socket.emit("internal-chat:error", { code, message, ...(meta || {}) });
      };

      // If handshake carried user, set presence immediately
      const preUser = (socket.data as any)?.user;
      if (preUser?.workspaceUserId) {
        const uid = preUser.workspaceUserId as number;
        onlineUsers.set(socket.id, uid);
        if (!userSockets.has(uid)) userSockets.set(uid, new Set());
        userSockets.get(uid)!.add(socket.id);
        socket.broadcast.emit("internal-chat:user-online", { userId: uid });
        socket.broadcast.emit("support-chat:user-online", { userId: uid });
      }

      // ==================== INTERNAL CHAT ====================

      /**
       * Join an internal chat room
       */
      socket.on("internal-chat:join", async (roomId: number) => {
        try {
          logger.debug(
            `📥 [Internal Chat] Socket ${socket.id} joining room ${roomId}`
          );
          if (!roomId) {
            emitError("INVALID_ROOM_ID", "roomId is required");
            return;
          }
          const currentUserId = onlineUsers.get(socket.id);
          if (!currentUserId) {
            emitError("UNAUTHORIZED", "Unknown user");
            return;
          }
          const membership = await prisma.chatRoomMember.findFirst({
            where: { roomId, workspaceUserId: currentUserId, leftAt: null },
            select: { id: true },
          });
          if (!membership) {
            emitError("FORBIDDEN", "Not a member of this room", { roomId });
            return;
          }
          const roomKey = `internal-chat-room:${roomId}`;
          socket.join(roomKey);
          logger.info(
            `✅ [Internal Chat] Socket ${socket.id} joined room ${roomId}`
          );
          socket.emit("internal-chat:joined", { roomId });
        } catch (e) {
          logger.error("❌ [Internal Chat] join error", e);
          emitError("JOIN_ERROR", "Failed to join room");
        }
      });

      /**
       * Leave an internal chat room
       */
      socket.on("internal-chat:leave", (roomId: number) => {
        logger.debug(
          `📤 [Internal Chat] Socket ${socket.id} leaving room ${roomId}`
        );
        if (!roomId) return;
        const roomKey = `internal-chat-room:${roomId}`;
        socket.leave(roomKey);
        logger.debug(
          `✅ [Internal Chat] Socket ${socket.id} left room ${roomId}`
        );
      });

      /**
       * Send message to internal chat room (persist + ack + broadcast)
       */
      socket.on(
        "internal-chat:message",
        async (payload: {
          roomId: number;
          body: string;
          tempId?: string;
          senderId?: number; // fallback if presence not set
          replyToId?: number;
          replySnapshot?: {
            id: number;
            body?: string | null;
            senderId?: number | null;
            sender?: { displayName?: string | null } | null;
            isDeleted?: boolean;
          } | null;
        }) => {
          try {
            logger.debug(`📨 [Internal Chat] Message received:`, {
              roomId: payload.roomId,
              bodyLength: payload.body?.length,
              tempId: payload.tempId,
              senderId: payload.senderId,
              replyToId: payload.replyToId,
            });

            if (!payload?.roomId || !payload?.body) {
              emitError("INVALID_PAYLOAD", "roomId and body are required");
              return;
            }

            const roomKey = `internal-chat-room:${payload.roomId}`;

            // Current user from presence map
            const currentUserId =
              onlineUsers.get(socket.id) || payload.senderId;
            if (!currentUserId) {
              emitError("UNAUTHORIZED", "Unknown sender");
              return;
            }

            // Verify membership
            const membership = await prisma.chatRoomMember.findFirst({
              where: {
                roomId: payload.roomId,
                workspaceUserId: currentUserId,
                leftAt: null,
              },
              select: { id: true },
            });
            if (!membership) {
              emitError("FORBIDDEN", "Not a member of this room", {
                roomId: payload.roomId,
              });
              return;
            }

            // Persist message
            const saved = await prisma.chatMessage.create({
              data: {
                roomId: payload.roomId,
                senderId: currentUserId,
                body: payload.body,
                replyToId: payload.replyToId,
                messageType: "TEXT",
              },
              include: {
                sender: { select: { id: true, displayName: true } },
                replyTo: {
                  select: {
                    id: true,
                    body: true,
                    senderId: true,
                    sender: { select: { displayName: true } },
                    isDeleted: true,
                  },
                },
              },
            });

            // Update room activity
            await prisma.chatRoom.update({
              where: { id: payload.roomId },
              data: { lastActivityAt: new Date() },
            });

            // ACK to sender to replace temp
            socket.emit("internal-chat:ack", {
              tempId: payload.tempId,
              message: { ...saved, isRead: false },
            });

            // Broadcast to others with reply snapshot if not included
            const out = { ...saved } as any;
            if (!out.replyTo && payload.replySnapshot) {
              out.replyTo = payload.replySnapshot;
              out.replyToId = payload.replyToId;
            }
            socket.to(roomKey).emit("internal-chat:message", out);
            logger.info(
              `💬 [Internal Chat] Message persisted and broadcasted to room ${payload.roomId}`
            );
          } catch (err) {
            logger.error("❌ [Internal Chat] Error handling message:", err);
            emitError("MESSAGE_ERROR", "Failed to handle message");
          }
        }
      );

      // Edit internal chat message
      socket.on(
        "internal-chat:message-edit",
        async (payload: {
          roomId: number;
          messageId: number;
          body: string;
        }) => {
          try {
            if (!payload?.roomId || !payload?.messageId) return;
            const currentUserId = onlineUsers.get(socket.id);
            if (!currentUserId) {
              emitError("UNAUTHORIZED", "Unknown user");
              return;
            }
            // ensure message owned by user and in the same room
            const msg = await prisma.chatMessage.findFirst({
              where: {
                id: payload.messageId,
                roomId: payload.roomId,
                senderId: currentUserId,
              },
              select: { id: true },
            });
            if (!msg) {
              emitError("FORBIDDEN", "Not allowed to edit this message");
              return;
            }
            await prisma.chatMessage.update({
              where: { id: payload.messageId },
              data: { body: payload.body, isEdited: true },
            });
            const roomKey = `internal-chat-room:${payload.roomId}`;
            logger.debug("✏️ [Internal Chat] Message edited: ", payload);
            socket.to(roomKey).emit("internal-chat:message-edited", payload);
          } catch (e) {
            logger.error("❌ [Internal Chat] edit error", e);
            emitError("EDIT_ERROR", "Failed to edit message");
          }
        }
      );

      // Delete internal chat message
      socket.on(
        "internal-chat:message-delete",
        async (payload: { roomId: number; messageId: number }) => {
          try {
            if (!payload?.roomId || !payload?.messageId) return;
            const currentUserId = onlineUsers.get(socket.id);
            if (!currentUserId) {
              emitError("UNAUTHORIZED", "Unknown user");
              return;
            }
            const msg = await prisma.chatMessage.findFirst({
              where: {
                id: payload.messageId,
                roomId: payload.roomId,
                senderId: currentUserId,
              },
              select: { id: true },
            });
            if (!msg) {
              emitError("FORBIDDEN", "Not allowed to delete this message");
              return;
            }
            await prisma.chatMessage.update({
              where: { id: payload.messageId },
              data: { isDeleted: true },
            });
            const roomKey = `internal-chat-room:${payload.roomId}`;
            logger.debug("🗑️ [Internal Chat] Message deleted: ", payload);
            socket.to(roomKey).emit("internal-chat:message-deleted", payload);
          } catch (e) {
            logger.error("❌ [Internal Chat] delete error", e);
            emitError("DELETE_ERROR", "Failed to delete message");
          }
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
       * Read receipt for internal chat (persist + broadcast)
       */
      socket.on(
        "internal-chat:read-receipt",
        async (payload: { roomId: number; lastReadMessageId?: number }) => {
          try {
            if (!payload?.roomId) {
              emitError(
                "INVALID_ROOM_ID",
                "roomId is required for read receipt"
              );
              return;
            }
            const roomKey = `internal-chat-room:${payload.roomId}`;

            const currentUserId = onlineUsers.get(socket.id);
            if (!currentUserId) {
              emitError("UNAUTHORIZED", "Unknown user");
              return;
            }

            const membership = await prisma.chatRoomMember.findFirst({
              where: {
                roomId: payload.roomId,
                workspaceUserId: currentUserId,
                leftAt: null,
              },
              select: { id: true },
            });
            if (!membership) return;

            // Persist receipts for all unread messages (optionally up to lastReadMessageId)
            const unread = await prisma.chatMessage.findMany({
              where: {
                roomId: payload.roomId,
                senderId: { not: currentUserId },
                id: payload.lastReadMessageId
                  ? { lte: payload.lastReadMessageId }
                  : undefined,
                readReceipts: { none: { memberId: membership.id } },
              },
              select: { id: true },
            });
            if (unread.length > 0) {
              await prisma.chatMessageReadReceipt.createMany({
                data: unread.map((m) => ({
                  messageId: m.id,
                  memberId: membership.id,
                  readAt: new Date(),
                })),
                skipDuplicates: true,
              });
            }

            logger.debug(
              `✅ [Internal Chat] Broadcasting read receipt for room ${payload.roomId}`,
              payload.lastReadMessageId
                ? `lastReadMessageId=${payload.lastReadMessageId}`
                : ""
            );

            socket.to(roomKey).emit("internal-chat:read-receipt", {
              roomId: payload.roomId,
              lastReadMessageId: payload.lastReadMessageId,
            });
          } catch (e) {
            logger.error("❌ [Internal Chat] read-receipt error", e);
            emitError("READ_RECEIPT_ERROR", "Failed to persist read receipt");
          }
        }
      );

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
        logger.debug(`👤 [Internal Chat] User ${userId} is online`);
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
        logger.debug(`👤 [Support Chat] User ${userId} is online`);
      });

      // ==================== SUPPORT CHAT ====================

      /**
       * Join a support ticket room
       */
      socket.on("support-chat:join", (ticketId: number) => {
        logger.debug(
          `📥 [Support Chat] Socket ${socket.id} joining ticket ${ticketId}`
        );
        if (!ticketId) {
          logger.warn("⚠️ [Support Chat] No ticketId provided for join");
          return;
        }
        const roomKey = `support-ticket:${ticketId}`;
        socket.join(roomKey);
        logger.debug(
          `✅ [Support Chat] Socket ${socket.id} joined ticket ${ticketId}`
        );
        socket.emit("support-chat:joined", { ticketId });
      });

      /**
       * Support Chat Typing Indicator
       */
      socket.on(
        "support-chat:typing",
        (data: { ticketId: number; isTyping: boolean }) => {
          try {
            const { ticketId, isTyping } = data;
            logger.debug("Support chat typing", { ticketId, isTyping });

            // Broadcast typing status to other users in the room
            socket
              .to(`support-ticket:${ticketId}`)
              .emit("support-chat:typing", {
                isTyping,
                senderId: socket.data.guestId || socket.data.workspaceUserId,
              });
          } catch (error) {
            logger.error("Error handling support chat typing", error);
          }
        }
      );

      /**
       * Leave a support ticket room
       */
      socket.on("support-chat:leave", (ticketId: number) => {
        logger.debug(
          `📤 [Support Chat] Socket ${socket.id} leaving ticket ${ticketId}`
        );
        if (!ticketId) return;
        const roomKey = `support-ticket:${ticketId}`;
        socket.leave(roomKey);
        logger.debug(
          `✅ [Support Chat] Socket ${socket.id} left ticket ${ticketId}`
        );
      });

      /**
       * Send message to support ticket
       */
      socket.on(
        "support-chat:message",
        async (payload: {
          ticketId: number;
          body: string;
          tempId?: string;
          isInternal?: boolean;
          replyToId?: number;
          replySnapshot?: string;
        }) => {
          logger.debug(`📨 [Support Chat] Message received:`, {
            ticketId: payload.ticketId,
            bodyLength: payload.body?.length,
            tempId: payload.tempId,
            isInternal: payload.isInternal,
            replyToId: payload.replyToId,
          });

          if (!payload?.ticketId || !payload?.body) {
            logger.warn("⚠️ [Support Chat] Invalid message payload");
            return;
          }

          try {
            // Create message in database
            const savedMessage = await prisma.supportChatMessage.create({
              data: {
                ticketId: payload.ticketId,
                body: payload.body.trim(),
                isInternal: payload.isInternal || false,
                replyToId: payload.replyToId || null,
                replySnapshot: payload.replySnapshot || null,
              },
            });

            logger.debug(
              `💾 [Support Chat] Message saved with ID ${savedMessage.id}`
            );

            const roomKey = `support-ticket:${payload.ticketId}`;

            // Send ACK to sender
            if (payload.tempId) {
              socket.emit("support-chat:ack", {
                tempId: payload.tempId,
                messageId: savedMessage.id,
                savedMessage,
              });
            }

            // Broadcast to room
            socket.to(roomKey).emit("support-chat:message", savedMessage);

            // Update message status to delivered
            setTimeout(() => {
              if (payload.tempId) {
                socket.emit("support-chat:message-status", {
                  messageId: payload.tempId,
                  status: "delivered",
                });
              }
              socket.to(roomKey).emit("support-chat:message-status", {
                messageId: savedMessage.id,
                status: "delivered",
              });
            }, 1000);

            logger.info(
              `💬 [Support Chat] Message broadcasted to ticket ${payload.ticketId}`
            );
          } catch (error) {
            logger.error("❌ [Support Chat] Error saving message", error);
            socket.emit("support-chat:error", {
              code: "MESSAGE_FAILED",
              message: "Failed to send message",
            });
          }
        }
      );

      // Edit support chat message
      socket.on(
        "support-chat:message-edit",
        async (payload: {
          ticketId: number;
          messageId: number;
          body: string;
        }) => {
          try {
            if (!payload?.ticketId || !payload?.messageId) return;

            logger.debug("✏️ [Support Chat] Edit message:", payload);

            // Update message in database
            const updatedMessage = await prisma.supportChatMessage.update({
              where: { id: payload.messageId },
              data: {
                body: payload.body.trim(),
                isEdited: true,
                editedAt: new Date(),
                editCount: { increment: 1 },
              },
            });

            const roomKey = `support-ticket:${payload.ticketId}`;
            socket.to(roomKey).emit("support-chat:message-edited", {
              messageId: payload.messageId,
              body: updatedMessage.body,
              isEdited: true,
              editedAt: updatedMessage.editedAt,
              editCount: updatedMessage.editCount,
            });

            logger.info(
              `✅ [Support Chat] Message ${payload.messageId} edited successfully`
            );
          } catch (error) {
            logger.error("❌ [Support Chat] Error editing message", error);
            socket.emit("support-chat:error", {
              code: "EDIT_FAILED",
              message: "Failed to edit message",
            });
          }
        }
      );

      // Delete support chat message
      socket.on(
        "support-chat:message-delete",
        async (payload: { ticketId: number; messageId: number }) => {
          try {
            if (!payload?.ticketId || !payload?.messageId) return;

            logger.debug("🗑️ [Support Chat] Delete message:", payload);

            // Soft delete message in database
            const deletedMessage = await prisma.supportChatMessage.update({
              where: { id: payload.messageId },
              data: {
                isDeleted: true,
                deletedAt: new Date(),
                body: "پیام حذف شده",
              },
            });

            const roomKey = `support-ticket:${payload.ticketId}`;
            socket.to(roomKey).emit("support-chat:message-deleted", {
              messageId: payload.messageId,
              isDeleted: true,
              deletedAt: deletedMessage.deletedAt,
            });

            logger.info(
              `✅ [Support Chat] Message ${payload.messageId} deleted successfully`
            );
          } catch (error) {
            logger.error("❌ [Support Chat] Error deleting message", error);
            socket.emit("support-chat:error", {
              code: "DELETE_FAILED",
              message: "Failed to delete message",
            });
          }
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
          logger.debug(
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
          logger.debug(
            `🎫 [Support Chat] Ticket ${payload.ticketId} assigned to user ${payload.assignedToId}`
          );
        }
      );

      // ==================== DISCONNECT ====================

      socket.on("disconnect", () => {
        logger.info("❌ [Socket.IO] Client disconnected:", socket.id);

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
              logger.debug(`👤 [Internal Chat] User ${userId} is offline`);
              // Also broadcast for support-chat listeners
              socket.broadcast.emit("support-chat:user-offline", { userId });
              logger.debug(`👤 [Support Chat] User ${userId} is offline`);
            }
          }
        }
      });
    });

    logger.info("✅ [Socket.IO] Server initialized successfully");
  } else {
    logger.debug("♻️ [Socket.IO] Server already running");
  }

  res.end();
}
