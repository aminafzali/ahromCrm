// مسیر فایل: src/modules/pm-statuses/data/form.ts

import { FormConfig } from "@/@Client/types/form";
import {
  createPMStatusSchema,
  updatePMStatusSchema,
} from "../validation/schema";

const statusTypes = [
  { label: "پروژه", value: "PROJECT" },
  { label: "وظیفه", value: "TASK" },
];

export const getCreateFormConfig = (): FormConfig => ({
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
  ],
  validation: createPMStatusSchema,
});

export const getUpdateFormConfig = (): FormConfig => ({
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
  ],
  validation: updatePMStatusSchema,
});
