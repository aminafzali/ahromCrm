export const include = {
  status: true,
  projectStatus: true,
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
  documents: {
    select: {
      id: true,
      originalName: true,
      mimeType: true,
      size: true,
      url: true,
      entityType: true,
      entityId: true,
      taskId: true,
    },
  },
};
export const searchFileds = ["title"];
export const relations = [];
export const connects = ["project", "status", "projectStatus", "documents"];
