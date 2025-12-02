// مسیر فایل: src/modules/tasks/types/index.ts

import { DocumentWithRelations } from "@/modules/documents/types";
import { PMStatus, Project, Task, Team } from "@prisma/client";
import { WorkspaceUserWithRelations } from "../../workspace-users/types";

export type TaskWithRelations = Task & {
  status: PMStatus;
  projectStatus?: PMStatus | null;
  project: Project;
  assignedUsers?: WorkspaceUserWithRelations[];
  assignedTeams?: Team[]; // این خط اضافه شده است
  documents?: DocumentWithRelations[];
};
