import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { TicketsRepository } from "../repo/TicketsRepository";
import { createTicketSchema, updateTicketSchema } from "../validation/schema";

export function useTickets() {
  const repo = new TicketsRepository();
  const hook = useCrud<
    any,
    z.infer<typeof createTicketSchema>,
    z.infer<typeof updateTicketSchema>
  >(repo);

  // Add logging to the create function
  const originalCreate = hook.create;
  hook.create = async (data: any) => {
    console.log("🚀 useTickets: Starting create with data:", data);
    try {
      const result = await originalCreate(data);
      console.log("✅ useTickets: Create successful:", result);
      return result;
    } catch (error) {
      console.error("❌ useTickets: Create failed:", error);
      throw error;
    }
  };

  return { ...hook };
}
