export const include = {
  workspaceUser: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
    },
  },
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
        },
      },
    },
  },
  shippingMethod: {
    select: {
      id: true,
      name: true,
      type: true,
      basePrice: true,
    },
  },
  invoice: {
    select: {
      id: true,
      invoiceNumber: true,
      invoiceNumberName: true,
      total: true,
      invoiceStatus: true,
    },
  },
};

export const searchFileds = ["shippingAddress"];
export const relations = [
  "items",
  "workspaceUser",
  "shippingMethod",
  "invoice",
];
export const connects = ["workspaceUser", "shippingMethod"];
