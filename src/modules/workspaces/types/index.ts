// مسیر فایل: src/modules/workspaces/types/index.ts

import { User, Workspace } from "@prisma/client";

// تایپ کامل ورک‌اسپیس به همراه اطلاعات مالک و تعداد اعضا
export type WorkspaceWithDetails = Workspace & {
  owner: Pick<User, "id" | "name">;
  members: { userId: number }[]; // فقط برای شمارش استفاده می‌کنیم
};
