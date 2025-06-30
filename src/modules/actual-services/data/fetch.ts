// مسیر فایل: src/modules/actual-services/data/fetch.ts

export const searchFileds = ["name", "description"];

export const relations = ["serviceType"];

export const include = {
  serviceType: {
    select: { id: true, name: true },
  },
};
