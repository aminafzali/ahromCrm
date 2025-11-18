// مسیر فایل: src/modules/pm-statuses/data/fetch.ts

export const include = {
  project: {
    select: {
      id: true,
      name: true,
    },
  },
};
export const searchFileds = ["name"];
export const relations = [];
export const connects = ["project"];
