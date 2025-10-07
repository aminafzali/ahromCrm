import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
import { ChatMessage, ChatRoom, ChatRoomType } from "@prisma/client";

export type ChatRoomWithRelations = ChatRoom & {
  members?: { workspaceUser: WorkspaceUserWithRelations }[];
  messages?: ChatMessageWithRelations[];
};

export type ChatMessageWithRelations = ChatMessage & {
  sender?: WorkspaceUserWithRelations;
};

export { ChatRoomType };
