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

const splitTaskStatuses = (data?: Map<string, any>) => {
  const taskStatuses = (data?.get("taskStatuses") || []) as any[];
  const globals = taskStatuses.filter((status) => !status.projectId);
  const projectSpecific = taskStatuses.filter((status) => !!status.projectId);
  return { globals, projectSpecific };
};

export const getCreateFormConfig = (data?: Map<string, any>): FormConfig => {
  const { globals, projectSpecific } = splitTaskStatuses(data);

  return {
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
        name: "globalStatus",
        label: "وضعیت کلی وظیفه",
        type: "dataTable",
        required: true,
        data: globals,
        columns: columnsForSelectStatus,
      },
      {
        name: "projectStatus",
        label: "وضعیت خاص پروژه",
        type: "dataTable",
        data: projectSpecific,
        columns: columnsForSelectStatus,
        placeholder:
          "برای استفاده از وضعیت‌های خاص، ابتدا پروژه را انتخاب کنید.",
      },
      // { name: "startDate", label: "تاریخ شروع", type: "date" },
      // { name: "endDate", label: "تاریخ پایان", type: "date" },
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
  };
};

export const getUpdateFormConfig = (data?: Map<string, any>): FormConfig => {
  const { globals, projectSpecific } = splitTaskStatuses(data);

  return {
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
        name: "globalStatus",
        label: "وضعیت کلی وظیفه",
        type: "dataTable",
        required: true,
        data: globals,
        columns: columnsForSelectStatus,
      },
      {
        name: "projectStatus",
        label: "وضعیت خاص پروژه",
        type: "dataTable",
        data: projectSpecific,
        columns: columnsForSelectStatus,
        placeholder:
          "برای استفاده از وضعیت‌های خاص، ابتدا پروژه را انتخاب کنید.",
      },
      // { name: "startDate", label: "تاریخ شروع", type: "date" },
      // { name: "endDate", label: "تاریخ پایان", type: "date" },
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
    validation: updateTaskSchema,
    layout: {
      columns: 2,
      gap: 4,
    },
  };
};
