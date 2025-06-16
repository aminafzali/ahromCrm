// src/modules/received-devices/data/form.ts

import { FormConfig } from "@/@Client/types/form";
import { columnsForSelect as brandColumns } from "@/modules/brands/data/table";
import { columnsForSelect as deviceTypeColumns } from "@/modules/device-types/data/table";
import { columnsForUser as requestColumns } from "@/modules/requests/data/table";
import { columnsForSelect as userColumns } from "@/modules/users/data/table";
import { createReceivedDeviceSchema } from "../validation/schema";

export const getReceivedDeviceFormConfig = (
  data?: Map<string, any>
): FormConfig => {
  return {
    validation: createReceivedDeviceSchema,
    fields: [
      {
        name: "request",
        label: "درخواست مرتبط (اختیاری)",
        type: "dataTable",
        columns: requestColumns,
        data: data?.get("requests") || [],
      },
      {
        name: "user",
        label: "مشتری",
        type: "dataTable",
        required: true,
        columns: userColumns,
        data: data?.get("users") || [],
      },
      {
        name: "deviceType",
        label: "نوع دستگاه",
        type: "dataTable",
        required: true,
        columns: deviceTypeColumns,
        data: data?.get("deviceTypes") || [],
      },
      {
        name: "brand",
        label: "برند",
        type: "dataTable",
        required: true,
        columns: brandColumns,
        data: data?.get("brands") || [],
      },
      { name: "model", label: "مدل", type: "text", col: 2 },
      { name: "serialNumber", label: "شماره سریال", type: "text", col: 2 },
      {
        name: "problemDescription",
        label: "شرح مشکل",
        type: "textarea",
        required: true,
        col: 2,
      },
      {
        name: "initialCondition",
        label: "وضعیت ظاهری اولیه",
        type: "textarea",
        required: true,
        col: 2,
      },
      { name: "notes", label: "توضیحات بیشتر", type: "textarea", col: 2 },
    ],
    layout: { columns: 2, gap: 4 },
  };
};
