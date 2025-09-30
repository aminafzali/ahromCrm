export const include = {
  brand: {
    select: {
      id: true,
      name: true,
      logoUrl: true,
    },
  },
  category: {
    select: {
      id: true,
      name: true,
      parent: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  images: {
    orderBy: {
      sortOrder: 'asc',
    },
  },
};

export const searchFields = ["name", "description"];
export const relations = ["images"];
export const connects = ["category" , "brand"];