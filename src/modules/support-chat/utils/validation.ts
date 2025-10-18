/**
 * Support Chat Validation Utilities
 * Handles validation logic for support chat functionality
 */

import { MESSAGE_CONFIG, SUPPORT_ERROR_MESSAGES } from "../constants";
import { SupportMessagePayload, ValidationResult } from "../types";

export class SupportChatValidator {
  /**
   * Validates message payload
   */
  static validateMessage(payload: SupportMessagePayload): ValidationResult {
    const errors: string[] = [];

    // Validate ticket ID
    if (!payload.ticketId || typeof payload.ticketId !== "number") {
      errors.push(SUPPORT_ERROR_MESSAGES.INVALID_TICKET_ID);
    }

    // Validate message body
    if (!payload.body || typeof payload.body !== "string") {
      errors.push(SUPPORT_ERROR_MESSAGES.INVALID_MESSAGE_BODY);
    } else {
      const trimmedBody = payload.body.trim();

      if (trimmedBody.length < MESSAGE_CONFIG.MIN_LENGTH) {
        errors.push(SUPPORT_ERROR_MESSAGES.INVALID_MESSAGE_BODY);
      }

      if (trimmedBody.length > MESSAGE_CONFIG.MAX_LENGTH) {
        errors.push(SUPPORT_ERROR_MESSAGES.MESSAGE_TOO_LONG);
      }
    }

    // Validate reply ID if provided
    if (
      payload.replyToId &&
      (typeof payload.replyToId !== "number" || payload.replyToId <= 0)
    ) {
      errors.push("Invalid reply message ID");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates ticket ID
   */
  static validateTicketId(ticketId: any): boolean {
    return typeof ticketId === "number" && ticketId > 0;
  }

  /**
   * Validates message ID
   */
  static validateMessageId(messageId: any): boolean {
    return typeof messageId === "number" && messageId > 0;
  }

  /**
   * Validates user ID
   */
  static validateUserId(userId: any): boolean {
    return typeof userId === "number" && userId > 0;
  }

  /**
   * Validates email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates phone format
   */
  static validatePhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  }

  /**
   * Sanitizes message body
   */
  static sanitizeMessageBody(body: string): string {
    return body.trim().replace(/\s+/g, " ");
  }

  /**
   * Sanitizes user input
   */
  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, "");
  }

  /**
   * Validates pagination parameters
   */
  static validatePagination(params: {
    page?: number;
    limit?: number;
  }): ValidationResult {
    const errors: string[] = [];

    if (params.page !== undefined) {
      if (typeof params.page !== "number" || params.page < 1) {
        errors.push("Page must be a positive number");
      }
    }

    if (params.limit !== undefined) {
      if (
        typeof params.limit !== "number" ||
        params.limit < 1 ||
        params.limit > 100
      ) {
        errors.push("Limit must be between 1 and 100");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates ticket creation data
   */
  static validateTicketCreation(data: {
    subject: string;
    description: string;
    categoryId?: number;
    priority?: string;
  }): ValidationResult {
    const errors: string[] = [];

    if (
      !data.subject ||
      typeof data.subject !== "string" ||
      data.subject.trim().length === 0
    ) {
      errors.push("Subject is required");
    }

    if (
      !data.description ||
      typeof data.description !== "string" ||
      data.description.trim().length === 0
    ) {
      errors.push("Description is required");
    }

    if (
      data.categoryId !== undefined &&
      (!Number.isInteger(data.categoryId) || data.categoryId <= 0)
    ) {
      errors.push("Invalid category ID");
    }

    if (
      data.priority &&
      !["LOW", "MEDIUM", "HIGH", "URGENT"].includes(data.priority)
    ) {
      errors.push("Invalid priority level");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
