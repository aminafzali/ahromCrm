/**
 * Room Management Utilities
 * Handles room joining, authorization, and management for support chat
 */

import { SocketUser, isGuestUser, isRegisteredUser } from "./socketAuth";

export interface TicketInfo {
  id: number;
  ticketNumber: string;
  status: string;
  priority: string;
  guestUserId?: number | null;
  workspaceUserId?: number | null;
  guestUser?: {
    id: number;
    name: string | null;
    ipAddress: string | null;
    country: string | null;
  } | null;
  workspaceUser?: {
    id: number;
    user: {
      name: string | null;
      email: string | null;
    };
  } | null;
}

export interface RoomJoinResult {
  success: boolean;
  roomKey: string;
  roomSize: number;
  reason?: string;
}

/**
 * Checks if user is authorized to join a specific ticket room
 */
export function isAuthorizedToJoinRoom(
  userInfo: SocketUser,
  ticket: TicketInfo
): boolean {
  const isRegistered = isRegisteredUser(userInfo);
  const isGuest = isGuestUser(userInfo);

  // Admin users can join any ticket
  if (isRegistered && userInfo.role === "Admin") {
    return true;
  }

  // Guest users can join their own ticket
  if (isGuest && ticket.guestUserId && userInfo.guestId) {
    return ticket.guestUserId.toString() === userInfo.guestId;
  }

  // Registered users can join their own ticket
  if (isRegistered && ticket.workspaceUserId && userInfo.workspaceUserId) {
    return ticket.workspaceUserId === userInfo.workspaceUserId;
  }

  return false;
}

/**
 * Generates room key for a ticket
 */
export function generateRoomKey(ticketId: number): string {
  return `support-ticket:${ticketId}`;
}

/**
 * Validates ticket ID
 */
export function validateTicketId(ticketId: number): boolean {
  return !!(ticketId && typeof ticketId === "number" && ticketId > 0);
}

/**
 * Creates room join result
 */
export function createRoomJoinResult(
  success: boolean,
  ticketId: number,
  roomSize: number = 0,
  reason?: string
): RoomJoinResult {
  return {
    success,
    roomKey: generateRoomKey(ticketId),
    roomSize,
    reason,
  };
}
