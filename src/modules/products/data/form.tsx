import { FormConfig } from "@/@Client/types/form";
import { columnsForSelect as brandColumns } from "@/modules/brands/data/table";
import { columnsForSelect as categoryColumns } from "@/modules/categories/data/table";
import { createProductSchema } from "../validation/schema";

export const getProductFormConfig = (data?: Map<string, any>): FormConfig => {
  return {
    fields: [
      {
        name: "name",
        label: "نام محصول",
        type: "text",
        placeholder: "نام محصول را وارد کنید",
        required: true,
      },
      {
        name: "price",
        label: "قیمت",
        type: "number",
        placeholder: "قیمت محصول را وارد کنید",
        required: true,
      },
      {
        name: "stock",
        label: "موجودی",
        type: "number",
        placeholder: "موجودی محصول را وارد کنید",
        required: true,
      },
      {
        name: "brand",
        label: "برند",
        type: "dataTable",
        data: data?.get("brands") || [],
        columns: brandColumns,
      },
      {
        name: "category",
        label: "دسته‌بندی",
        type: "dataTable",
        data: data?.get("categories") || [],
        columns: categoryColumns,
      },
    ],
    validation: createProductSchema,
    layout: {
      columns: 2,
      gap: 4,
    },
  };
};
