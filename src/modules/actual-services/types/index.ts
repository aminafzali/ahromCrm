// مسیر فایل: src/modules/actual-services/types/index.ts

import {
  ActualService as PrismaActualService,
  ServiceType,
} from "@prisma/client";

export type ActualService = PrismaActualService;

export type ActualServiceWithRelations = ActualService & {
  serviceType?: ServiceType;
};
