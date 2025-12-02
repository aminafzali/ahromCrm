import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
import { Comment, CommentLike } from "@prisma/client";

export type CommentWithRelations = Comment & {
  author?: WorkspaceUserWithRelations;
  likes?: CommentLike[];
  replies?: CommentWithRelations[];
  task?: { id: number; title: string } | null;
  knowledge?: { id: number; title: string } | null;
  document?: { id: number; originalName: string } | null;
  project?: { id: number; name: string } | null;
  _count?: {
    likes?: number;
  };
  liked?: boolean;
};
