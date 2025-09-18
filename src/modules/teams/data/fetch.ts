// مسیر فایل: src/modules/teams/data/fetch.ts

export const include = {
  members: {
    parent: true,
    select: {
      workspaceUser: {
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
    },
  },
  _count: {
    select: {
      members: true,
      assignedProjects: true,
      assignedTasks: true,
    },
  },
};
export const searchFileds = ["name"];
export const relations = [];
export const connects = ["members", "parent"];
