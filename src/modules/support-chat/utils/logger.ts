/**
 * Logger Utilities
 * Centralized logging for support chat functionality
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}] [Support Chat]`;

    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`;
    }

    return `${prefix} ${message}`;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage("DEBUG", message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage("INFO", message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage("WARN", message, data));
    }
  }

  error(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage("ERROR", message, data));
    }
  }
}

// Create logger instance
const isProduction = process.env.NODE_ENV === "production";
export const logger = new Logger(isProduction ? LogLevel.INFO : LogLevel.DEBUG);

// Specific loggers for different modules
export const socketLogger = {
  connection: (socketId: string) =>
    logger.info(`Socket connected: ${socketId}`),
  disconnection: (socketId: string) =>
    logger.info(`Socket disconnected: ${socketId}`),
  join: (socketId: string, ticketId: number) =>
    logger.info(`Socket ${socketId} joined ticket ${ticketId}`),
  leave: (socketId: string, ticketId: number) =>
    logger.info(`Socket ${socketId} left ticket ${ticketId}`),
};

export const messageLogger = {
  received: (ticketId: number, userId: string | number, bodyLength: number) =>
    logger.info(`Message received`, { ticketId, userId, bodyLength }),
  sent: (ticketId: number, messageId: number, recipientsCount: number) =>
    logger.info(`Message sent`, { ticketId, messageId, recipientsCount }),
  ack: (tempId: string, messageId: number) =>
    logger.debug(`Message ACK sent`, { tempId, messageId }),
};

export const roomLogger = {
  joined: (roomKey: string, roomSize: number) =>
    logger.info(`Room joined`, { roomKey, roomSize }),
  left: (roomKey: string, roomSize: number) =>
    logger.info(`Room left`, { roomKey, roomSize }),
  unauthorized: (socketId: string, ticketId: number) =>
    logger.warn(`Unauthorized join attempt`, { socketId, ticketId }),
};
