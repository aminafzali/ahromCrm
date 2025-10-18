/**
 * Socket Authentication Utilities
 * Handles user authentication and authorization for support chat
 */

export interface SocketUser {
  type: "registered" | "guest" | "anonymous";
  workspaceUserId?: number;
  workspaceId?: number;
  role?: string;
  guestId?: string;
  ticketId?: number;
  id?: string;
}

export interface AuthData {
  workspaceUserId?: number;
  workspaceId?: number;
  role?: string;
  guestId?: string;
  ticketId?: number;
}

/**
 * Authenticates socket connection based on auth data
 */
export function authenticateSocket(auth: AuthData): SocketUser {
  try {
    // Handle registered users
    if (auth && typeof auth.workspaceUserId === "number") {
      return {
        type: "registered",
        workspaceUserId: auth.workspaceUserId,
        workspaceId: auth.workspaceId,
        role: auth.role,
      };
    }

    // Handle guest users (with or without guestId)
    if (auth && (auth.guestId || auth.ticketId)) {
      return {
        type: "guest",
        guestId: auth.guestId,
        ticketId: auth.ticketId,
      };
    }

    // Allow anonymous connections for public support chat
    return {
      type: "anonymous",
      id: "unknown",
    };
  } catch (error) {
    // Allow connection even if auth fails
    return {
      type: "anonymous",
      id: "unknown",
    };
  }
}

/**
 * Determines if user is registered based on user info
 */
export function isRegisteredUser(userInfo: SocketUser): boolean {
  return !!(userInfo.workspaceUserId && userInfo.workspaceId);
}

/**
 * Determines if user is guest based on user info
 */
export function isGuestUser(userInfo: SocketUser): boolean {
  return (
    !isRegisteredUser(userInfo) &&
    (userInfo.type === "guest" || userInfo.type === "anonymous")
  );
}

/**
 * Gets user type for logging
 */
export function getUserType(userInfo: SocketUser): string {
  return isGuestUser(userInfo) ? "مهمان" : "کاربر ثبت‌نام‌شده";
}

/**
 * Gets user ID for logging
 */
export function getUserId(userInfo: SocketUser): string | number | undefined {
  return isGuestUser(userInfo) ? userInfo.guestId : userInfo.workspaceUserId;
}
