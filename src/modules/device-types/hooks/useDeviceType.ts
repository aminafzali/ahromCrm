// src/modules/device-types/hooks/useDeviceType.ts

"use client";

import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { DeviceTypeRepository } from "../repo/DeviceTypeRepository";
import { DeviceTypeWithRelations } from "../types";
import {
  createDeviceTypeSchema,
  updateDeviceTypeSchema,
} from "../validation/schema";

/**
 * هوک سفارشی برای مدیریت کامل عملیات CRUD مربوط به انواع دستگاه.
 * این هوک دقیقا از الگوی هوک useCategory پیروی می‌کند.
 */
export function useDeviceType() {
  const repo = new DeviceTypeRepository();

  const hook = useCrud<
    DeviceTypeWithRelations,
    z.infer<typeof createDeviceTypeSchema>,
    z.infer<typeof updateDeviceTypeSchema>,
    any // آرگومان چهارم برای فیلترها
  >(repo);

  return { ...hook };
}
