export const include = {
  preferredDate: false,
  preferredTime: false,
  note: false,
  address: false,
  priority: false,
  assignedToId: false,
  estimatedPrice: false,
  actualPrice: false,
  status: true,
  serviceType: true,
  formSubmissionid: false,
  formSubmission: false,
  user: {
    select: {
      id: true,
      name: true,
      phone: true,
      address: true,
      labels: {
        include: {
          _count: {
            select: {
              users: true,
            },
          },
        },
      },
    },
  },
  notes: {
    select: {
      id: true,
      content: true,
      createdAt: true,
    },
  },
  notifications: {
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      message: true,
      isRead: true,
      createdAt: true,
    },
  },
  // +++ این بخش را اضافه کنید +++
  actualServices: {
    include: {
      actualService: true, // جزئیات کامل هر خدمت را هم می‌گیریم
    },
  },
};

export const searchFileds = ["serviceType", "status", "description"];
export const relations = ["notes", "notifications", "formSubmission"];
export const connects = ["user", "serviceType", "status"];
