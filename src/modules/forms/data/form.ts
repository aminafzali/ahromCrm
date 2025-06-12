import { FormConfig } from "@/@Client/types/form";
import { createFormSchema } from "../validation/schema";

export const getFormConfig = (data?: Map<string, any>): FormConfig => {
  return {
    fields: [
      {
        name: "name",
        label: "نام فرم",
        type: "text",
        placeholder: "نام فرم را وارد کنید",
        required: true,
      },
      {
        name: "description",
        label: "توضیحات",
        type: "textarea",
        placeholder: "توضیحات فرم را وارد کنید",
      },
    ],
    validation: createFormSchema,
    layout: {
      columns: 2,
      gap: 4,
    },
  };
};