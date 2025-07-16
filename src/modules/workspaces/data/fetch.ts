// مسیر فایل: src/modules/workspaces/data/fetch.ts

/**
 * آبجکت include برای Prisma که به BaseController پاس داده می‌شود.
 * این آبجکت مشخص می‌کند کدام روابط باید به صورت خودکار بارگذاری شوند.
 */
export const include = {
  owner: {
    select: {
      id: true,
      name: true,
      phone: true,
    },
  },
  members: {
    // برای شمارش تعداد اعضا
    select: {
      userId: true,
    },
  },
};

/**
 * فیلدهایی که در جستجوی متنی سراسری استفاده می‌شوند.
 */
export const searchFileds = ["name", "slug"];
