import { FormConfig } from "@/@Client/types/form";
import { z } from "zod";
import { createStatusSchema } from "../validation/schema";

export const getStatusFormConfig = (data?: Map<string, any>): FormConfig => {
  return {
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
    validation: createStatusSchema,
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
