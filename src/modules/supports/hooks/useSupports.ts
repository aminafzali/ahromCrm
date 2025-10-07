import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { SupportsRepository } from "../repo/SupportsRepository";
import {
  createSupportsSchema,
  updateSupportsSchema,
} from "../validation/schema";

export function useSupports() {
  const repo = new SupportsRepository();
  const hook = useCrud<
    any,
    z.infer<typeof createSupportsSchema>,
    z.infer<typeof updateSupportsSchema>
  >(repo);

  // Add logging to the create function
  const originalCreate = hook.create;
  hook.create = async (data: any) => {
    console.log("🚀 useSupports: Starting create with data:", data);
    try {
      const result = await originalCreate(data);
      console.log("✅ useSupports: Create successful:", result);
      return result;
    } catch (error) {
      console.error("❌ useSupports: Create failed:", error);
      throw error;
    }
  };

  return { ...hook };
}
