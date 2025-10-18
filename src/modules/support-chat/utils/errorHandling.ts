/**
 * Error Handling Utilities
 * Centralized error handling for support chat
 */

import { SUPPORT_ERROR_MESSAGES } from "../constants";
import { logger } from "./logger";

export interface SupportChatError extends Error {
  code?: string;
  statusCode?: number;
  details?: any;
}

export class SupportChatErrorHandler {
  /**
   * Creates a standardized error object
   */
  static createError(
    message: string,
    code?: string,
    statusCode: number = 500,
    details?: any
  ): SupportChatError {
    const error = new Error(message) as SupportChatError;
    error.code = code;
    error.statusCode = statusCode;
    error.details = details;
    return error;
  }

  /**
   * Handles database errors
   */
  static handleDatabaseError(error: any, context: string): SupportChatError {
    logger.error("Database error", {
      context,
      error: error?.message,
      code: error?.code,
      stack: error?.stack,
    });

    if (error?.code === "P2002") {
      return this.createError("Duplicate entry found", "DUPLICATE_ENTRY", 409, {
        field: error?.meta?.target,
      });
    }

    if (error?.code === "P2003") {
      return this.createError(
        "Foreign key constraint failed",
        "FOREIGN_KEY_CONSTRAINT",
        400,
        { field: error?.meta?.field_name }
      );
    }

    if (error?.code === "P2025") {
      return this.createError("Record not found", "RECORD_NOT_FOUND", 404);
    }

    return this.createError(
      "Database operation failed",
      "DATABASE_ERROR",
      500,
      { originalError: error?.message }
    );
  }

  /**
   * Handles validation errors
   */
  static handleValidationError(
    errors: string[],
    context: string
  ): SupportChatError {
    logger.warn("Validation error", {
      context,
      errors,
    });

    return this.createError(
      SUPPORT_ERROR_MESSAGES.MESSAGE_VALIDATION_FAILED,
      "VALIDATION_ERROR",
      400,
      { errors }
    );
  }

  /**
   * Handles authentication errors
   */
  static handleAuthError(context: string): SupportChatError {
    logger.warn("Authentication error", { context });

    return this.createError("Authentication required", "AUTH_ERROR", 401);
  }

  /**
   * Handles authorization errors
   */
  static handleAuthorizationError(context: string): SupportChatError {
    logger.warn("Authorization error", { context });

    return this.createError(
      SUPPORT_ERROR_MESSAGES.UNAUTHORIZED,
      "AUTHORIZATION_ERROR",
      403
    );
  }

  /**
   * Handles rate limiting errors
   */
  static handleRateLimitError(context: string): SupportChatError {
    logger.warn("Rate limit exceeded", { context });

    return this.createError(
      SUPPORT_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
      "RATE_LIMIT_ERROR",
      429
    );
  }

  /**
   * Handles socket errors
   */
  static handleSocketError(
    error: any,
    socketId: string,
    context: string
  ): SupportChatError {
    logger.error("Socket error", {
      socketId,
      context,
      error: error?.message,
      stack: error?.stack,
    });

    return this.createError("Socket operation failed", "SOCKET_ERROR", 500, {
      socketId,
      originalError: error?.message,
    });
  }

  /**
   * Logs error with context
   */
  static logError(
    error: SupportChatError,
    context: string,
    additionalData?: any
  ): void {
    logger.error("Support chat error", {
      context,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      stack: error.stack,
      ...additionalData,
    });
  }

  /**
   * Formats error for client response
   */
  static formatErrorForClient(error: SupportChatError): {
    error: string;
    code?: string;
    details?: any;
  } {
    return {
      error: error.message,
      code: error.code,
      details: error.details,
    };
  }
}
