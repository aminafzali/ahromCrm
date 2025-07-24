// مسیر فایل: src/modules/roles/data/form.ts

import { FormConfig } from "@/@Client/types/form";
import { createRoleSchema } from "../validation/schema";

export const getCreateFormConfig = (data?: Map<string, any>): FormConfig => {
  return {
    fields: [
      {
        name: "name",
        label: "نام نقش",
        type: "text",
        placeholder: "نام نقش را وارد کنید",
        required: true,
        col: 2,
      },
      {
        name: "description",
        label: "توضیحات",
        type: "textarea",
        placeholder: "توضیحات نقش را وارد کنید",
        col: 2,
      },
    ],
    validation: createRoleSchema,
    layout: {
      columns: 2,
      gap: 4,
    },
  };
};

export const getUpdateFormConfig = getCreateFormConfig; // برای ویرایش از همان فرم ساخت استفاده می‌کنیم
