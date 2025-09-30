// مسیر فایل: src/modules/projects/types/index.ts

import { PMStatus, Project } from "@prisma/client";
import { TeamWithRelations } from "../../teams/types";
import { WorkspaceUserWithRelations } from "../../workspace-users/types";

export type ProjectWithRelations = Project & {
  status: PMStatus;
  assignedUsers?: WorkspaceUserWithRelations[];
  assignedTeams?: TeamWithRelations[];
  _count?: {
    tasks: number;
  };
};

export { Project };
