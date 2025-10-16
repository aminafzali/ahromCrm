import { TeamWithRelations } from "@/modules/teams/types";
import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
import {
  ChatMessage,
  ChatMessageType,
  ChatRoom,
  ChatRoomMember,
  ChatRoomMemberRole,
  InternalChatRoomType,
} from "@prisma/client";

// Room Types
export type InternalChatRoom = ChatRoom & {
  members?: InternalChatRoomMemberWithRelations[];
  messages?: InternalChatMessageWithRelations[];
  team?: TeamWithRelations;
  _count?: {
    members: number;
    messages: number;
  };
};

// Member Types
export type InternalChatRoomMemberWithRelations = ChatRoomMember & {
  workspaceUser: WorkspaceUserWithRelations;
};

// Message Types
export type InternalChatMessageWithRelations = ChatMessage & {
  sender: WorkspaceUserWithRelations;
  replyTo?: ChatMessage;
};

// Export enums
export { ChatMessageType, ChatRoomMemberRole, InternalChatRoomType };

export interface WorkspaceUserLite {
  id: number;
  displayName?: string | null;
}

export interface InternalMessage {
  id: number | string; // temp id allowed client-side
  roomId: number;
  body: string;
  senderId: number;
  sender?: WorkspaceUserLite;
  replyToId?: number | null;
  replyTo?: {
    id: number;
    body?: string | null;
    senderId?: number | null;
    sender?: { displayName?: string | null } | null;
    isDeleted?: boolean;
  } | null;
  isEdited?: boolean;
  isDeleted?: boolean;
  isRead?: boolean;
  createdAt: string;
}

// Socket events
export interface InternalMessageSendPayload {
  roomId: number;
  body: string;
  tempId?: string;
  replyToId?: number;
  replySnapshot?: InternalMessage["replyTo"];
}

export interface InternalMessageAckPayload {
  tempId?: string;
  message: InternalMessage;
}

export interface InternalReadReceiptPayload {
  roomId: number;
  lastReadMessageId?: number;
}
