/**
 * Support Chat Constants
 * Centralized constants for support chat functionality
 */

// Socket Events
export const SOCKET_EVENTS = {
  // Client to Server
  JOIN: "support-chat:join",
  LEAVE: "support-chat:leave",
  MESSAGE: "support-chat:message",
  TYPING: "support-chat:typing",
  MESSAGE_EDIT: "support-chat:message-edit",
  MESSAGE_DELETE: "support-chat:message-delete",
  STATUS_CHANGE: "support-chat:status-changed",
  ASSIGN: "support-chat:assigned",

  // Server to Client
  JOINED: "support-chat:joined",
  MESSAGE_RECEIVED: "support-chat:message-received",
  MESSAGE_ACK: "support-chat:ack",
  MESSAGE_EDITED: "support-chat:message-edited",
  MESSAGE_DELETED: "support-chat:message-deleted",
  TYPING_RECEIVED: "support-chat:typing",
  STATUS_CHANGED: "support-chat:status-changed",
  ASSIGNED: "support-chat:assigned",
  USER_ONLINE: "support-chat:user-online",
  USER_OFFLINE: "support-chat:user-offline",
  ERROR: "support-chat:error",
} as const;

// Room Configuration
export const SUPPORT_ROOM_CONFIG = {
  PREFIX: "support-ticket:",
  MAX_MEMBERS: 100,
} as const;

// Message Configuration
export const MESSAGE_CONFIG = {
  MAX_LENGTH: 4000,
  MIN_LENGTH: 1,
  RATE_LIMIT: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_MESSAGES: 10,
  },
} as const;

// Ticket Configuration
export const TICKET_CONFIG = {
  PRIORITY: {
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH",
    URGENT: "URGENT",
  },
  STATUS: {
    OPEN: "OPEN",
    IN_PROGRESS: "IN_PROGRESS",
    PENDING: "PENDING",
    RESOLVED: "RESOLVED",
    CLOSED: "CLOSED",
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized access",
  INVALID_TICKET_ID: "Invalid ticket ID provided",
  TICKET_NOT_FOUND: "Ticket not found",
  MESSAGE_VALIDATION_FAILED: "Message validation failed",
  MESSAGE_NOT_FOUND: "Message not found",
  NOT_SENDER_OF_MESSAGE: "Only the sender can edit/delete their message",
  INTERNAL_SERVER_ERROR: "Internal server error",
  RATE_LIMIT_EXCEEDED: "Rate limit exceeded. Please try again later.",
  WORKSPACE_NOT_FOUND: "Workspace not found",
  FAILED_TO_CREATE_TICKET: "Failed to create support ticket",
  INVALID_MESSAGE_BODY: "Message body cannot be empty",
  MESSAGE_TOO_LONG: "Message is too long",
  USER_NOT_AUTHENTICATED: "User not authenticated",
  INSUFFICIENT_PERMISSIONS: "Insufficient permissions",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  ROOM_JOINED: "User successfully joined ticket room",
  MESSAGE_SENT: "Message sent successfully",
  MESSAGE_EDITED: "Message edited successfully",
  MESSAGE_DELETED: "Message deleted successfully",
  TICKET_CREATED: "Ticket created successfully",
  TICKET_UPDATED: "Ticket updated successfully",
  TICKET_ASSIGNED: "Ticket assigned successfully",
  STATUS_UPDATED: "Status updated successfully",
} as const;

// User Types
export const USER_TYPES = {
  GUEST: "guest",
  REGISTERED: "registered",
  ANONYMOUS: "anonymous",
} as const;

// Message Types
export const MESSAGE_TYPES = {
  TEXT: "TEXT",
  IMAGE: "IMAGE",
  FILE: "FILE",
  SYSTEM: "SYSTEM",
} as const;

// Backward compatibility aliases
export const SUPPORT_SOCKET_EVENTS = SOCKET_EVENTS;
export const SUPPORT_ERROR_MESSAGES = ERROR_MESSAGES;
export const SUPPORT_SUCCESS_MESSAGES = SUCCESS_MESSAGES;
