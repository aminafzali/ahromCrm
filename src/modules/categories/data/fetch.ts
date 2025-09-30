export const include = {
  _count: {
    select: {
      products: true,
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
          products: true,
        },
      },
    },
  },
  products: {
    select: {
      id: true,
      name: true,
      price: true,
    },
  },
};

export const searchFileds = ["name", "slug"];
export const relations = [];
export const connect = ["parent"];