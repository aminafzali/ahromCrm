// مسیر فایل: src/modules/notifications/data/fetch.ts

// ۱. تعریف include صحیح برای واکشی تمام روابط مورد نیاز
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
    select: {
      id: true,
      serviceType: {
        select: {
          id: true,
          name: true,
        },
      },
      status: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  invoice: {
    select: {
      id: true,
    },
  },
  reminder: {
    select: {
      id: true,
      title: true,
    },
  },
  payment: {
    select: {
      id: true,
    },
  },
};

// ۲. تعریف فیلدهای قابل جستجو با مسیر صحیح
export const searchFileds = ["title", "message"];

// ۳. این آرایه طبق الگوی شما خالی است
// relations فقط برای create تو در تو در BaseService استفاده می‌شود؛ نوتیفیکیشن create ساده دارد
export const relations: string[] = [];

// ۴. اضافه کردن "workspaceUser" به connects تا BaseService به درستی کار کند
// connects برای تبدیل آبجکت به کلید خارجی؛ در این ماژول id مستقیم پاس می‌دهیم
export const connects: string[] = [];
