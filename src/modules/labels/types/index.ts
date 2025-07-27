import { Label, UserGroup, WorkspaceUser } from "@prisma/client";

export type LabelWithRelations = Label & {
  workspaceUsers?: WorkspaceUser[];
  userGroups?: UserGroup[];
};

export type LabelColor =
  | "primary"
  | "accent"
  | "secondary"
  | "warning"
  | "success"
  | "neutral"
  | "info";

export interface PaginatedLabelResponse {
  data: LabelWithRelations[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export interface LabelListProps {
  isAdmin?: boolean;
  limit?: number;
}
