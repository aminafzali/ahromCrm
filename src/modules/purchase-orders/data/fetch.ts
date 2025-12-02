// Prisma include برای relations
export const include = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
        },
      },
    },
  },
  supplierWorkspaceUser: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
      },
    },
  },
  linkedInvoice: {
    select: {
      id: true,
      invoiceNumber: true,
      invoiceNumberName: true,
      total: true,
      invoiceStatus: true,
    },
  },
  stockMovements: {
    select: {
      id: true,
      quantity: true,
      movementType: true,
      createdAt: true,
    },
  },
};

// فیلدهای قابل جستجو
export const searchFields = ["status", "notes"];

// Relations برای BaseService
export const relations = ["items", "supplierWorkspaceUser", "linkedInvoice"];

// Connect relations (for create/update)
export const connects = ["supplierWorkspaceUser"];
