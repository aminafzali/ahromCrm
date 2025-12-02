// مسیر فایل: src/modules/workspace-users/data/form.ts

import { FormConfig } from "@/@Client/types/form";
import { IRAN_PROVINCES } from "@/lib/iran-regions";
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
      name: "labels",
      label: "برچسب‌ها (اختیاری)",
      type: "dataTable",
      data: data?.get("labels") || [],
      columns: columnsForSelectLabel,
      multiple: true,
      col: 2,
    },
    {
      name: "userGroupId",
      label: "گروه کاربری (اختیاری)",
      type: "dataTable",
      data: data?.get("userGroup") ? [data.get("userGroup")] : [],
      columns: columnsForSelectGroup,
      multiple: false, // تغییر به one-to-one
      col: 2,
    },
    {
      name: "role",
      label: " (به مشتریان و کاربران عادی نقش کاربر عادی بدهید = User) نقش",
      type: "dataTable",
      data: data?.get("roles") || [],
      columns: columnsForSelectRole,
      required: true,
      col: 2,
    },

    // --- فیلدهای اطلاعات تکمیلی ---
    {
      name: "address",
      label: "آدرس",
      type: "textarea",
      placeholder: "آدرس کامل مخاطب را وارد کنید",
      col: 2,
    },
    {
      name: "postalCode",
      label: "کد پستی",
      type: "text",
      placeholder: "کد پستی ۱۰ رقمی",
      col: 1,
    },
    {
      name: "province",
      label: "استان",
      type: "select",
      options: IRAN_PROVINCES.map((p) => ({
        value: p.code,
        label: p.name,
      })),
      col: 1,
    },
    {
      name: "city",
      label: "شهر",
      type: "text",
      placeholder: "نام شهر",
      col: 1,
    },
    {
      name: "economicCode",
      label: "شماره اقتصادی",
      type: "text",
      col: 1,
    },
    {
      name: "registrationNumber",
      label: "شماره ثبت",
      type: "text",
      col: 1,
    },
    {
      name: "nationalId",
      label: "کد ملی / شناسه ملی",
      type: "text",
      col: 1,
    },
    {
      name: "otherPhones",
      label: "شماره تلفن‌های دیگر",
      type: "textarea",
      placeholder: "هر شماره را در یک خط وارد کنید",
      col: 2,
    },
    {
      name: "bankAccounts",
      label: "شماره حساب / کارت‌ها (یادداشت سریع)",
      type: "textarea",
      placeholder: "هر حساب/کارت را در یک خط وارد کنید",
      col: 2,
    },
    {
      name: "description",
      label: "توضیحات",
      type: "textarea",
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
      col: 2,
    },
    {
      name: "role",
      label: " ( به مشتریان و کاربران عادی نقش کاربر عادی بدهید = User) نقش",
      type: "dataTable",
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
      name: "userGroupId",
      label: "گروه کاربری",
      type: "dataTable",
      data: data?.get("userGroup") ? [data.get("userGroup")] : [],
      columns: columnsForSelectGroup,
      multiple: false, // تغییر به one-to-one
      col: 2,
    },
    {
      name: "address",
      label: "آدرس",
      type: "textarea",
      col: 2,
    },
    {
      name: "postalCode",
      label: "کد پستی",
      type: "text",
      col: 1,
    },
    {
      name: "province",
      label: "استان",
      type: "select",
      options: IRAN_PROVINCES.map((p) => ({
        value: p.code,
        label: p.name,
      })),
      col: 1,
    },
    {
      name: "city",
      label: "شهر",
      type: "text",
      col: 1,
    },
    {
      name: "economicCode",
      label: "شماره اقتصادی",
      type: "text",
      col: 1,
    },
    {
      name: "registrationNumber",
      label: "شماره ثبت",
      type: "text",
      col: 1,
    },
    {
      name: "nationalId",
      label: "کد ملی / شناسه ملی",
      type: "text",
      col: 1,
    },
    {
      name: "otherPhones",
      label: "شماره تلفن‌های دیگر",
      type: "textarea",
      col: 2,
    },
    {
      name: "bankAccounts",
      label: "شماره حساب / کارت‌ها (یادداشت سریع)",
      type: "textarea",
      col: 2,
    },
    {
      name: "description",
      label: "توضیحات",
      type: "textarea",
      col: 2,
    },
  ],
  validation: updateWorkspaceUserSchema,
  layout: {
    columns: 2,
    gap: 4,
  },
});
