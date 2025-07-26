// مسیر فایل: src/modules/workspace-users/types/index.ts

import { Role, User, WorkspaceUser } from "@prisma/client";

export type WorkspaceUserWithRelations = WorkspaceUser & {
  user: User;
  role: Role;
};
