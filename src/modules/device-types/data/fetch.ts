// src/modules/device-types/data/fetch.ts

/**
 * پیکربندی واکشی داده‌ها برای ماژول انواع دستگاه
 */
export const include = {
  _count: {
    select: {
      receivedDevices: true,
    },
  },
};

export const searchFileds = ["name", "description"];
export const relations = [];
export const connect = [];
