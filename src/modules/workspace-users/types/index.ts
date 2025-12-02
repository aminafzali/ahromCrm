// مسیر فایل: src/modules/workspace-users/types/index.ts

import {
  Label,
  Notification,
  Role,
  User,
  UserGroup,
  WorkspaceUser,
} from "@prisma/client";

// ۱. یک اینترفیس برای رکوردهای جدول واسط LabelsOnWorkspaceUsers تعریف می‌کنیم
// که شامل آبجکت کامل خود Label است.
// ۳. تایپ نهایی برای یک عضو ورک‌اسپیس با تمام روابط مورد نیاز
export type WorkspaceUserWithRelations = WorkspaceUser & {
  user: User;
  role: Role;
  // روابط جدید را با تایپ‌های صحیح و تو در تو تعریف می‌کنیم
  labels?: Label[];
  userGroup?: UserGroup | null; // تغییر به one-to-one
  notifications?: Notification[];
};
