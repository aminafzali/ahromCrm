// مسیر فایل: src/modules/notifications/types/index.ts

import {
  Invoice,
  Notification,
  Payment,
  Reminder,
  Request,
  User,
  WorkspaceUser,
} from "@prisma/client";

// یک تایپ کمکی برای پروفایل کاربر با اطلاعات ضروری
type WorkspaceUserProfile = WorkspaceUser & {
  user: Pick<User, "id" | "name" | "phone">;
};

// تایپ نهایی برای یک نوتیفیکیشن با تمام روابط مورد نیاز
export type NotificationWithRelations = Notification & {
  // رابطه user با workspaceUser جایگزین شده است
  workspaceUser?: WorkspaceUserProfile;
  request?: Pick<Request, "id" | "serviceTypeId" | "statusId">;
  invoice?: Pick<Invoice, "id">;
  reminder?: Pick<Reminder, "id">;
  payment?: Pick<Payment, "id">;
};

export interface PaginatedNotificationResponse {
  data: NotificationWithRelations[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}
