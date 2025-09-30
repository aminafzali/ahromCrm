// src/modules/device-types/service/DeviceTypeServiceApi.ts

import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { DeviceTypeWithRelations } from "../types";
import { createDeviceTypeSchema, updateDeviceTypeSchema } from "../validation/schema";
import { searchFileds, relations, connect } from "../data/fetch";

/**
 * کلاس ریپازیتوری به صورت محلی در این فایل تعریف می‌شود تا توسط سرویس استفاده شود.
 * این کلاس نام مدل Prisma را به عنوان ورودی دریافت می‌کند.
 */
class Repository extends BaseRepository<DeviceTypeWithRelations> {
  constructor() {
    // ارسال نام مدل در Prisma (نه نامک API)
    super("deviceType");
  }
}

/**
 * کلاس سرویس که دقیقاً از الگوی ارسالی شما پیروی می‌کند.
 */
export class DeviceTypeServiceApi extends BaseService<DeviceTypeWithRelations> {
  constructor() {
    // ارسال یک نمونه از ریپازیتوری محلی و سایر تنظیمات به کلاس والد
    super(
      new Repository(),
      createDeviceTypeSchema,
      updateDeviceTypeSchema,
      searchFileds,
      relations
    );
    
    // تنظیم پراپرتی‌های اضافی بر اساس الگو
    this.connect = connect;
    this.repository = new Repository();
  }
}