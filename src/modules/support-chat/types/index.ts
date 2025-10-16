import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
import {
  SupportChatCategory,
  SupportChatLabel,
  SupportChatMessage,
  SupportChatTicket,
  SupportGuestUser,
  SupportMessageType,
  SupportPriority,
  SupportTicketStatus,
} from "@prisma/client";

/**
 * Support Chat Ticket with full relations
 */
export type SupportTicketWithRelations = SupportChatTicket & {
  category?: SupportChatCategory;
  labels?: SupportChatLabel[];
  guestUser?: SupportGuestUser;
  workspaceUser?: WorkspaceUserWithRelations;
  assignedTo?: WorkspaceUserWithRelations;
  messages?: SupportMessageWithRelations[];
  _count?: {
    messages: number;
    history: number;
  };
};

/**
 * Support Chat Message with relations
 */
export type SupportMessageWithRelations = SupportChatMessage & {
  ticket?: SupportChatTicket;
  supportAgent?: WorkspaceUserWithRelations;
  workspaceUser?: WorkspaceUserWithRelations;
  guestUser?: SupportGuestUser;
};

/**
 * Guest User (unregistered website visitor)
 */
export type GuestUserWithRelations = SupportGuestUser & {
  tickets?: SupportTicketWithRelations[];
};

/**
 * Support Chat Category with hierarchy
 */
export type SupportCategoryWithRelations = SupportChatCategory & {
  parent?: SupportChatCategory;
  children?: SupportChatCategory[];
  _count?: {
    tickets: number;
    children: number;
  };
};

/**
 * Support Chat Label
 */
export type SupportLabelWithRelations = SupportChatLabel & {
  _count?: {
    tickets: number;
  };
};

// Re-export enums for convenience
export { SupportMessageType, SupportPriority, SupportTicketStatus };
