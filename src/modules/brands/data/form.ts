import { FormConfig } from "@/@Client/types/form";
import { createBrandSchema } from "../validation/schema";

export const getBrandFormConfig = (data?: Map<string, any>): FormConfig => {
  return {
    fields: [
      {
        name: "name",
        label: "نام برند",
        type: "text",
        placeholder: "نام برند را وارد کنید",
        required: true,
        col: 2,
      },
      {
        name: "description",
        label: "توضیحات",
        type: "textarea",
        placeholder: "توضیحات برند را وارد کنید",
        col: 2,
      },
    ],
    validation: createBrandSchema,
    layout: {
      columns: 2,
      gap: 4,
    },
  };
};




export const brandFormConfig: FormConfig = {
  fields: [
    {
      name: "name",
      label: "نام برند",
      type: "text",
      placeholder: "نام برند را وارد کنید",
      required: true,
      col: 2,
    },
    {
      name: "website",
      label: "وب‌سایت",
      type: "text",
      placeholder: "آدرس وب‌سایت را وارد کنید",
      col: 2,
    },
    {
      name: "description",
      label: "توضیحات",
      type: "textarea",
      placeholder: "توضیحات برند را وارد کنید",
      col: 2,
    },
  ],
  validation: createBrandSchema,
  layout: {
    columns: 2,
    gap: 4,
  },
};