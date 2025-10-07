import { FormConfig } from "@/@Client/types/form";
import { z } from "zod";
import { columnsForSelect } from "./table";

export const createSupportCategorySchema = z.object({
  name: z.string().min(1, "نام الزامی است"),
  parent: z
    .object({ id: z.coerce.number().int().positive() })
    .optional()
    .nullable(),
});

export const updateSupportCategorySchema =
  createSupportCategorySchema.partial();

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
    validation: createSupportCategorySchema,
    layout: { columns: 2, gap: 4 },
  };
};
