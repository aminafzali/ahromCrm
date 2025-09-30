// مسیر فایل: src/modules/permissions/data/form.ts

import { FormConfig } from "@/@Client/types/form";
import { createPermissionSchema } from "../validation/schema";

export const getPermissionFormConfig = (
  data?: Map<string, any>
): FormConfig => {
  return {
    fields: [
      {
        name: "action",
        label: "عمل (Action)",
        type: "text",
        placeholder: "مثال: create:invoice",
        required: true,
        col: 2,
      },
      {
        name: "module",
        label: "نام ماژول",
        type: "text",
        placeholder: "مثال: Invoices",
        required: true,
        col: 2,
      },
      {
        name: "description",
        label: "توضیحات",
        type: "textarea",
        placeholder: "توضیحات دسترسی را وارد کنید",
        col: 2,
      },
    ],
    validation: createPermissionSchema,
    layout: {
      columns: 2,
      gap: 4,
    },
  };
};
