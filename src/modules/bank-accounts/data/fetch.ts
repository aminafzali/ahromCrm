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
};

export const searchFileds = [
  "title",
  "bankName",
  "accountNumber",
  "cardNumber",
];
export const relations: string[] = [];
export const connects = ["workspaceUser"];
