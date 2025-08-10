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
      status: true,
      request: {
        select: {
          id: true,
          serviceType: true,
        },
      },
    },
  },
};

export const searchFileds = [];
export const relations = [];
export const connects = ["workspaceUser", "invoice"];
