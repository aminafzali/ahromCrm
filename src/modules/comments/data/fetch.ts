// مسیر فایل: src/modules/comments/data/fetch.ts

export const include = {
  author: {
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
  parent: {
    select: {
      id: true,
      body: true,
      author: {
        select: {
          displayName: true,
        },
      },
    },
  },
  task: {
    select: {
      id: true,
      title: true,
    },
  },
  knowledge: {
    select: {
      id: true,
      title: true,
    },
  },
  document: {
    select: {
      id: true,
      originalName: true,
    },
  },
  project: {
    select: {
      id: true,
      name: true,
    },
  },
  _count: {
    select: {
      likes: true,
    },
  },
};
export const searchFileds = ["body"];
export const relations = [];
export const connects = ["task", "knowledge", "document", "project", "parent"];
