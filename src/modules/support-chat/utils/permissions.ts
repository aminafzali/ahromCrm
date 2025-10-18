/**
 * Permissions Utilities
 * Handles user permissions and access control for support chat
 */

import { TicketInfo } from "./roomManagement";
import { SocketUser, isGuestUser, isRegisteredUser } from "./socketAuth";

export interface PermissionResult {
  allowed: boolean;
  reason?: string;
}

export class SupportChatPermissions {
  /**
   * Checks if user can join a ticket room
   */
  static canJoinTicket(
    userInfo: SocketUser,
    ticket: TicketInfo
  ): PermissionResult {
    const isRegistered = isRegisteredUser(userInfo);
    const isGuest = isGuestUser(userInfo);

    // Admin users can join any ticket
    if (isRegistered && userInfo.role === "Admin") {
      return { allowed: true };
    }

    // Guest users can join their own ticket
    if (isGuest && ticket.guestUserId && userInfo.guestId) {
      if (ticket.guestUserId.toString() === userInfo.guestId) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: "Guest users can only join their own tickets",
      };
    }

    // Registered users can join their own ticket
    if (isRegistered && ticket.workspaceUserId && userInfo.workspaceUserId) {
      if (ticket.workspaceUserId === userInfo.workspaceUserId) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: "Registered users can only join their own tickets",
      };
    }

    return {
      allowed: false,
      reason: "User not authorized to join this ticket",
    };
  }

  /**
   * Checks if user can send messages
   */
  static canSendMessage(userInfo: SocketUser): PermissionResult {
    if (!userInfo || !userInfo.type) {
      return {
        allowed: false,
        reason: "User not authenticated",
      };
    }

    // All authenticated users can send messages
    return { allowed: true };
  }

  /**
   * Checks if user can edit a message
   */
  static canEditMessage(
    userInfo: SocketUser,
    messageUserId?: number,
    messageGuestId?: number
  ): PermissionResult {
    if (!userInfo || !userInfo.type) {
      return {
        allowed: false,
        reason: "User not authenticated",
      };
    }

    const isRegistered = isRegisteredUser(userInfo);
    const isGuest = isGuestUser(userInfo);

    // Check if user owns the message
    if (isRegistered && userInfo.workspaceUserId && messageUserId) {
      if (userInfo.workspaceUserId === messageUserId) {
        return { allowed: true };
      }
    }

    if (isGuest && userInfo.guestId && messageGuestId) {
      if (userInfo.guestId === messageGuestId.toString()) {
        return { allowed: true };
      }
    }

    return {
      allowed: false,
      reason: "Users can only edit their own messages",
    };
  }

  /**
   * Checks if user can delete a message
   */
  static canDeleteMessage(
    userInfo: SocketUser,
    messageUserId?: number,
    messageGuestId?: number
  ): PermissionResult {
    if (!userInfo || !userInfo.type) {
      return {
        allowed: false,
        reason: "User not authenticated",
      };
    }

    const isRegistered = isRegisteredUser(userInfo);
    const isGuest = isGuestUser(userInfo);

    // Check if user owns the message
    if (isRegistered && userInfo.workspaceUserId && messageUserId) {
      if (userInfo.workspaceUserId === messageUserId) {
        return { allowed: true };
      }
    }

    if (isGuest && userInfo.guestId && messageGuestId) {
      if (userInfo.guestId === messageGuestId.toString()) {
        return { allowed: true };
      }
    }

    return {
      allowed: false,
      reason: "Users can only delete their own messages",
    };
  }

  /**
   * Checks if user can view internal messages
   */
  static canViewInternalMessages(userInfo: SocketUser): PermissionResult {
    if (!userInfo || !userInfo.type) {
      return {
        allowed: false,
        reason: "User not authenticated",
      };
    }

    // Only registered users with admin role can view internal messages
    if (isRegisteredUser(userInfo) && userInfo.role === "Admin") {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: "Only admin users can view internal messages",
    };
  }

  /**
   * Checks if user can send internal messages
   */
  static canSendInternalMessages(userInfo: SocketUser): PermissionResult {
    if (!userInfo || !userInfo.type) {
      return {
        allowed: false,
        reason: "User not authenticated",
      };
    }

    // Only registered users with admin role can send internal messages
    if (isRegisteredUser(userInfo) && userInfo.role === "Admin") {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: "Only admin users can send internal messages",
    };
  }

  /**
   * Checks if user can access ticket information
   */
  static canAccessTicket(
    userInfo: SocketUser,
    ticket: TicketInfo
  ): PermissionResult {
    return this.canJoinTicket(userInfo, ticket);
  }
}

// Helper functions for role-based permissions
export function canAccessSupportChat(role: any): boolean {
  return role?.name === "Admin";
}

export function canAssignTickets(role: any): boolean {
  return role?.name === "Admin";
}

export function canUpdateTicketStatus(role: any): boolean {
  return role?.name === "Admin";
}
