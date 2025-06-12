export const include = {
  _count: {  // تعداد برچسب‌های هر کاربر
    select: {
      users: true,
    },
  },
  updatedAt: false,
  users: {
    include: {
      labels: true,
    },
    
  },
  labels: {
    select: {
      id: true,
      name: true,
      color: true,
    },
  },
};

export const searchFileds = ["name"];
export const relations = [];
export const connect = ["users", "labels"];