import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { RequestRepository } from "../repo/RequestRepository";
import { RequestWithRelations } from "../types";
import {
  createRequestSchema,
  updateRequestStatusSchema,
} from "../validation/schema";

export function useRequest() {
  const requestRepo = new RequestRepository();
  const hook = useCrud<
    RequestWithRelations,
    z.infer<typeof createRequestSchema>,
    z.infer<typeof createRequestSchema>,
    z.infer<typeof updateRequestStatusSchema>
  >(requestRepo);

  return {
    ...hook,
  };
}