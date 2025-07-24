// مسیر فایل: src/modules/workspace-users/data/form.ts

import { FormConfig } from "@/@Client/types/form";
import {
  createWorkspaceUserSchema,
  updateWorkspaceUserSchema,
} from "../validation/schema";

/**
 * این تابع، پیکربندی فرم دعوت عضو جدید را برمی‌گرداند.
 * دقیقاً از الگوی getBrandFormConfig و getReceivedDeviceFormConfig پیروی می‌کند.
 * @param data - یک Map که می‌تواند داده‌های داینامیک مانند لیست نقش‌ها را به فرم تزریق کند.
 */
export const getCreateFormConfig = (data?: Map<string, any>): FormConfig => ({
  fields: [
    {
      name: "name",
      label: "نام نمایشی",
      type: "text",
      placeholder: "نام عضو را وارد کنید",
      required: true,
      col: 2,
    },
    {
      name: "phone",
      label: "شماره تلفن",
      type: "text",
      placeholder: "شماره تلفن عضو را وارد کنید",
      required: true,
      col: 2,
    },
    {
      name: "roleId",
      label: "نقش",
      type: "select",
      // گزینه‌ها از داده‌های ورودی خوانده می‌شوند، که خطا را برطرف می‌کند
      options: data?.get("roles") || [],
      required: true,
      col: 2,
    },
  ],
  validation: createWorkspaceUserSchema,
  layout: {
    columns: 2,
    gap: 4,
  },
});

/**
 * این تابع، پیکربندی فرم ویرایش نقش عضو را برمی‌گرداند.
 */
export const getUpdateFormConfig = (data?: Map<string, any>): FormConfig => ({
  fields: [
    {
      name: "roleId",
      label: "نقش",
      type: "select",
      options: data?.get("roles") || [],
      required: true,
      col: 2,
    },
  ],
  validation: updateWorkspaceUserSchema,
  layout: {
    columns: 2,
    gap: 4,
  },
});
