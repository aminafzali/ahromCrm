// src/modules/reminders/data/fetch.ts

// src/modules/reminders/data/fetch.ts

// ** اصلاحیه کلیدی: **
// نام این متغیر را به include تغییر می‌دهیم تا با الگوی کنترلر هماهنگ باشد.
// این آبجکت مستقیماً به BaseController پاس داده می‌شود.
// src/modules/reminders/data/fetch.ts

/**
 * آبجکت include برای Prisma که به BaseController پاس داده می‌شود.
 * این آبجکت مشخص می‌کند کدام روابط باید به صورت خودکار بارگذاری شوند.
 */
export const include = {
  workspaceUser: {
    select: {
      id: true,
      displayName: true,
      phone: true,
    },
  },
};

export const relations = ["workspaceUser"];

// فیلدهایی که در جستجوی متنی استفاده می‌شوند
export const searchFileds = ["title", "description"];
// این ماژول به روابط پیچیده (مانند جدول واسط) نیازی ندارد، پس connects خالی است
export const connects = {};
