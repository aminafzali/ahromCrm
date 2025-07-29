// مسیر فایل: src/modules/notifications/data/fetch.ts

// الگوبرداری دقیق از ماژول‌های دیگر
export const include = {
  // واکشی پروفایل ورک‌اسپیسی کاربر
  workspaceUser: true,
  request: true,
};

export const searchFileds = ["title", "message", "workspaceUser.displayName"];
export const relations = [];
export const connects = ["request"];
