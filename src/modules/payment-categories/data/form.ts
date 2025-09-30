import { FormConfig } from "@/@Client/types/form";
import { createPaymentCategorySchema } from "../validation/schema";
import { columnsForSelect } from "./table";

export const getCategoryFormConfig = (data?: Map<string, any>): FormConfig => {
  return {
    fields: [
      {
        name: "name",
        label: "نام دسته‌بندی",
        type: "text",
        placeholder: "نام دسته‌بندی را وارد کنید",
        required: true,
        col: 2,
      },
      {
        name: "slug",
        label: "نامک",
        type: "text",
        placeholder: "نامک دسته‌بندی را وارد کنید",
        required: true,
        col: 2,
      },
      {
        name: "parent",
        label: "دسته‌بندی والد",
        type: "dataTable",
        data: data?.get("payment-categories") || [],
        placeholder: "انتخاب دسته‌بندی والد",
        columns: columnsForSelect,
        multiple:false,
        col: 2,
      },
    ],
    validation: createPaymentCategorySchema,
    layout: {
      columns: 2,
      gap: 4,
    },
  };
};
