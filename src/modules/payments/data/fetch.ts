export const include = {
  // user: {
  //   select: {
  //     id: true,
  //     name: true,
  //     phone: true,
  //   },
  // },
  workspaceUser: {
    select: {
      id: true,
      displayName: true,
    },
  },
  invoice: {
    select: {
      id: true,
      total: true,
      invoiceStatus: true,
      request: {
        select: {
          id: true,
          serviceType: true,
        },
      },
    },
  },
  paymentCategory: true,
};

export const searchFileds = [];
export const relations = [];
export const connects = ["workspaceUser", "invoice", "paymentCategory"];
