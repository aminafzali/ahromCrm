export const include = {

  _count: {  // تعداد برچسب‌های هر کاربر
    select: {
      users: true,
    },
  },
  users: {
    select: {
      id: true,
      name: true,
      phone: true,
    },
  },
  userGroups: {
    select: {
      id: true,
      name: true,
    },
  },
};

export const searchFileds = ["name"];
export const relations = ["users", "userGroups"];