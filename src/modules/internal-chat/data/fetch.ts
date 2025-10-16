// Relations and configurations for Internal Chat module

export const include = {
  members: {
    include: {
      workspaceUser: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
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
    },
  },
  team: {
    select: {
      id: true,
      name: true,
      description: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      displayName: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  _count: {
    select: {
      members: true,
      messages: true,
    },
  },
};

export const includeMessage = {
  sender: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
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
  replyTo: {
    select: {
      id: true,
      body: true,
      isDeleted: true,
      senderId: true,
      createdAt: true,
    },
  },
  readReceipts: {
    select: {
      id: true,
      memberId: true, // ✅ این فیلد صحیح است (نه workspaceUserId)
      readAt: true,
    },
  },
};

export const searchFields = ["name", "description"];
export const relations = [];
export const connects = ["team"];
