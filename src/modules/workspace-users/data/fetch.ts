// مسیر فایل: src/modules/workspace-users/data/fetch.ts

// الگوبرداری دقیق از ماژول brands و received-devices
export const include = {
  // هنگام واکشی اطلاعات اعضا، فقط فیلدهای مشخص شده از مدل‌های مرتبط را انتخاب می‌کنیم
  user: {
    select: {
      id: true,
      name: true,
      phone: true,
    },
  },
  role: {
    select: {
      id: true,
      name: true,
    },
  },
};

// فیلدهایی که در جستجوی کلی مورد استفاده قرار می‌گیرند
// Prisma از جستجوی تو در تو به این شکل پشتیبانی می‌کند
export const searchFileds = ["user.name", "user.phone", "role.name"];

// این آرایه‌ها طبق الگوی ماژول brands خالی هستند
export const relations = [];
export const connects = [];
