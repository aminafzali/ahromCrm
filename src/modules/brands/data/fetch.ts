export const include = {
  _count: {
    select: {
      products: true,
    },
  },
  products: {
    select: {
      id: true,
      name: true,
      price: true,
    },
  },
  logoUrl : false,
};

export const searchFileds = ["name", "website"];
export const relations = [];