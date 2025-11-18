// مسیر فایل: src/modules/pm-statuses/types/index.ts

import { PMStatus, Project } from "@prisma/client";

export type PMStatusWithRelations = PMStatus & {
  project?: Project | null;
};

export type { PMStatus };
