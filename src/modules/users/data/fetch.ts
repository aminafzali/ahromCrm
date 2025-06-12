export const includeUser = {
  role: false,
  email: false,
  updatedAt: false,
  password: false,
  requests: {
    select: {
      serviceType: true,
      status: true,
    },
  },
  notifications: {
    select: {
      title: true,
      message: true,
    },
  },
  labels: {

    include: {
      _count: {
        select: {
          users: true, // تعداد کاربران مرتبط با هر label
        },
      },
    },
  },
  groups: {
    
    include: {
      _count: {
        select: {
          users: true, // تعداد کاربران مرتبط با هر label
        },
      },
    },
  }, // Include the relation normally
  _count: {
    select: {
      labels: true, // Count labels
      groups: true, // Count groups
    },
  },
};

export const searchFileds = ["name", "phone"];
export const relations = [];
export const connects = ["labels", "groups"];
