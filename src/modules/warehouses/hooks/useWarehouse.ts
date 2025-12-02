import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { WarehouseRepository } from "../repo/WarehouseRepository";
import { WarehouseWithRelations } from "../types";
import {
  createWarehouseSchema,
  updateWarehouseSchema,
} from "../validation/schema";

export function useWarehouse() {
  const repo = new WarehouseRepository();
  const hook = useCrud<
    WarehouseWithRelations,
    z.infer<typeof createWarehouseSchema>,
    z.infer<typeof updateWarehouseSchema>
  >(repo);

  return hook;
}
