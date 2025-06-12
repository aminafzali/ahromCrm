import { FormConfig } from "@/@Client/types/form";
import { z } from "zod";
import { createLabelSchema } from "../validation/schema";

export const getUserFormConfig = (data?: Map<string, any>): FormConfig => {
  return {
    fields: [
      {
        name: "label",
        label: "برچسب",
        type: "text",
        placeholder: "برچسب را وارد کنید",
        required: true,
      },

      {
        name: "placeholder",
        label: "توضیحات",
        type: "text",
        placeholder: "توضیحات را وارد کنید",
        required: false,
      },
      {
        name: "type",
        label: "نوع فیلد",
        type: "select",
        options: [
          { value: "text", label: "متن" },
          { value: "number", label: "عدد" },
          { value: "boolean", label: "چک‌باکس" },
          { value: "select", label: "انتخابی" },
          { value: "multi_select", label: "انتخاب چندگانه" },
          { value: "date", label: "تاریخ" },
          { value: "file", label: "فایل" },
        ],
        placeholder: "نوع",
        required: true,
      },
    ],
    validation: createLabelSchema,
    layout: {
      columns: 2,
      gap: 4,
    },
  };
};

export const labelFormConfig: FormConfig = {
  fields: [
    {
      name: "name",
      label: "نام برچسب",
      type: "text",
      placeholder: "نام برچسب را وارد کنید",
      required: true,
    },
    {
      name: "color",
      label: "رنگ",
      type: "color",
    },
  ],
  validation: z.object({
    name: z.string().min(1, "نام برچسب الزامی است"),
    color: z.string(),
  }),
  layout: {
    columns: 2,
    gap: 4,
  },
};
