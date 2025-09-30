import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { StatusRepository } from "../repo/StatusRepository";
import { Status } from "../types";
import { createStatusSchema } from "../validation/schema";

export function useStatus() {
  const statusRepo = new StatusRepository();
  const hook = useCrud<
    Status,
    z.infer<typeof createStatusSchema>,
    z.infer<typeof createStatusSchema>,
    never
  >(statusRepo);

  return {
    ...hook,
  };
}