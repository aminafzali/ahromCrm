// src/modules/received-devices/hooks/useReceivedDevice.ts

"use client";

import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { ReceivedDeviceRepository } from "../repo/ReceivedDeviceRepository";
import { ReceivedDeviceWithRelations } from "../types";
import {
  createReceivedDeviceSchema,
  updateReceivedDeviceSchema,
} from "../validation/schema";

export function useReceivedDevice() {
  const repo = new ReceivedDeviceRepository();
  const hook = useCrud<
    ReceivedDeviceWithRelations,
    z.infer<typeof createReceivedDeviceSchema>,
    z.infer<typeof createReceivedDeviceSchema>,
    any
  >(repo);
  return { ...hook };
}
