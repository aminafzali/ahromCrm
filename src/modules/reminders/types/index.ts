// src/modules/reminders/types/index.ts

import { Reminder, WorkspaceUser } from "@prisma/client";

// تایپ اصلی ماژول که به صورت دستی و دقیق ساخته شده است
export type ReminderWithDetails = Reminder & {
  // مشخص می‌کنیم که فیلد user شامل چه اطلاعاتی از مدل User است
  user: Pick<WorkspaceUser, "id" | "displayName" | "phone">;
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
