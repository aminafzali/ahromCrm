/**
 * Support Chat Types
 * TypeScript interfaces and types for support chat functionality
 */

import { SupportPriority, SupportTicketStatus } from "@prisma/client";

// Re-export Prisma types for convenience
export { SupportPriority, SupportTicketStatus };

// Base User Types
export interface BaseUser {
  id: number;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface GuestUser extends BaseUser {
  type: "guest";
  ipAddress?: string | null;
  country?: string | null;
  userAgent?: string | null;
}

export interface RegisteredUser extends BaseUser {
  type: "registered";
  workspaceUserId: number;
  workspaceId: number;
  role?: string | null;
}

export interface AnonymousUser {
  type: "anonymous";
  id: string;
}

export type SupportUser = GuestUser | RegisteredUser | AnonymousUser;

// Message Types
export interface SupportMessage {
  id: number | string; // temp id allowed client-side
  ticketId: number;
  body: string;
  messageType: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
  isInternal: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
  isVisible?: boolean;
  replyToId?: number | null;
  replyTo?: {
    id: number;
    body?: string | null;
    sender?: { name?: string | null } | null;
    isDeleted?: boolean;
  } | null;
  sender?: SupportUser;
  createdAt: string;
  updatedAt?: string;
  editedAt?: string;
  deletedAt?: string;
}

// Ticket Types
export interface SupportTicket {
  id: number;
  ticketNumber: string;
  subject: string;
  description: string;
  status: SupportTicketStatus;
  priority: SupportPriority;
  categoryId?: number | null;
  category?: {
    id: number;
    name: string;
  } | null;
  workspaceId: number;
  guestUserId?: number | null;
  workspaceUserId?: number | null;
  assignedToId?: number | null;
  assignedTo?: {
    id: number;
    displayName?: string | null;
    user: { name: string | null };
  } | null;
  guestUser?: GuestUser | null;
  workspaceUser?: {
    id: number;
    displayName?: string | null;
    user: { name: string | null; email: string | null };
  } | null;
  messages?: SupportMessage[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string | null;
}

// Socket Event Types
export interface SupportMessagePayload {
  ticketId: number;
  body: string;
  tempId?: string;
  isInternal?: boolean;
  replyToId?: number;
  replySnapshot?: string;
}

export interface SupportMessageAckPayload {
  tempId?: string;
  messageId: number;
  savedMessage: SupportMessage;
}

export interface SupportTypingPayload {
  ticketId: number;
  isTyping: boolean;
  userId?: number;
}

export interface SupportMessageEditPayload {
  ticketId: number;
  messageId: number;
  newBody: string;
}

export interface SupportMessageDeletePayload {
  ticketId: number;
  messageId: number;
}

export interface SupportStatusChangePayload {
  ticketId: number;
  status: SupportTicketStatus;
}

export interface SupportAssignPayload {
  ticketId: number;
  assignedToId: number;
}

// API Response Types
export interface SupportApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Hook Types
export interface UseSupportChatReturn {
  // Connection
  connected: boolean;
  connect: () => void;
  disconnect: () => void;

  // Room Management
  joinRoom: (ticketId: number) => void;
  leaveRoom: (ticketId: number) => void;

  // Messaging
  sendMessage: (payload: SupportMessagePayload) => void;
  editMessage: (payload: SupportMessageEditPayload) => void;
  deleteMessage: (payload: SupportMessageDeletePayload) => void;

  // Event Listeners
  onMessage: (callback: (message: SupportMessage) => void) => () => void;
  onAck: (callback: (data: SupportMessageAckPayload) => void) => () => void;
  onTyping: (callback: (data: SupportTypingPayload) => void) => () => void;
  onMessageEdited: (callback: (data: any) => void) => () => void;
  onMessageDeleted: (callback: (data: any) => void) => () => void;
  onStatusChanged: (
    callback: (data: SupportStatusChangePayload) => void
  ) => () => void;
  onAssigned: (callback: (data: SupportAssignPayload) => void) => () => void;
  onError: (callback: (error: any) => void) => () => void;

  // Typing
  sendTyping: (ticketId: number, isTyping: boolean) => void;

  // User status
  setUserOnline: (workspaceUserId: number) => void;
  onUserOnline: (callback: (data: any) => void) => () => void;
  onUserOffline: (callback: (data: any) => void) => () => void;

  // Repository
  repo: any;

  // Compatibility methods
  joinTicket: (ticketId: number) => void;
  leaveTicket: (ticketId: number) => void;
  sendMessageRealtime: (payload: SupportMessagePayload) => void;
  emitEditMessage: (ticketId: number, messageId: number, text: string) => void;
  emitDeleteMessage: (ticketId: number, messageId: number) => void;
}

// Service Types
export interface SupportChatServiceInterface {
  // Ticket Management
  createTicket: (data: any, context: any) => Promise<SupportTicket>;
  getTicket: (ticketId: number, context: any) => Promise<SupportTicket>;
  updateTicket: (
    ticketId: number,
    data: any,
    context: any
  ) => Promise<SupportTicket>;

  // Message Management
  sendMessage: (
    ticketId: number,
    data: any,
    context: any
  ) => Promise<SupportMessage>;
  editMessage: (
    ticketId: number,
    messageId: number,
    data: any,
    context: any
  ) => Promise<SupportMessage>;
  deleteMessage: (
    ticketId: number,
    messageId: number,
    context: any
  ) => Promise<SupportMessage>;

  // Categories
  getCategories: (context: any) => Promise<any[]>;

  // Labels
  getLabels: (context: any) => Promise<any[]>;
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Rate Limiting Types
export interface RateLimitData {
  messageCount: number;
  lastReset: number;
}

// Room Management Types
export interface RoomInfo {
  ticketId: number;
  roomKey: string;
  memberCount: number;
  isActive: boolean;
}

// Extended Types with Relations
export interface SupportMessageWithRelations extends SupportMessage {
  supportAgent?: {
    id: number;
    displayName?: string | null;
  } | null;
  workspaceUser?: {
    id: number;
    displayName?: string | null;
    user: { name: string | null; email: string | null };
  } | null;
  guestUser?: {
    id: number;
    name: string | null;
    email?: string | null;
  } | null;
  replyTo?: {
    id: number;
    body?: string | null;
    supportAgent?: { displayName?: string | null } | null;
    workspaceUser?: { displayName?: string | null } | null;
    guestUser?: { name?: string | null } | null;
    isDeleted?: boolean;
  } | null;
  isRead?: boolean;
  isOwnMessage?: boolean;
}

export interface SupportTicketWithRelations extends SupportTicket {
  _count?: {
    messages: number;
  };
  lastActivityAt?: string | null;
}
