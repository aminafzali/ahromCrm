export const include = {
  // _count: {
  // تعداد برچسب‌های هر کاربر
  //   select: {
  //     workspaceUsers: true,
  //   },
  // },
  // //  updatedAt: false,
  // workspaceUsers: {
  //   include: {
  //     labels: true,
  //   },
  // },
  // labels: {
  //   select: {
  //     id: true,
  //     name: true,
  //     color: true,
  //   },
  // },
};

export const searchFileds = ["name"];
export const relations = ["workspaceUsers", "labels"];
export const connect = [];
