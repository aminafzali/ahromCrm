import { TeamWithRelations } from "@/modules/teams/types";
import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
import {
  Activity,
  ActivityPriority,
  ActivitySubject,
  ActivityType,
} from "@prisma/client";

export type ActivityWithRelations = Activity & {
  user?: WorkspaceUserWithRelations | null;
  assignedAdmin?: WorkspaceUserWithRelations | null;
  assignedTeam?: TeamWithRelations | null;
  category?: { id: number; name: string } | null;
  labels?: { id: number; name: string; color?: string | null }[];
};

export { ActivityPriority, ActivitySubject, ActivityType };
