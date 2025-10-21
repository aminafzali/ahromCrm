import { FormConfig } from "@/@Client/types/form";
import { z } from "zod";
import { columnsForSelect } from "./table";

export const createActivityCategorySchema = z.object({
  name: z.string().min(1, "نام الزامی است"),
  parent: z
    .object({ id: z.coerce.number().int().positive() })
    .optional()
    .nullable(),
});

export const updateActivityCategorySchema =
  createActivityCategorySchema.partial();

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
        data: data?.get("activity-categories") || [],
        columns: columnsForSelect,
        multiple: false,
        col: 2,
      },
    ],
    validation: createActivityCategorySchema,
    layout: { columns: 2, gap: 4 },
  };
};
