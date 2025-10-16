// Relations and configurations for Support Chat module

export const include = {
  category: {
    select: {
      id: true,
      name: true,
      description: true,
    },
  },
  labels: {
    select: {
      id: true,
      name: true,
      color: true,
    },
  },
  guestUser: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      ipAddress: true,
      country: true,
    },
  },
  workspaceUser: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  assignedTo: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  _count: {
    select: {
      messages: true,
      history: true,
    },
  },
};

export const includeMessage = {
  ticket: {
    select: {
      id: true,
      ticketNumber: true,
      subject: true,
      status: true,
    },
  },
  supportAgent: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  workspaceUser: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  guestUser: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
};

export const searchFields = ["ticketNumber", "subject", "description"];
export const relations = [];
export const connects = [
  "category",
  "guestUser",
  "workspaceUser",
  "assignedTo",
];
