import { TeamWithRelations } from "@/modules/teams/types";
import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
import { SupportPriority, SupportTicket, SupportType } from "@prisma/client";

export type SupportTicketWithRelations = SupportTicket & {
  user?: WorkspaceUserWithRelations | null;
  assignedAdmin?: WorkspaceUserWithRelations | null;
  assignedTeam?: TeamWithRelations | null;
  category?: { id: number; name: string } | null;
  labels?: { id: number; name: string; color?: string | null }[];
};

export { SupportPriority, SupportType };
