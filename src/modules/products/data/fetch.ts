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
      sortOrder: "asc",
    },
  },
  // Inventory relations
  stocks: {
    include: {
      warehouse: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  // Visibility & payment relations
  visibilityByGroup: {
    include: {
      userGroup: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  paymentOptions: true,
  paymentOptionsByGroup: {
    include: {
      userGroup: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
};

export const searchFields = ["name", "description"];
export const relations = [
  "images",
  "stocks",
  "visibilityByGroup",
  "paymentOptions",
  "paymentOptionsByGroup",
];
export const connects = ["category", "brand"];
