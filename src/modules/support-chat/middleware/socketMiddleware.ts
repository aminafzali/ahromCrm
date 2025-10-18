/**
 * Socket Middleware
 * Handles authentication, validation, and error handling for socket connections
 */

import { Socket } from "socket.io";
import { SOCKET_EVENTS } from "../constants";
import { logger } from "../utils/logger";
import { authenticateSocket, SocketUser } from "../utils/socketAuth";

export interface SocketData {
  user: SocketUser;
  ticketId?: number;
  lastActivity?: Date;
}

export class SocketMiddleware {
  /**
   * Authentication middleware for socket connections
   */
  static authenticate(socket: Socket, next: (err?: Error) => void): void {
    try {
      const auth = socket.handshake.auth as any;
      const user = authenticateSocket(auth);

      (socket.data as SocketData).user = user;
      (socket.data as SocketData).lastActivity = new Date();

      logger.debug("Socket authenticated", {
        socketId: socket.id,
        userType: user.type,
        userId: user.workspaceUserId || user.guestId,
      });

      next();
    } catch (error: any) {
      logger.error("Socket authentication failed", {
        socketId: socket.id,
        error: error?.message,
      });
      next(new Error("Authentication failed"));
    }
  }

  /**
   * Validates socket data before processing events
   */
  static validateSocketData(socket: Socket): {
    isValid: boolean;
    error?: string;
  } {
    const user = (socket.data as SocketData).user;

    if (!user) {
      return { isValid: false, error: "User not authenticated" };
    }

    if (!user.type) {
      return { isValid: false, error: "Invalid user type" };
    }

    return { isValid: true };
  }

  /**
   * Updates last activity timestamp
   */
  static updateActivity(socket: Socket): void {
    (socket.data as SocketData).lastActivity = new Date();
  }

  /**
   * Gets user info from socket data
   */
  static getUserInfo(socket: Socket): SocketUser | null {
    const user = (socket.data as SocketData).user;
    return user || null;
  }

  /**
   * Sets ticket ID in socket data
   */
  static setTicketId(socket: Socket, ticketId: number): void {
    (socket.data as SocketData).ticketId = ticketId;
  }

  /**
   * Gets ticket ID from socket data
   */
  static getTicketId(socket: Socket): number | undefined {
    return (socket.data as SocketData).ticketId;
  }

  /**
   * Emits error to socket
   */
  static emitError(socket: Socket, error: string, details?: any): void {
    logger.warn("Socket error emitted", {
      socketId: socket.id,
      error,
      details,
    });

    socket.emit(SOCKET_EVENTS.ERROR, {
      error,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emits success response to socket
   */
  static emitSuccess(socket: Socket, event: string, data?: any): void {
    socket.emit(event, {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  }
}
