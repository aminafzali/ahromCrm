// مسیر فایل: src/modules/notifications/data/fetch.ts

// الگوبرداری دقیق از ماژول‌های دیگر
export const include = {
  // واکشی پروفایل ورک‌اسپیسی کاربر
  workspaceUser: {
    include: {
      user: {
        // و سپس اطلاعات سراسری کاربر از داخل آن
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
      serviceType: true,
      status: true,
    },
  },
};

export const searchFileds = ["title", "message", "workspaceUser.user.name"];
export const relations = [];
export const connects = ["workspaceUser", "request"];
