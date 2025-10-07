import { FormConfig } from "@/@Client/types/form";
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
        name: "parent",
        label: "دسته‌بندی والد",
        type: "dataTable",
        data: data?.get("supports-categories") || [],
        columns: columnsForSelect,
        multiple: false,
        col: 2,
      },
    ],
    validation: undefined as unknown as any,
    layout: { columns: 2, gap: 4 },
  };
};
