export const include = {
  workspaceUser: {
    select: {
      id: true,
      displayName: true,
      phone: true,
    },
  },
  invoice: {
    select: {
      id: true,
      total: true,
      invoiceStatus: true,
      invoiceNumber: true,
      invoiceNumberName: true,
      request: {
        select: {
          id: true,
          serviceType: true,
        },
      },
    },
  },
  payment: {
    select: {
      id: true,
      amount: true,
      status: true,
      type: true,
    },
  },
  bankAccount: {
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

export const searchFileds = ["chequeNumber", "serial", "bankName", "branchName", "accountNumber"];
export const relations = [];
export const connects = ["workspaceUser", "invoice", "payment", "bankAccount"];

