// مسیر فایل: src/modules/actual-services/data/form.ts

import { FormConfig } from "@/@Client/types/form";
import { columnsForSelect } from "@/modules/service-types/data/table";
import { createActualServiceSchema } from "../validation/schema";
export const getActualServiceFormConfig = (
  data?: Map<string, any>
): FormConfig => {
  return {
    fields: [
      {
        name: "name",
        label: "نام خدمت",
        type: "text",
        placeholder: "مثلا: تعویض پمپ آب",
        required: true,
      },
      {
        name: "price",
        label: "قیمت (به تومان)",
        type: "number",
        placeholder: "مثلا: 150000",
        required: true,
      },
      {
        name: "serviceType",
        label: "نوع خدمت ",
        type: "dataTable",
        data: data?.get("service-types") || [],
        columns: columnsForSelect,
      },
      {
        name: "description",
        label: "توضیحات",
        type: "textarea",
        placeholder: "توضیحات بیشتر در مورد این خدمت (اختیاری)",
        col: 2,
      },
    ],
    validation: createActualServiceSchema,
    layout: {
      columns: 2,
      gap: 4,
    },
  };
};
