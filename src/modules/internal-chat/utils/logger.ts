/**
 * Logger Utilities for Internal Chat
 * Centralized logging for internal chat functionality
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
    const prefix = `[${timestamp}] [${level}] [Internal Chat]`;

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
