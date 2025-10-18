/**
 * Message Handling Utilities
 * Handles message validation, processing, and broadcasting
 */

export interface MessagePayload {
  ticketId: number;
  body: string;
  tempId?: string;
  isInternal?: boolean;
  replyToId?: number;
  replySnapshot?: string;
}

export interface MessageValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates message payload
 */
export function validateMessagePayload(
  payload: MessagePayload
): MessageValidationResult {
  const errors: string[] = [];

  if (!payload.ticketId || typeof payload.ticketId !== "number") {
    errors.push("Ticket ID is required and must be a number");
  }

  if (!payload.body || typeof payload.body !== "string") {
    errors.push("Message body is required and must be a string");
  }

  if (payload.body && payload.body.trim().length === 0) {
    errors.push("Message body cannot be empty");
  }

  if (payload.body && payload.body.length > 4000) {
    errors.push("Message body cannot exceed 4000 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitizes message body
 */
export function sanitizeMessageBody(body: string): string {
  return body.trim().replace(/\s+/g, " ");
}

/**
 * Creates message acknowledgment payload
 */
export function createMessageAck(
  tempId: string,
  messageId: number,
  savedMessage: any
) {
  return {
    tempId,
    messageId,
    savedMessage,
  };
}

/**
 * Creates message broadcast payload
 */
export function createMessageBroadcast(
  message: any,
  roomKey: string,
  recipientsCount: number
) {
  return {
    message,
    roomKey,
    recipientsCount,
  };
}

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT_CONFIG = {
  MAX_MESSAGES_PER_MINUTE: 10,
  WINDOW_MS: 60 * 1000, // 1 minute
} as const;

/**
 * Checks if user can send message based on rate limit
 */
export function canSendMessage(
  messageCount: number,
  lastReset: number,
  config: typeof RATE_LIMIT_CONFIG = RATE_LIMIT_CONFIG
): boolean {
  const now = Date.now();
  const timeSinceReset = now - lastReset;

  if (timeSinceReset >= config.WINDOW_MS) {
    return true; // Reset window
  }

  return messageCount < config.MAX_MESSAGES_PER_MINUTE;
}
