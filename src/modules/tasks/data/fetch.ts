// مسیر فایل: src/modules/tasks/data/fetch.ts

export const include = {
  status: true,
  project: true,
  assignedUsers: {
    select: {
      id: true,
      displayName: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  },
};
export const searchFileds = ["title"];
export const relations = [];
export const connects = ["project", "status", "assignedUsers"];
