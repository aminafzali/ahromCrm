export const include = {
  request: {
    select: {
      id: true,
      serviceType: true,
      status: true,
      //userId: true,
      // user: {
      //   select: {
      //     id: true,
      //     name: true,
      //     phone: true,
      //     address: true,
      //   },
      //},
      //user:true
    },
  },
  items: {
    select: {
      id: true,
      description: true,
      quantity: true,
      price: true,
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
