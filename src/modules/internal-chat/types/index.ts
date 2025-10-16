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
