// مسیر فایل: src/modules/teams/types/index.ts

import { Team } from "@prisma/client";
import { WorkspaceUserWithRelations } from "../../workspace-users/types";

export type TeamWithRelations = Team & {
  parent?: Team; // <-- این خط اضافه شد
  children?: TeamWithRelations[]; // <-- این خط اضافه شد
  members?: { workspaceUser: WorkspaceUserWithRelations }[];
  _count?: {
    members: number;
    assignedProjects: number;
    assignedTasks: number;
  };
};
