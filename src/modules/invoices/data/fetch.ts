export const include = {
  request: {
    select: {
      id: true,
      serviceType: true,
      status: true,
    },
  },
  items: {
    select: {
      id: true,
      itemName: true,
      description: true,
      quantity: true,
      unitPrice: true,
      total: true,
    },
  },
  payments: {
    select: {
      id: true,
      amount: true,
      method: true,
      status: true,
      createdAt: true,
    },
  },
  workspaceUser: {
    include: {
      user: true,
    },
  },
};

export const searchFileds = ["name"];
export const relations = ["items"];
export const connect = ["workspaceUser"];
