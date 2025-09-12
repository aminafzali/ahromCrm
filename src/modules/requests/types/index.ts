// مسیر فایل: src/modules/requests/types/index.ts

import {
  ActualService,
  Invoice,
  Label,
  Note,
  Notification,
  ActualServiceOnRequest as PrismaActualServiceOnRequest,
  Request,
  Role,
  ServiceType,
  Status,
  User,
  UserGroup,
  WorkspaceUser,
} from "@prisma/client";

// یک تایپ کمکی برای پروفایل ورک‌اسپیسی کاربر با تمام روابط ضروری
type WorkspaceUserProfile = WorkspaceUser & {
  user: User;
  role?: Role; // نقش ممکن است همیشه include نشود
  labels?: Label[];
  userGroups?: UserGroup[];
};

// اینترفیس جدول واسط را برای شامل شدن خود خدمت واقعی، گسترش می‌دهیم
export type ActualServiceOnRequest = PrismaActualServiceOnRequest & {
  actualService?: ActualService;
};

// تایپ نهایی برای یک درخواست با تمام روابط مورد نیاز بر اساس معماری جدید
export type RequestWithRelations = Request & {
  status?: Status;
  serviceType?: ServiceType;
  workspaceUser?: WorkspaceUserProfile;
  assignedTo?: WorkspaceUserProfile;
  notes?: Note[];
  invoice?: Invoice[];
  notifications?: Notification[];
  actualServices?: ActualServiceOnRequest[];
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
