// مسیر فایل: src/modules/requests/types/index.ts

import {
  ActualService,
  Invoice,
  Note,
  Notification,
  Request,
  Role,
  ServiceType,
  Status,
  User,
  WorkspaceUser,
} from "@prisma/client";

// یک تایپ کمکی برای پروفایل ورک‌اسپیسی کاربر با تمام روابطش
type WorkspaceUserProfile = WorkspaceUser & {
  user: User;
  role: Role;
};

// اینترفیس برای جدول واسط خدمات، بدون تغییر باقی می‌ماند
export interface ActualServiceOnRequest {
  id: number;
  quantity: number;
  price: number;
  requestId: number;
  actualServiceId: number;
  actualService?: ActualService;
}

// تایپ نهایی برای یک درخواست با تمام روابط مورد نیاز بر اساس معماری جدید
export type RequestWithRelations = Request & {
  status: Status;
  serviceType?: ServiceType;
  // مشتری اکنون یک پروفایل ورک‌اسپیسی کامل است
  workspaceUser?: WorkspaceUserProfile;
  // کارشناس تخصیص‌یافته نیز همینطور
  assignedTo?: WorkspaceUserProfile;
  notes: Pick<Note, "id" | "content" | "createdAt">[];
  invoice?: Pick<Invoice, "id" | "total" | "status">;
  notifications: Pick<
    Notification,
    "id" | "title" | "message" | "isRead" | "createdAt"
  >[];
  actualServices: ActualServiceOnRequest[];
};

// اینترفیس‌های دیگر بدون تغییر باقی می‌مانند
export interface PaginatedRequestResponse {
  data: RequestWithRelations[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export interface RequestListProps {
  isAdmin?: boolean;
  statusFilter?: string;
  limit?: number;
}