export const include = {
  _count: {
    // تعداد برچسب‌های هر کاربر
    select: {
      workspaceUsers: true,
    },
  },
  workspaceUsers: {
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
export const relations = [];
export const connects = [];

//"workspaceUsers", "userGroups"
