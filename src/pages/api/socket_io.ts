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

    // Lightweight handshake auth (pluggable): supports both registered users and guests
    io.use((socket, next) => {
      try {
        const auth = socket.handshake.auth as any;

        // Handle registered users
        if (auth && typeof auth.workspaceUserId === "number") {
          (socket.data as any).user = {
            type: "registered",
            workspaceUserId: auth.workspaceUserId,
            workspaceId: auth.workspaceId,
            role: auth.role,
          };
        }
        // Handle guest users
        else if (auth && typeof auth.guestId === "number") {
          (socket.data as any).user = {
            type: "guest",
            guestId: auth.guestId,
            ticketId: auth.ticketId,
          };
        }
        // Allow anonymous connections for public support chat
        else {
          (socket.data as any).user = {
            type: "anonymous",
            id: "unknown",
          };
        }

        return next();
      } catch (e) {
        // Allow connection even if auth fails
        (socket.data as any).user = {
          type: "anonymous",
          id: "unknown",
        };
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
      socket.on("support-chat:join", async (ticketId: number) => {
        // Get user info for logging
        const userInfo = socket.data.user || { type: "guest", id: "unknown" };

        // Check if user is registered (has workspaceUserId) even if type is guest
        const isRegisteredUser =
          userInfo.workspaceUserId && userInfo.workspaceId;
        const isGuest =
          !isRegisteredUser &&
          (userInfo.type === "guest" || userInfo.type === "anonymous");
        const userType = isGuest ? "مهمان" : "کاربر ثبت‌نام‌شده";
        const userId = isGuest ? userInfo.guestId : userInfo.workspaceUserId;

        logger.info(`📥 [Support Chat] درخواست ورود به تیکت`, {
          ticketId,
          userType,
          userId,
          isGuest,
          socketId: socket.id,
          timestamp: new Date().toISOString(),
        });

        if (!ticketId) {
          logger.warn("⚠️ [Support Chat] No ticketId provided for join", {
            userType,
            userId,
            socketId: socket.id,
          });
          return;
        }

        try {
          // Get ticket info for logging
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

          if (!ticket) {
            logger.error("❌ [Support Chat] Ticket not found for join", {
              ticketId,
              userType,
              userId,
              socketId: socket.id,
            });
            return;
          }

          const roomKey = `support-ticket:${ticketId}`;
          socket.join(roomKey);

          // Get room member count
          const roomSize = io.sockets.adapter.rooms.get(roomKey)?.size || 0;

          logger.debug(`🔌 [Support Chat] Socket joined room`, {
            socketId: socket.id,
            roomKey,
            ticketId,
            userType,
            userId,
          });

          logger.info(`✅ [Support Chat] کاربر با موفقیت به تیکت پیوست`, {
            ticketId,
            ticketNumber: ticket.ticketNumber,
            userType,
            userId,
            isGuest,
            socketId: socket.id,
            roomKey,
            roomSize,
            ticketStatus: ticket.status,
            ticketPriority: ticket.priority,
            guestUser: ticket.guestUser
              ? {
                  id: ticket.guestUser.id,
                  name: ticket.guestUser.name,
                  ipAddress: ticket.guestUser.ipAddress,
                  country: ticket.guestUser.country,
                }
              : null,
            workspaceUser: ticket.workspaceUser
              ? {
                  id: ticket.workspaceUser.id,
                  name: ticket.workspaceUser.user.name,
                  email: ticket.workspaceUser.user.email,
                }
              : null,
            timestamp: new Date().toISOString(),
          });

          socket.emit("support-chat:joined", { ticketId });
        } catch (error: any) {
          logger.error("❌ [Support Chat] خطا در ورود به تیکت", {
            error: error?.message || "Unknown error",
            stack: error?.stack,
            ticketId,
            userType,
            userId,
            isGuest,
            socketId: socket.id,
            timestamp: new Date().toISOString(),
          });
        }
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
          // Get user info for logging
          const userInfo = socket.data.user || { type: "guest", id: "unknown" };

          // Check if user is registered (has workspaceUserId) even if type is guest
          const isRegisteredUser = userInfo.workspaceUserId;
          const isGuest =
            !isRegisteredUser &&
            (userInfo.type === "guest" || userInfo.type === "anonymous");
          const userType = isGuest ? "مهمان" : "کاربر ثبت‌نام‌شده";
          const userId = isGuest ? userInfo.guestId : userInfo.workspaceUserId;

          // For guest users, try to get ticketId from socket.data if not provided in payload
          if (isGuest && !payload.ticketId && userInfo.ticketId) {
            payload.ticketId = userInfo.ticketId;
          }

          logger.info(`📨 [Support Chat] پیام جدید دریافت شد`, {
            ticketId: payload.ticketId,
            userType,
            userId,
            isGuest,
            bodyLength: payload.body?.length,
            tempId: payload.tempId,
            isInternal: payload.isInternal,
            replyToId: payload.replyToId,
            socketId: socket.id,
            timestamp: new Date().toISOString(),
            userInfo: userInfo,
          });

          if (!payload?.ticketId || !payload?.body) {
            logger.warn("⚠️ [Support Chat] Invalid message payload", {
              ticketId: payload.ticketId,
              bodyLength: payload.body?.length,
              userType,
              userId,
              socketId: socket.id,
            });
            return;
          }

          try {
            // Get ticket info for logging
            let ticket = await prisma.supportChatTicket.findUnique({
              where: { id: payload.ticketId },
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

            if (!ticket) {
              // For registered users using public chat, create a new ticket
              if (
                !isGuest &&
                userInfo.workspaceUserId &&
                userInfo.workspaceId
              ) {
                logger.info(
                  "🆕 [Support Chat] Creating new ticket for registered user",
                  {
                    workspaceUserId: userInfo.workspaceUserId,
                    workspaceId: userInfo.workspaceId,
                    userType,
                    userId,
                  }
                );

                try {
                  const newTicket = await prisma.supportChatTicket.create({
                    data: {
                      ticketNumber: `CUST-${
                        userInfo.workspaceId
                      }-${Date.now()}`,
                      subject: "پشتیبانی آنلاین",
                      description: "تیکت ایجاد شده از طریق چت عمومی",
                      status: "OPEN",
                      priority: "MEDIUM",
                      workspaceId: userInfo.workspaceId,
                      workspaceUserId: userInfo.workspaceUserId,
                    },
                  });

                  // Update payload with new ticket ID
                  payload.ticketId = newTicket.id;

                  // Re-fetch ticket with includes
                  const updatedTicket =
                    await prisma.supportChatTicket.findUnique({
                      where: { id: newTicket.id },
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

                  // Update ticket variable
                  ticket = updatedTicket;

                  logger.info(
                    "✅ [Support Chat] New ticket created for registered user",
                    {
                      ticketId: newTicket.id,
                      ticketNumber: newTicket.ticketNumber,
                      workspaceUserId: userInfo.workspaceUserId,
                      workspaceId: userInfo.workspaceId,
                    }
                  );
                } catch (createError) {
                  logger.error(
                    "❌ [Support Chat] Failed to create ticket for registered user",
                    {
                      error: createError,
                      workspaceUserId: userInfo.workspaceUserId,
                      workspaceId: userInfo.workspaceId,
                    }
                  );
                  return;
                }
              } else {
                logger.error("❌ [Support Chat] Ticket not found", {
                  ticketId: payload.ticketId,
                  userType,
                  userId,
                  socketId: socket.id,
                });
                return;
              }
            }

            // Log ticket info
            if (ticket) {
              logger.info(`🎫 [Support Chat] Ticket info`, {
                ticketId: ticket.id,
                ticketNumber: ticket.ticketNumber,
                status: ticket.status,
                priority: ticket.priority,
                guestUser: ticket.guestUser
                  ? {
                      id: ticket.guestUser.id,
                      name: ticket.guestUser.name,
                      ipAddress: ticket.guestUser.ipAddress,
                      country: ticket.guestUser.country,
                    }
                  : null,
                workspaceUser: ticket.workspaceUser
                  ? {
                      id: ticket.workspaceUser.id,
                      name: ticket.workspaceUser.user.name,
                      email: ticket.workspaceUser.user.email,
                    }
                  : null,
              });
            }

            // Create message in database
            const savedMessage = await prisma.supportChatMessage.create({
              data: {
                ticketId: payload.ticketId,
                body: payload.body.trim(),
                isInternal: payload.isInternal || false,
                replyToId: payload.replyToId || null,
                replySnapshot: payload.replySnapshot || null,
                // Set the appropriate user ID based on user type
                ...(isGuest
                  ? { guestUserId: userId }
                  : { workspaceUserId: userId }),
              },
            });

            logger.info(`💾 [Support Chat] پیام با موفقیت ذخیره شد`, {
              messageId: savedMessage.id,
              ticketId: payload.ticketId,
              userType,
              userId,
              isGuest,
              bodyLength: payload.body.length,
              isInternal: payload.isInternal,
              replyToId: payload.replyToId,
              timestamp: savedMessage.createdAt,
            });

            const roomKey = `support-ticket:${payload.ticketId}`;

            // Send ACK to sender
            if (payload.tempId) {
              socket.emit("support-chat:ack", {
                tempId: payload.tempId,
                messageId: savedMessage.id,
                savedMessage,
              });
              logger.debug(`📤 [Support Chat] ACK sent to sender`, {
                tempId: payload.tempId,
                messageId: savedMessage.id,
                userType,
                userId,
              });
            }

            // Broadcast to room (including sender)
            io.to(roomKey).emit("support-chat:message", savedMessage);
            // Get room size for logging
            const roomSize = io.sockets.adapter.rooms.get(roomKey)?.size || 0;

            logger.info(`📢 [Support Chat] پیام به اتاق ارسال شد`, {
              roomKey,
              ticketId: payload.ticketId,
              messageId: savedMessage.id,
              userType,
              userId,
              isGuest,
              recipientsCount: roomSize,
            });

            // Update message status to delivered
            setTimeout(() => {
              if (payload.tempId) {
                socket.emit("support-chat:message-status", {
                  messageId: payload.tempId,
                  status: "delivered",
                });
              }
              io.to(roomKey).emit("support-chat:message-status", {
                messageId: savedMessage.id,
                status: "delivered",
              });
              logger.debug(
                `✅ [Support Chat] Message status updated to delivered`,
                {
                  messageId: savedMessage.id,
                  tempId: payload.tempId,
                  userType,
                  userId,
                }
              );
            }, 1000);

            logger.info(`💬 [Support Chat] فرآیند ارسال پیام کامل شد`, {
              ticketId: payload.ticketId,
              messageId: savedMessage.id,
              userType,
              userId,
              isGuest,
              bodyPreview:
                payload.body.substring(0, 50) +
                (payload.body.length > 50 ? "..." : ""),
            });
          } catch (error: any) {
            logger.error("❌ [Support Chat] خطا در ذخیره پیام", {
              error: error?.message || "Unknown error",
              stack: error?.stack,
              ticketId: payload.ticketId,
              userType,
              userId,
              isGuest,
              bodyLength: payload.body?.length,
              socketId: socket.id,
              timestamp: new Date().toISOString(),
            });
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
          // Get user info for logging
          const userInfo = socket.data.user || { type: "guest", id: "unknown" };

          // Check if user is registered (has workspaceUserId) even if type is guest
          const isRegisteredUser = userInfo.workspaceUserId;
          const isGuest =
            !isRegisteredUser &&
            (userInfo.type === "guest" || userInfo.type === "anonymous");
          const userType = isGuest ? "مهمان" : "کاربر ثبت‌نام‌شده";
          const userId = isGuest ? userInfo.guestId : userInfo.workspaceUserId;

          try {
            if (!payload?.ticketId || !payload?.messageId) {
              logger.warn("⚠️ [Support Chat] Invalid edit payload", {
                ticketId: payload.ticketId,
                messageId: payload.messageId,
                userType,
                userId,
                socketId: socket.id,
              });
              return;
            }

            logger.info("✏️ [Support Chat] درخواست ویرایش پیام", {
              ticketId: payload.ticketId,
              messageId: payload.messageId,
              userType,
              userId,
              isGuest,
              newBodyLength: payload.body?.length,
              socketId: socket.id,
              timestamp: new Date().toISOString(),
            });

            // Get original message for logging
            const originalMessage = await prisma.supportChatMessage.findUnique({
              where: { id: payload.messageId },
              select: { body: true, isEdited: true, editCount: true },
            });

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
            io.to(roomKey).emit("support-chat:message-edited", {
              messageId: payload.messageId,
              body: updatedMessage.body,
              isEdited: true,
              editedAt: updatedMessage.editedAt,
              editCount: updatedMessage.editCount,
            });

            logger.info("✅ [Support Chat] پیام با موفقیت ویرایش شد", {
              messageId: payload.messageId,
              ticketId: payload.ticketId,
              userType,
              userId,
              isGuest,
              originalBodyLength: originalMessage?.body?.length || 0,
              newBodyLength: payload.body.length,
              editCount: updatedMessage.editCount,
              wasEditedBefore: originalMessage?.isEdited || false,
              timestamp: updatedMessage.editedAt,
            });
          } catch (error: any) {
            logger.error("❌ [Support Chat] خطا در ویرایش پیام", {
              error: error?.message || "Unknown error",
              stack: error?.stack,
              ticketId: payload.ticketId,
              messageId: payload.messageId,
              userType,
              userId,
              isGuest,
              socketId: socket.id,
              timestamp: new Date().toISOString(),
            });
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
          // Get user info for logging
          const userInfo = socket.data.user || { type: "guest", id: "unknown" };

          // Check if user is registered (has workspaceUserId) even if type is guest
          const isRegisteredUser = userInfo.workspaceUserId;
          const isGuest =
            !isRegisteredUser &&
            (userInfo.type === "guest" || userInfo.type === "anonymous");
          const userType = isGuest ? "مهمان" : "کاربر ثبت‌نام‌شده";
          const userId = isGuest ? userInfo.guestId : userInfo.workspaceUserId;

          try {
            if (!payload?.ticketId || !payload?.messageId) {
              logger.warn("⚠️ [Support Chat] Invalid delete payload", {
                ticketId: payload.ticketId,
                messageId: payload.messageId,
                userType,
                userId,
                socketId: socket.id,
              });
              return;
            }

            logger.info("🗑️ [Support Chat] درخواست حذف پیام", {
              ticketId: payload.ticketId,
              messageId: payload.messageId,
              userType,
              userId,
              isGuest,
              socketId: socket.id,
              timestamp: new Date().toISOString(),
            });

            // Get original message for logging
            const originalMessage = await prisma.supportChatMessage.findUnique({
              where: { id: payload.messageId },
              select: { body: true, isDeleted: true, createdAt: true },
            });

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
            io.to(roomKey).emit("support-chat:message-deleted", {
              messageId: payload.messageId,
              isDeleted: true,
              deletedAt: deletedMessage.deletedAt,
            });

            logger.info("✅ [Support Chat] پیام با موفقیت حذف شد", {
              messageId: payload.messageId,
              ticketId: payload.ticketId,
              userType,
              userId,
              isGuest,
              originalBodyLength: originalMessage?.body?.length || 0,
              wasDeletedBefore: originalMessage?.isDeleted || false,
              messageAge: originalMessage?.createdAt
                ? Math.floor(
                    (new Date().getTime() -
                      new Date(originalMessage.createdAt).getTime()) /
                      1000 /
                      60
                  )
                : 0, // in minutes
              timestamp: deletedMessage.deletedAt,
            });
          } catch (error: any) {
            logger.error("❌ [Support Chat] خطا در حذف پیام", {
              error: error?.message || "Unknown error",
              stack: error?.stack,
              ticketId: payload.ticketId,
              messageId: payload.messageId,
              userType,
              userId,
              isGuest,
              socketId: socket.id,
              timestamp: new Date().toISOString(),
            });
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
          // Get user info for logging
          const userInfo = socket.data.user || { type: "guest", id: "unknown" };

          // Check if user is registered (has workspaceUserId) even if type is guest
          const isRegisteredUser = userInfo.workspaceUserId;
          const isGuest =
            !isRegisteredUser &&
            (userInfo.type === "guest" || userInfo.type === "anonymous");
          const userType = isGuest ? "مهمان" : "کاربر ثبت‌نام‌شده";
          const userId = isGuest ? userInfo.guestId : userInfo.workspaceUserId;

          if (!payload?.ticketId) {
            logger.warn("⚠️ [Support Chat] Invalid typing payload", {
              ticketId: payload.ticketId,
              userType,
              userId,
              socketId: socket.id,
            });
            return;
          }

          const roomKey = `support-ticket:${payload.ticketId}`;

          io.to(roomKey).emit("support-chat:typing", {
            ticketId: payload.ticketId,
            isTyping: payload.isTyping,
            senderId: userId,
          });

          logger.debug("⌨️ [Support Chat] Typing indicator", {
            ticketId: payload.ticketId,
            userType,
            userId,
            isGuest,
            isTyping: payload.isTyping,
            roomKey,
            socketId: socket.id,
            timestamp: new Date().toISOString(),
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
        // Get user info for logging
        const userInfo = socket.data.user || { type: "guest", id: "unknown" };

        // Check if user is registered (has workspaceUserId) even if type is guest
        const isRegisteredUser =
          userInfo.workspaceUserId && userInfo.workspaceId;
        const isGuest =
          !isRegisteredUser &&
          (userInfo.type === "guest" || userInfo.type === "anonymous");
        const userType = isGuest ? "مهمان" : "کاربر ثبت‌نام‌شده";
        const userId = isGuest ? userInfo.guestId : userInfo.workspaceUserId;

        logger.info("❌ [Socket.IO] کلاینت قطع شد", {
          socketId: socket.id,
          userType,
          userId,
          isGuest,
          timestamp: new Date().toISOString(),
        });

        // Handle user going offline
        const internalUserId = onlineUsers.get(socket.id);
        if (internalUserId) {
          onlineUsers.delete(socket.id);
          const userSocketSet = userSockets.get(internalUserId);
          if (userSocketSet) {
            userSocketSet.delete(socket.id);

            // If user has no more sockets, they're offline
            if (userSocketSet.size === 0) {
              userSockets.delete(internalUserId);
              socket.broadcast.emit("internal-chat:user-offline", {
                userId: internalUserId,
              });
              logger.debug(
                `👤 [Internal Chat] User ${internalUserId} is offline`
              );
              // Also broadcast for support-chat listeners
              socket.broadcast.emit("support-chat:user-offline", {
                userId: internalUserId,
              });
              logger.debug(
                `👤 [Support Chat] User ${internalUserId} is offline`
              );
            }
          }
        }

        // Log support chat disconnect
        if (isGuest) {
          logger.info("👋 [Support Chat] مهمان از چت خارج شد", {
            guestId: userId,
            socketId: socket.id,
            timestamp: new Date().toISOString(),
          });
        } else {
          logger.info("👋 [Support Chat] کاربر ثبت‌نام‌شده از چت خارج شد", {
            workspaceUserId: userId,
            socketId: socket.id,
            timestamp: new Date().toISOString(),
          });
        }
      });
    });

    logger.info("✅ [Socket.IO] Server initialized successfully");
  } else {
    logger.debug("♻️ [Socket.IO] Server already running");
  }

  res.end();
}
