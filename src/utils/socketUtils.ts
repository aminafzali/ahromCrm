/**
 * Socket.IO Utility Functions
 * Centralized helper functions and middleware for Socket.IO operations
 */

import { Socket } from "socket.io";

// Logger instances
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[Socket.IO] ${message}`, data || "");
  },
  error: (message: string, data?: any) => {
    console.error(`[Socket.IO] ${message}`, data || "");
  },
  debug: (message: string, data?: any) => {
    console.debug(`[Socket.IO] ${message}`, data || "");
  },
};

export const socketLogger = {
  connection: (socketId: string) => {
    logger.info(`Socket connected: ${socketId}`);
  },
  disconnection: (socketId: string, reason: string) => {
    logger.info(`Socket disconnected: ${socketId}, reason: ${reason}`);
  },
  error: (socketId: string, error: any) => {
    logger.error(`Socket error: ${socketId}`, error);
  },
};

/**
 * Socket Middleware for authentication and workspace verification
 */
export class SocketMiddleware {
  /**
   * Update last activity timestamp
   */
  static updateActivity(socket: Socket) {
    // Update last activity timestamp
    (socket as any).lastActivity = Date.now();
  }

  /**
   * Authenticate socket connection with workspace context
   */
  static authenticate(socket: Socket, next: (err?: Error) => void) {
    try {
      // Get workspace user ID and workspace ID from handshake
      const workspaceUserId = socket.handshake.auth?.workspaceUserId;
      const workspaceId = socket.handshake.auth?.workspaceId;

      if (!workspaceUserId || !workspaceId) {
        return next(new Error("Workspace user ID and workspace ID required"));
      }

      // Add user and workspace info to socket
      const wsId =
        typeof workspaceId === "string"
          ? parseInt(workspaceId, 10)
          : Number(workspaceId);
      (socket as any).user = {
        id: workspaceUserId,
        workspaceId: wsId,
      };

      (socket as any).workspaceId = wsId;
      (socket as any).workspaceUserId = workspaceUserId;
      (socket as any).authenticated = true;

      logger.info("Socket authenticated successfully", {
        workspaceUserId: workspaceUserId,
        workspaceId: wsId,
      });

      next();
    } catch (error) {
      logger.error("Authentication error", { error });
      next(new Error("Authentication failed"));
    }
  }

  /**
   * Rate limiting middleware
   */
  static rateLimit(maxRequests: number = 100, windowMs: number = 60000) {
    const requests = new Map<string, { count: number; resetTime: number }>();

    return (socket: Socket, next: (err?: Error) => void) => {
      const clientId = socket.id;
      const now = Date.now();

      const clientData = requests.get(clientId);

      if (!clientData || now > clientData.resetTime) {
        requests.set(clientId, { count: 1, resetTime: now + windowMs });
        return next();
      }

      if (clientData.count >= maxRequests) {
        return next(new Error("Rate limit exceeded"));
      }

      clientData.count++;
      next();
    };
  }

  /**
   * Validate socket data
   */
  static validateData(schema: any) {
    return (socket: Socket, next: (err?: Error) => void) => {
      try {
        // Validate socket data against schema
        const validation = schema.safeParse(socket.data);
        if (!validation.success) {
          return next(new Error("Invalid data format"));
        }
        next();
      } catch (error) {
        next(new Error("Data validation failed"));
      }
    };
  }

  /**
   * Verify workspace access for socket
   */
  static async verifyWorkspaceAccess(
    socket: Socket,
    next: (err?: Error) => void
  ) {
    try {
      const userId = (socket as any).user?.id;
      const workspaceId = (socket as any).workspaceId;

      if (!userId || !workspaceId) {
        return next(new Error("User or workspace information missing"));
      }

      // Import Prisma dynamically to avoid circular dependencies
      const prisma = (await import("@/lib/prisma")).default;

      // Check if user is member of the workspace
      const workspaceUser = await prisma.workspaceUser.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: workspaceId,
            userId: parseInt(userId),
          },
        },
        include: {
          role: true,
        },
      });

      if (!workspaceUser) {
        return next(new Error("User is not a member of this workspace"));
      }

      // Add role information to socket
      (socket as any).workspaceUserId = workspaceUser.id;
      (socket as any).userRole = workspaceUser.role;
      (socket as any).workspaceUser = workspaceUser;

      next();
    } catch (error) {
      next(new Error("Workspace access verification failed"));
    }
  }
}

/**
 * Socket Room Manager for workspace-scoped rooms
 */
export class SocketRoomManager {
  private static instance: SocketRoomManager;
  private rooms: Map<string, Set<string>> = new Map();

  static getInstance(): SocketRoomManager {
    if (!SocketRoomManager.instance) {
      SocketRoomManager.instance = new SocketRoomManager();
    }
    return SocketRoomManager.instance;
  }

  joinRoom(socket: Socket, roomId: string): void {
    const workspaceId = (socket as any).workspaceId;
    const fullRoomId = `workspace:${workspaceId}:${roomId}`;

    socket.join(fullRoomId);

    if (!this.rooms.has(fullRoomId)) {
      this.rooms.set(fullRoomId, new Set());
    }
    this.rooms.get(fullRoomId)!.add(socket.id);

    logger.info(`Socket ${socket.id} joined room ${fullRoomId}`);
  }

  leaveRoom(socket: Socket, roomId: string): void {
    const workspaceId = (socket as any).workspaceId;
    const fullRoomId = `workspace:${workspaceId}:${roomId}`;

    socket.leave(fullRoomId);

    const roomSockets = this.rooms.get(fullRoomId);
    if (roomSockets) {
      roomSockets.delete(socket.id);
      if (roomSockets.size === 0) {
        this.rooms.delete(fullRoomId);
      }
    }

    logger.info(`Socket ${socket.id} left room ${fullRoomId}`);
  }

  getRoomSockets(workspaceId: number, roomId: string): Set<string> {
    const fullRoomId = `workspace:${workspaceId}:${roomId}`;
    return this.rooms.get(fullRoomId) || new Set();
  }

  getWorkspaceRooms(workspaceId: number): string[] {
    const prefix = `workspace:${workspaceId}:`;
    return Array.from(this.rooms.keys())
      .filter((room) => room.startsWith(prefix))
      .map((room) => room.replace(prefix, ""));
  }
}

/**
 * Socket Error Handler
 */
export class SocketErrorHandler {
  static handleError(socket: Socket, error: any, event?: string): void {
    logger.error(`Socket error on ${event || "unknown event"}`, {
      socketId: socket.id,
      error: error.message || error,
    });

    // Emit error to client
    socket.emit("error", {
      message: error.message || "An error occurred",
      event: event,
    });
  }

  static handleConnectionError(socket: Socket, error: any): void {
    logger.error("Connection error", {
      socketId: socket.id,
      error: error.message || error,
    });
  }
}

/**
 * Socket Message Validator
 */
export class SocketMessageValidator {
  static validateMessage(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data) {
      errors.push("Message data is required");
      return { isValid: false, errors };
    }

    if (!data.body || typeof data.body !== "string") {
      errors.push("Message body is required and must be a string");
    }

    if (!data.roomId || typeof data.roomId !== "number") {
      errors.push("Room ID is required and must be a number");
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateRoomJoin(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data || typeof data !== "number") {
      errors.push("Room ID is required and must be a number");
    }

    return { isValid: errors.length === 0, errors };
  }
}

// Export default object with all utilities
const socketUtils = {
  logger,
  socketLogger,
  SocketMiddleware,
  SocketRoomManager,
  SocketErrorHandler,
  SocketMessageValidator,
};

export default socketUtils;
