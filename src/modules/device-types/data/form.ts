// src/modules/device-types/data/form.ts

import { FormConfig } from "@/@Client/types/form";
import { createDeviceTypeSchema } from "../validation/schema";

/**
 * پیکربندی فرم برای ایجاد و ویرایش نوع دستگاه
 * @param data - این پارامتر توسط Wrapper ها برای پاس دادن داده‌های fetch شده استفاده می‌شود.
 */
export const getDeviceTypeFormConfig = (
  data?: Map<string, any>
): FormConfig => {
  return {
    // schemaی اعتبارسنجی به صورت ثابت در اینجا تعریف می‌شود
    validation: createDeviceTypeSchema,

    fields: [
      {
        name: "name",
        label: "نام نوع دستگاه",
        type: "text",
        placeholder: "نام نوع دستگاه را وارد کنید",
        required: true,
        col: 2,
      },
      {
        name: "description",
        label: "توضیحات",
        type: "textarea",
        placeholder: "توضیحات تکمیلی را وارد کنید",
        col: 2,
      },
    ],

    layout: {
      columns: 2,
      gap: 4,
    },
  };
};
