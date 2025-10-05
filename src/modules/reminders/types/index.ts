// src/modules/reminders/types/index.ts

import {
  Invoice,
  Payment,
  Reminder,
  Request,
  User,
  WorkspaceUser,
} from "@prisma/client";

// یک تایپ کمکی برای پروفایل کاربر با اطلاعات ضروری
type WorkspaceUserProfile = WorkspaceUser & {
  user?: Pick<User, "id" | "name" | "phone">;
};

// تایپ اصلی ماژول که به صورت دستی و دقیق ساخته شده است
export type ReminderWithDetails = Reminder & {
  workspaceUser?: WorkspaceUserProfile;
  request?: Pick<Request, "id">;
  invoice?: Pick<Invoice, "id">;
  payment?: Pick<Payment, "id">;
};

// تایپ برای پاسخ‌های صفحه‌بندی شده
export interface PaginatedReminderResponse {
  data: ReminderWithDetails[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}
