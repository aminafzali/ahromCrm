// src/modules/device-types/repo/DeviceTypeRepository.ts

import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { DeviceTypeWithRelations } from "../types";

export class DeviceTypeRepository extends BaseRepository<DeviceTypeWithRelations> {
  constructor() {
    // ارسال نامک (slug) ماژول به کلاس والد برای ساخت آدرس‌های API
    super("device-types");
  }
}
