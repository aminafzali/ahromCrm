// مسیر فایل: src/modules/tasks/types/index.ts

import { PMStatus, Project, Task, Team } from "@prisma/client";
import { WorkspaceUserWithRelations } from "../../workspace-users/types";

export type TaskWithRelations = Task & {
  status: PMStatus;
  project: Project;
  assignedUsers?: WorkspaceUserWithRelations[];
  assignedTeams?: Team[]; // این خط اضافه شده است
};
