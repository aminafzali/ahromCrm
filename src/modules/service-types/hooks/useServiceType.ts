import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { ServiceTypeRepository } from "../repo/ServiceTypeRepository";
import { ServiceType } from "../types";
import { createServiceTypeSchema } from "../validation/schema";

export function useServiceType() {
  const serviceTypeRepo = new ServiceTypeRepository();
  const hook = useCrud<
    ServiceType,
    z.infer<typeof createServiceTypeSchema>,
    z.infer<typeof createServiceTypeSchema>,
    never
  >(serviceTypeRepo);

  return {
    ...hook,
  };
}