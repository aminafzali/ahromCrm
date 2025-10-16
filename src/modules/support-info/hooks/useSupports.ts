import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { SupportInfoRepository } from "../repo/SupportsRepository";
import {
  createSupportInfoSchema,
  updateSupportInfoSchema,
} from "../validation/schema";

export function useSupportInfo() {
  const repo = new SupportInfoRepository();
  const hook = useCrud<
    any,
    z.infer<typeof createSupportInfoSchema>,
    z.infer<typeof updateSupportInfoSchema>
  >(repo);

  // Add logging to the create function
  const originalCreate = hook.create;
  hook.create = async (data: any) => {
    console.log("🚀 useSupportInfo: Starting create with data:", data);
    try {
      const result = await originalCreate(data);
      console.log("✅ useSupportInfo: Create successful:", result);
      return result;
    } catch (error) {
      console.error("❌ useSupportInfo: Create failed:", error);
      throw error;
    }
  };

  return { ...hook };
}
