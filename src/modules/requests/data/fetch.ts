// مسیر فایل: src/modules/requests/data/fetch.ts

export const include = {
  status: true,
  serviceType: true,
  workspaceUser: {
    include: {
      user: true,
      role: true,
    },
  },
  assignedTo: {
    include: {
      user: true,
    },
  },
  notes: {
    orderBy: { createdAt: "desc" as const },
    select: { id: true, content: true, createdAt: true },
  },
  notifications: {
    orderBy: { createdAt: "desc" as const },
    select: {
      id: true,
      title: true,
      message: true,
      isRead: true,
      createdAt: true,
    },
  },
  actualServices: {
    include: {
      actualService: true,
    },
  },
};

export const searchFileds = ["workspaceUser.user.name", "description"];
export const relations = ["notes", "notifications", "formSubmission"];
// connects اکنون ساده‌تر است
export const connects = [
  "workspaceUser",
  "serviceType",
  "status",
  "assignedTo",
];

// // مسیر فایل: src/modules/requests/data/fetch.ts

// export const include = {
//   status: true,
//   serviceType: true,
//   workspaceUser: {
//     include: {
//       user: true,
//       role: true,
//     },
//   },
//   assignedTo: {
//     include: {
//       user: true,
//     },
//   },
//   notes: {
//     orderBy: { createdAt: "desc" as const }, // ۲. از "as const" برای تعیین تایپ دقیق استفاده می‌کنیم
//     select: { id: true, content: true, createdAt: true },
//   },
//   notifications: {
//     orderBy: { createdAt: "desc" as const }, // ۲. از "as const" برای تعیین تایپ دقیق استفاده می‌کنیم
//     select: {
//       id: true,
//       title: true,
//       message: true,
//       isRead: true,
//       createdAt: true,
//     },
//   },
//   actualServices: {
//     include: {
//       actualService: true,
//     },
//   },
// };

// // این بخش‌ها بدون تغییر باقی می‌مانند
// export const searchFileds = [
//   "workspaceUser.user.name",
//   "workspaceUser.user.phone",
//   "description",
// ];
// export const relations = ["notes", "notifications", "formSubmission"];
// export const connects = [
//   "workspaceUser",
//   "serviceType",
//   "status",
//   "assignedTo",
//   "actualServices",
// ];
