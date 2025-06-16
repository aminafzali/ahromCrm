// src/modules/received-devices/data/fetch.ts

export const include = {
  user: {
    select: { id: true, name: true, phone: true },
  },
  brand: {
    select: { id: true, name: true },
  },
  deviceType: {
    select: { id: true, name: true },
  },
  // اصلاح اصلی: include تو در تو برای واکشی serviceType از طریق request
  request: {
    include: {
      status: true,
      serviceType: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
};

export const searchFileds = ["model", "serialNumber", "problemDescription"];
export const relations = [];
export const connect = ["user", "brand", "deviceType", "request"];
