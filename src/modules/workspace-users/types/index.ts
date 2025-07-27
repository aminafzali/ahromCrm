// مسیر فایل: src/modules/workspace-users/types/index.ts

import { Label, Role, User, UserGroup, WorkspaceUser } from "@prisma/client";

// ۱. یک اینترفیس برای رکوردهای جدول واسط LabelsOnWorkspaceUsers تعریف می‌کنیم
// که شامل آبجکت کامل خود Label است.
interface LabelOnWorkspaceUser {
  label: Label;
  // می‌توان فیلدهای دیگر جدول واسط را نیز در اینجا اضافه کرد
}

// ۲. یک اینترفیس مشابه برای جدول واسط UserGroupsOnWorkspaceUsers تعریف می‌کنیم
interface UserGroupOnWorkspaceUser {
  userGroup: UserGroup;
}

// ۳. تایپ نهایی برای یک عضو ورک‌اسپیس با تمام روابط مورد نیاز
export type WorkspaceUserWithRelations = WorkspaceUser & {
  user: User;
  role: Role;
  // روابط جدید را با تایپ‌های صحیح و تو در تو تعریف می‌کنیم
  labels: LabelOnWorkspaceUser[];
  userGroups: UserGroupOnWorkspaceUser[];
};
