// مسیر فایل: src/modules/notifications/data/form.ts

import { FormConfig } from "@/@Client/types/form";
import { columnsForAdmin as workspaceUserColumns } from "@/modules/workspace-users/data/table";
import { createNotificationSchema } from "../validation/schema";

export const getCreateFormConfig = (data?: Map<string, any>): FormConfig => {
  return {
    fields: [
      {
        name: "workspaceUser", // نام فیلد برای انتخاب عضو
        label: "ارسال به",
        type: "dataTable", // از کامپوننت جدول داده برای انتخاب استفاده می‌کنیم
        required: true,
        columns: workspaceUserColumns,
        data: data?.get("workspaceUsers") || [],
      },
      {
        name: "title",
        label: "عنوان",
        type: "text",
        required: true,
        col: 2,
      },
      {
        name: "message",
        label: "متن پیام",
        type: "textarea",
        required: true,
        col: 2,
      },
      {
        name: "sendSms",
        label: "ارسال پیامک؟",
        type: "switch",
        col: 2,
      },
      {
        name: "sendEmail",
        label: "ارسال ایمیل؟",
        type: "switch",
        col: 2,
      },
    ],
    validation: createNotificationSchema,
    layout: {
      columns: 2,
      gap: 4,
    },
  };
};
