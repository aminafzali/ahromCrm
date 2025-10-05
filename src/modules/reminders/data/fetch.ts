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
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
    },
  },
  request: {
    select: { id: true },
  },
  invoice: {
    select: { id: true },
  },
  payment: {
    select: { id: true },
  },
};

// relations در BaseService برای ایجاد تو در تو استفاده می‌شود؛ در ریمایندر نیازی نیست
export const relations: string[] = [];

// فیلدهایی که در جستجوی متنی استفاده می‌شوند
export const searchFileds = [
  "title",
  "description",
  "reminderNumber",
  "groupName",
];
// connects فقط برای تبدیل آبجکت به کلید خارجی استفاده می‌شود؛ در این ماژول id مستقیم پاس می‌دهیم
export const connects: string[] = [];
