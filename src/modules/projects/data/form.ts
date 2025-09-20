// مسیر فایل: src/modules/projects/data/form.ts

import { FormConfig } from "@/@Client/types/form";
import { columnsForSelect as columnsForSelectStatus } from "@/modules/pm-statuses/data/table";
import { columnsForSelect as columnsForSelectTeam } from "@/modules/teams/data/table";
import { columnsForSelect as columnsForSelectWorkspaceUser } from "@/modules/workspace-users/data/table";
import { createProjectSchema, updateProjectSchema } from "../validation/schema";

export const getCreateFormConfig = (data?: Map<string, any>): FormConfig => ({
  fields: [
    { name: "name", label: "نام پروژه", type: "text", required: true, col: 2 },
    { name: "description", label: "توضیحات", type: "textarea", col: 2 },

    {
      name: "status",
      label: "وضعیت پروژه",
      type: "dataTable",
      required: true,
      data: data?.get("projectStatuses") || [],
      columns: columnsForSelectStatus,
    },
    {
      name: "assignedUsers",
      label: "اعضای تخصیص یافته",
      showName: "displayName",
      type: "dataTable",
      data: data?.get("workspaceUsers") || [],
      columns: columnsForSelectWorkspaceUser,
      multiple: true,
    },
    {
      name: "assignedTeams",
      label: "تیم‌های تخصیص یافته",
      type: "dataTable",
      data: data?.get("teams") || [],
      columns: columnsForSelectTeam,
      multiple: true,
    },
    { name: "startDate", label: "تاریخ شروع", type: "date" },
    { name: "endDate", label: "تاریخ پایان", type: "date" },
  ],
  validation: createProjectSchema,
  layout: {
    columns: 2,
    gap: 4,
  },
});

export const getUpdateFormConfig = (data?: Map<string, any>): FormConfig => ({
  fields: [
    { name: "name", label: "نام پروژه", type: "text", required: true, col: 2 },
    { name: "description", label: "توضیحات", type: "textarea", col: 2 },
    // { name: "startDate", label: "تاریخ شروع", type: "date" },
    // { name: "endDate", label: "تاریخ پایان", type: "date" },
    {
      name: "status",
      label: "وضعیت پروژه",
      type: "dataTable",
      required: true,
      data: data?.get("projectStatuses") || [],
      columns: columnsForSelectStatus,
    },
    {
      name: "assignedUsers",
      label: "اعضای تخصیص یافته",
      type: "dataTable",
      data: data?.get("workspaceUsers") || [],
      columns: columnsForSelectWorkspaceUser,
      multiple: true,
    },
    {
      name: "assignedTeams",
      label: "تیم‌های تخصیص یافته",
      type: "dataTable",
      data: data?.get("teams") || [],
      columns: columnsForSelectTeam,
      multiple: true,
    },
  ],
  validation: updateProjectSchema,
  layout: {
    columns: 2,
    gap: 4,
  },
});
