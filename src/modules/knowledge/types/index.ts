import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
import {
  Knowledge,
  KnowledgeCategory,
  KnowledgeStatus,
  Label,
  Team,
} from "@prisma/client";

export type KnowledgeWithRelations = Knowledge & {
  category?: KnowledgeCategory | null;
  labels?: Label[];
  author?: WorkspaceUserWithRelations;
  assignees?: Array<{
    workspaceUser: WorkspaceUserWithRelations;
  }>;
  teamACL?: Array<{
    team: Team;
  }>;
};

export { KnowledgeStatus };
