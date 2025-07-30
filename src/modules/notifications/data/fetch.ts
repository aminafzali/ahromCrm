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
      // می‌توانید فیلدهای دیگری از درخواست را نیز در اینجا اضافه کنید
    },
  },
};

// ۲. تعریف فیلدهای قابل جستجو با مسیر صحیح
export const searchFileds = ["title", "message", "workspaceUser.user.name"];

// ۳. این آرایه طبق الگوی شما خالی است
export const relations = [];

// ۴. اضافه کردن "workspaceUser" به connects تا BaseService به درستی کار کند
export const connects = ["workspaceUser", "request"];
