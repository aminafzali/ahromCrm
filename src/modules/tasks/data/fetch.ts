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
  // این بخش اضافه شده است
  assignedTeams: {
    select: {
      id: true,
      name: true,
    },
  },
};
export const searchFileds = ["title"];
export const relations = [];
export const connects = ["project", "status"];
