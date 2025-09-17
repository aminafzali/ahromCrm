// مسیر فایل: src/modules/tasks/types/index.ts

import { PMStatus, Project, Task } from "@prisma/client";
import { WorkspaceUserWithRelations } from "../../workspace-users/types";

export type TaskWithRelations = Task & {
  status: PMStatus;
  project: Project;
  assignedUsers?: WorkspaceUserWithRelations[];
};
