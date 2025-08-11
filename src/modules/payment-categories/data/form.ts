import { FormConfig } from "@/@Client/types/form";
import { createPaymentCategorySchema } from "../validation/schema";

export const getCreateFormConfig = (data?: Map<string, any>): FormConfig => {
  const categories = data?.get("categories") || [];
  const categoryOptions = categories.map((cat: any) => ({
    label: cat.name,
    value: cat.id,
  }));

  return {
    fields: [
      {
        name: "name",
        label: "نام دسته‌بندی",
        type: "text",
        required: true,
        col: 2,
      },
      { name: "slug", label: "اسلاگ", type: "text", required: true, col: 2 },
      {
        name: "type",
        label: "نوع",
        type: "select",
        required: true,
        options: [
          { value: "INCOME", label: "درآمد" },
          { value: "EXPENSE", label: "هزینه" },
          { value: "TRANSFER", label: "انتقال" },
        ],
        col: 2,
      },
      {
        name: "parentId",
        label: "دسته‌بندی والد (اختیاری)",
        type: "select",
        options: categoryOptions,
        col: 2,
      },
      { name: "description", label: "توضیحات", type: "textarea", col: 4 },
    ],
    validation: createPaymentCategorySchema,
    layout: { columns: 4, gap: 4 },
  };
};

export const getUpdateFormConfig = getCreateFormConfig;
