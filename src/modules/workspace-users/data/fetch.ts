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

// ===== شروع اصلاحیه برای تست =====
// ما به صورت موقت، فیلدهای جستجوی تو در تو را حذف می‌کنیم
// و فقط بر اساس یک فیلد ساده و مستقیم (displayName) جستجو را فعال می‌کنیم.
export const searchFileds = ["name"];
// ===== پایان اصلاحیه برای تست =====

// این آرایه‌ها طبق الگوی ماژول brands خالی هستند
export const relations = [];
export const connects = ["role", "user"];
