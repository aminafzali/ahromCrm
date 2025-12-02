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
  customerBankAccount: {
    select: {
      id: true,
      title: true,
      bankName: true,
      iban: true,
      accountNumber: true,
      cardNumber: true,
    },
  },
  adminBankAccount: {
    select: {
      id: true,
      title: true,
      bankName: true,
      iban: true,
      accountNumber: true,
      cardNumber: true,
    },
  },
};

export const searchFileds = [];
export const relations = [];
export const connects = ["workspaceUser", "invoice", "paymentCategory"];
