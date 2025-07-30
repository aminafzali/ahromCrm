// مسیر فایل: src/modules/workspace-users/data/form.ts

import { FormConfig } from "@/@Client/types/form";
import { columnsForSelect as columnsForSelectLabel } from "@/modules/labels/data/table";
import { columnsForSelect as columnsForSelectRole } from "@/modules/roles/data/table";
import { columnsForSelect as columnsForSelectGroup } from "@/modules/user-groups/data/table";
import {
  createWorkspaceUserSchema,
  updateWorkspaceUserSchema,
} from "../validation/schema";

/**
 * پیکربندی فرم دعوت عضو جدید
 */
export const getCreateFormConfig = (data?: Map<string, any>): FormConfig => ({
  fields: [
    {
      name: "name",
      label: "نام واقعی (جهت احراز هویت)",
      type: "text",
      placeholder: "نام کامل عضو را وارد کنید",
      required: true,
      col: 2,
    },
    {
      name: "displayName",
      label: "نام نمایشی (در این ورک‌اسپیس)",
      type: "text",
      placeholder: "نام نمایشی عضو را وارد کنید",
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
      name: "role",
      label: "نقش",
      type: "dataTable",
      data: data?.get("roles") || [],
      columns: columnsForSelectRole,
      required: true,
      col: 2,
    },
    // ویرگول اضافی در اینجا حذف شد که باعث بروز خطا شده بود
    {
      name: "labels",
      label: "برچسب‌ها (اختیاری)",
      type: "dataTable",
      data: data?.get("labels") || [],
      columns: columnsForSelectLabel,
      multiple: true,
      col: 2,
    },
    {
      name: "userGroups",
      label: "گروه‌ها (اختیاری)",
      type: "dataTable",
      data: data?.get("userGroups") || [],
      columns: columnsForSelectGroup,
      multiple: true,
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
 * پیکربندی فرم ویرایش نقش و پروفایل عضو
 */
export const getUpdateFormConfig = (data?: Map<string, any>): FormConfig => ({
  fields: [
    {
      name: "displayName",
      label: "نام نمایشی (در این ورک‌اسپیس)",
      type: "text",
      placeholder: "نام نمایشی عضو را وارد کنید",
      required: true,
      col: 2,
    },
    {
      name: "role",
      label: "نقش",
      type: "dataTable", // از دیتا تیبل برای هماهنگی استفاده می‌کنیم
      data: data?.get("roles") || [],
      columns: columnsForSelectRole,
      required: true,
      col: 2,
    },
    {
      name: "labels",
      label: "برچسب‌ها",
      type: "dataTable",
      data: data?.get("labels") || [],
      columns: columnsForSelectLabel,
      multiple: true,
      col: 2,
    },
    {
      name: "userGroups",
      label: "گروه‌ها",
      type: "dataTable",
      data: data?.get("userGroups") || [],
      columns: columnsForSelectGroup,
      multiple: true,
      col: 2,
    },
  ],
  validation: updateWorkspaceUserSchema,
  layout: {
    columns: 2,
    gap: 4,
  },
});
