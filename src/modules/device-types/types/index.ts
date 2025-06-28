// src/modules/device-types/types/index.ts
import { DeviceType as PrismaDeviceType } from "@prisma/client";

export type DeviceType = PrismaDeviceType;

/**
 * تایپ DeviceType که با شمارشگر روابط آن گسترش یافته است.
 * این تایپ دقیقا از الگوی دستی و صحیح پروژه شما پیروی می‌کند.
 */
export type DeviceTypeWithRelations = DeviceType & {
  // پراپرتی _count که تعداد روابط را نگه می‌دارد
  _count?: {
    receivedDevices: number;
  };
};

/**
 * ساختار پاسخ‌های صفحه‌بندی شده برای لیست انواع دستگاه
 */
export interface PaginatedDeviceTypeResponse {
  data: DeviceTypeWithRelations[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}
