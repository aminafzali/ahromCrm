// src/modules/received-devices/types/index.ts

import {
  Brand,
  DeviceType,
  ReceivedDevice,
  Request,
  Status,
  User,
} from "@prisma/client";

/**
 * تایپ ReceivedDevice که با روابط آن به صورت دستی گسترش یافته است.
 * این تایپ دقیقا از الگوی صحیح پروژه شما پیروی می‌کند.
 */
export type ReceivedDeviceWithRelations = ReceivedDevice & {
  user?: User;
  brand?: Brand;
  deviceType?: DeviceType;
  request?: Request & {
    status?: Status;
  };
};

/**
 * ساختار پاسخ‌های صفحه‌بندی شده برای این ماژول
 */
export interface PaginatedReceivedDeviceResponse {
  data: ReceivedDeviceWithRelations[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}
