import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
import {
  Knowledge,
  KnowledgeCategory,
  KnowledgeStatus,
  Label,
} from "@prisma/client";

export type KnowledgeWithRelations = Knowledge & {
  category?: KnowledgeCategory | null;
  labels?: Label[];
  author?: WorkspaceUserWithRelations;
};

export { KnowledgeStatus };
