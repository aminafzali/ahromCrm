// مسیر فایل: src/modules/permissions/validation/schema.ts

import { z } from "zod";

export const createPermissionSchema = z.object({
  action: z.string().min(1, "عمل (Action) الزامی است."),
  module: z.string().min(1, "نام ماژول الزامی است."),
  description: z.string().optional(),
});

export const updatePermissionSchema = createPermissionSchema.partial();
