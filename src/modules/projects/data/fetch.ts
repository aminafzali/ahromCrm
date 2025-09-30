// مسیر فایل: src/modules/projects/data/fetch.ts

export const include = {
  status: true,
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
  assignedTeams: {
    select: {
      id: true,
      name: true,
    },
  },
  _count: {
    select: {
      tasks: true,
    },
  },
};
export const searchFileds = ["name"];
export const relations = [];
export const connects = ["status", "assignedUsers", "assignedTeams"];
