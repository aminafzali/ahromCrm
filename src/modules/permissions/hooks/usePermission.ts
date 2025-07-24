// مسیر فایل: src/modules/permissions/hooks/usePermission.ts

import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { PermissionRepository } from "../repo/PermissionRepository";
import { PermissionWithRelations } from "../types";
import {
  createPermissionSchema,
  updatePermissionSchema,
} from "../validation/schema";

export function usePermission() {
  const repo = new PermissionRepository();
  const hook = useCrud<
    PermissionWithRelations,
    z.infer<typeof createPermissionSchema>,
    z.infer<typeof updatePermissionSchema>
  >(repo);

  return {
    ...hook,
  };
}
