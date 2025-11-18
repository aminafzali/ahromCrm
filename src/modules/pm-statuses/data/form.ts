// مسیر فایل: src/modules/pm-statuses/data/form.ts

import { FormConfig } from "@/@Client/types/form";
import { columnsForSelect as columnsForSelectProject } from "@/modules/projects/data/table";
import {
  createPMStatusSchema,
  updatePMStatusSchema,
} from "../validation/schema";

const statusTypes = [
  { label: "پروژه", value: "PROJECT" },
  { label: "وظیفه", value: "TASK" },
];

export const getCreateFormConfig = (data?: Map<string, any>): FormConfig => ({
  fields: [
    {
      name: "name",
      label: "نام وضعیت",
      type: "text",
      required: true,
    },
    {
      name: "type",
      label: "نوع وضعیت",
      type: "select",
      options: statusTypes,
      required: true,
    },
    {
      name: "color",
      label: "رنگ",
      type: "color",
      required: true,
    },
    {
      name: "project",
      label: "پروژه (اختیاری - برای وضعیت خاص)",
      type: "dataTable",
      data: data?.get("projects") || [],
      columns: columnsForSelectProject,
      placeholder:
        "اگر خالی بماند، وضعیت کلی خواهد بود. در صورت انتخاب پروژه، این وضعیت فقط برای وظایف آن پروژه اعمال می‌شود.",
    },
  ],
  validation: createPMStatusSchema,
});

export const getUpdateFormConfig = (data?: Map<string, any>): FormConfig => ({
  fields: [
    {
      name: "name",
      label: "نام وضعیت",
      type: "text",
      required: true,
    },
    {
      name: "type",
      label: "نوع وضعیت",
      type: "select",
      options: statusTypes,
      required: true,
    },
    {
      name: "color",
      label: "رنگ",
      type: "color",
      required: true,
    },
    {
      name: "project",
      label: "پروژه (اختیاری - برای وضعیت خاص)",
      type: "dataTable",
      data: data?.get("projects") || [],
      columns: columnsForSelectProject,
      placeholder:
        "اگر خالی بماند، وضعیت کلی خواهد بود. در صورت انتخاب پروژه، این وضعیت فقط برای وظایف آن پروژه اعمال می‌شود.",
    },
  ],
  validation: updatePMStatusSchema,
});
