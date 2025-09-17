// مسیر فایل: src/modules/tasks/data/form.ts

import { FormConfig } from "@/@Client/types/form";
import { columnsForSelect as columnsForSelectStatus } from "@/modules/pm-statuses/data/table";
import { columnsForSelect as columnsForSelectWorkspaceUser } from "@/modules/workspace-users/data/table";
import { createTaskSchema, updateTaskSchema } from "../validation/schema";
// You need a simple table config for projects
const columnsForSelectProject: any[] = [
  { name: "name", field: "name", label: "نام پروژه" },
];

const priorityOptions = [
  { label: "کم", value: "low" },
  { label: "متوسط", value: "medium" },
  { label: "زیاد", value: "high" },
];

export const getCreateFormConfig = (data?: Map<string, any>): FormConfig => ({
  fields: [
    {
      name: "title",
      label: "عنوان وظیفه",
      type: "text",
      required: true,
      col: 2,
    },
    { name: "description", label: "توضیحات", type: "textarea", col: 2 },
    {
      name: "project",
      label: "پروژه",
      type: "dataTable",
      required: true,
      data: data?.get("projects") || [],
      columns: columnsForSelectProject,
    },
    {
      name: "status",
      label: "وضعیت وظیفه",
      type: "dataTable",
      required: true,
      data: data?.get("taskStatuses") || [],
      columns: columnsForSelectStatus,
    },
    { name: "startDate", label: "تاریخ شروع", type: "date" },
    { name: "endDate", label: "تاریخ پایان", type: "date" },
    {
      name: "priority",
      label: "اولویت",
      type: "select",
      options: priorityOptions,
    },
    {
      name: "assignedUsers",
      label: "اعضای تخصیص یافته",
      type: "dataTable",
      data: data?.get("workspaceUsers") || [],
      columns: columnsForSelectWorkspaceUser,
      multiple: true,
    },
  ],
  validation: createTaskSchema,
  layout: {
    columns: 2,
    gap: 4,
  },
});

export const getUpdateFormConfig = (data?: Map<string, any>): FormConfig => ({
  fields: [
    {
      name: "title",
      label: "عنوان وظیفه",
      type: "text",
      required: true,
      col: 2,
    },
    { name: "description", label: "توضیحات", type: "textarea", col: 2 },
    {
      name: "project",
      label: "پروژه",
      type: "dataTable",
      required: true,
      data: data?.get("projects") || [],
      columns: columnsForSelectProject,
    },
    {
      name: "status",
      label: "وضعیت وظیفه",
      type: "dataTable",
      required: true,
      data: data?.get("taskStatuses") || [],
      columns: columnsForSelectStatus,
    },
    { name: "startDate", label: "تاریخ شروع", type: "date" },
    { name: "endDate", label: "تاریخ پایان", type: "date" },
    {
      name: "priority",
      label: "اولویت",
      type: "select",
      options: priorityOptions,
    },
    {
      name: "assignedUsers",
      label: "اعضای تخصیص یافته",
      type: "dataTable",
      showName: "displayName",
      data: data?.get("workspaceUsers") || [],
      columns: columnsForSelectWorkspaceUser,
      multiple: true,
    },
  ],
  validation: updateTaskSchema,
  layout: {
    columns: 2,
    gap: 4,
  },
});
