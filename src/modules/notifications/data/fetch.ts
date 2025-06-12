export const include = {
  user: {
    select: {
      id: true,
      name: true,
      phone: true,
    },
  },
  request: {
    select: {
      id: true,
      serviceType: true,
      status: true,
    },
  },
};

export const searchFileds = ["title", "message"];
export const relations = ["user", "request"];