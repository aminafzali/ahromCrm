/**
 * Internal Chat Constants
 * Centralized constants for internal chat functionality
 */

// Socket Events
export const INTERNAL_SOCKET_EVENTS = {
  // Client to Server
  JOIN: "internal-chat:join",
  LEAVE: "internal-chat:leave",
  MESSAGE: "internal-chat:message",
  TYPING: "internal-chat:typing",
  MESSAGE_EDIT: "internal-chat:message-edit",
  MESSAGE_DELETE: "internal-chat:message-delete",
  READ_RECEIPT: "internal-chat:read-receipt",
  USER_STATUS: "internal-chat:user-status",

  // Server to Client
  JOINED: "internal-chat:joined",
  MESSAGE_RECEIVED: "internal-chat:message",
  MESSAGE_ACK: "internal-chat:ack",
  MESSAGE_EDITED: "internal-chat:message-edited",
  MESSAGE_DELETED: "internal-chat:message-deleted",
  TYPING_RECEIVED: "internal-chat:typing",
  READ_RECEIPT_RECEIVED: "internal-chat:read-receipt",
  USER_ONLINE: "internal-chat:user-online",
  USER_OFFLINE: "internal-chat:user-offline",
  ERROR: "internal-chat:error",
} as const;

// Room Configuration
export const INTERNAL_ROOM_CONFIG = {
  PREFIX: "internal-chat-room:",
  MAX_MEMBERS: 50,
} as const;

// Message Configuration
export const INTERNAL_MESSAGE_CONFIG = {
  MAX_LENGTH: 4000,
  MIN_LENGTH: 1,
  RATE_LIMIT: {
    MAX_MESSAGES_PER_MINUTE: 20,
    WINDOW_MS: 60 * 1000,
  },
} as const;

// Error Messages
export const INTERNAL_ERROR_MESSAGES = {
  INVALID_ROOM_ID: "Invalid room ID provided",
  UNAUTHORIZED: "User not authorized",
  FORBIDDEN: "Access denied",
  ROOM_NOT_FOUND: "Room not found",
  MESSAGE_VALIDATION_FAILED: "Message validation failed",
  RATE_LIMIT_EXCEEDED: "Rate limit exceeded",
  SOCKET_CONNECTION_FAILED: "Socket connection failed",
  JOIN_ERROR: "Failed to join room",
  MESSAGE_ERROR: "Failed to handle message",
  EDIT_ERROR: "Failed to edit message",
  DELETE_ERROR: "Failed to delete message",
  READ_RECEIPT_ERROR: "Failed to persist read receipt",
} as const;

// Success Messages
export const INTERNAL_SUCCESS_MESSAGES = {
  ROOM_JOINED: "Successfully joined room",
  MESSAGE_SENT: "Message sent successfully",
  MESSAGE_EDITED: "Message edited successfully",
  MESSAGE_DELETED: "Message deleted successfully",
  READ_RECEIPT_SENT: "Read receipt sent successfully",
} as const;
