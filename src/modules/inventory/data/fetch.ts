export const include = {
  warehouse: {
    select: {
      id: true,
      name: true,
      address: true,
    },
  },
  product: {
    select: {
      id: true,
      name: true,
      price: true,
    },
  },
  invoice: {
    select: {
      id: true,
      invoiceNumber: true,
      invoiceNumberName: true,
      type: true,
    },
  },
  order: {
    select: {
      id: true,
      status: true,
    },
  },
  purchaseOrder: {
    select: {
      id: true,
      status: true,
    },
  },
};

export const searchFileds = ["description"];
export const relations = [];
export const connects = ["warehouse", "product", "invoice", "order", "purchaseOrder"];

