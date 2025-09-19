// مسیر فایل: src/modules/teams/data/form.ts

import { FormConfig } from "@/@Client/types/form";
import { columnsForSelect as columnsForSelectWorkspaceUser } from "@/modules/workspace-users/data/table";
import { createTeamSchema, updateTeamSchema } from "../validation/schema";
import { columnsForSelect } from "./table";

export const getCreateFormConfig = (data?: Map<string, any>): FormConfig => ({
  fields: [
    {
      name: "name",
      label: "نام تیم",
      type: "text",
      required: true,
    },
    // ===== شروع کد جدید =====
    {
      name: "parent",
      label: "تیم والد (اختیاری)",
      type: "dataTable",
      options: data?.get("teams") || [], // لیست تیم‌ها برای انتخاب والد
      columns: columnsForSelect,
    },
    // ===== پایان کد جدید =====
    {
      name: "description",
      label: "توضیحات",
      type: "textarea",
    },
    {
      name: "members",
      label: "اعضای تیم",
      type: "dataTable",
      data: data?.get("workspaceUsers") || [],
      columns: columnsForSelectWorkspaceUser,
      multiple: true,
    },
  ],
  validation: createTeamSchema,
});

export const getUpdateFormConfig = (data?: Map<string, any>): FormConfig => ({
  fields: [
    {
      name: "name",
      label: "نام تیم",
      type: "text",
      required: true,
    },
    // ===== شروع کد جدید =====
    {
      name: "parent",
      label: "تیم والد (اختیاری)",
      type: "dataTable",
      options: data?.get("teams") || [], // لیست تیم‌ها برای انتخاب والد
      columns: columnsForSelect,
      required: false,
    },
    // ===== پایان کد جدید =====
    {
      name: "description",
      label: "توضیحات",
      type: "textarea",
    },
    {
      name: "members",
      label: "اعضای تیم",
      type: "dataTable",
      data: data?.get("workspaceUsers") || [],
      columns: columnsForSelectWorkspaceUser,
      multiple: true,
    },
  ],
  validation: updateTeamSchema,
});
