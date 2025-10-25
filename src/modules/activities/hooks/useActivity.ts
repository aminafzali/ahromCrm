import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { ActivityRepository } from "../repo/ActivityRepository";
import {
  createActivitySchema,
  updateActivitySchema,
} from "../validation/schema";

export function useActivity() {
  const repo = new ActivityRepository();
  const hook = useCrud<
    any,
    z.infer<typeof createActivitySchema>,
    z.infer<typeof updateActivitySchema>
  >(repo);

  // Add logging to the create function
  const originalCreate = hook.create;
  hook.create = async (data: any) => {
    console.log("🚀 useActivity: Starting create with data:", data);
    try {
      const result = await originalCreate(data);
      console.log("✅ useActivity: Create successful:", result);
      return result;
    } catch (error) {
      console.error("❌ useActivity: Create failed:", error);
      throw error;
    }
  };

  return { ...hook };
}
