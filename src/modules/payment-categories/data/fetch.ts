// مسیر فایل: src/modules/payment-categories/data/fetch.ts

export const include = {
  _count: {
    select: {
      payments: true,
      children: true,
    },
  },
  parent: {
    select: {
      id: true,
      name: true,
    },
  },
  children: {
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          payments: true,
        },
      },
    },
  },
};

export const searchFileds = ["name", "slug", "description"];
export const relations = [];
export const connects = ["parent"];
