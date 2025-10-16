import { TeamWithRelations } from "@/modules/teams/types";
import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
import { SupportInfo, SupportPriority, SupportType } from "@prisma/client";

export type SupportInfoWithRelations = SupportInfo & {
  user?: WorkspaceUserWithRelations | null;
  assignedAdmin?: WorkspaceUserWithRelations | null;
  assignedTeam?: TeamWithRelations | null;
  category?: { id: number; name: string } | null;
  labels?: { id: number; name: string; color?: string | null }[];
};

export { SupportPriority, SupportType };
