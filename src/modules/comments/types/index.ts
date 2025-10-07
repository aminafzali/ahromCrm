import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
import { Comment, CommentLike } from "@prisma/client";

export type CommentWithRelations = Comment & {
  author?: WorkspaceUserWithRelations;
  likes?: CommentLike[];
  replies?: CommentWithRelations[];
};
