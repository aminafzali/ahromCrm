import { FormConfig } from "@/@Client/types/form";
import { columnsForSelect } from "@/modules/users/data/table";
import { z } from "zod";
import { createUserGroupSchema } from "../validation/schema";

export const getUserGroupFormConfig = (data?: Map<string, any>): FormConfig => {
  return {
    fields: [
      {
        name: "name",
        label: "نام گروه",
        type: "text",
        col: 2,
        placeholder: "نام گروه را وارد کنید",
        required: true,
      },
      {
        name: "description",
        label: "توضیحات",
        type: "textarea",
        col: 2,
        placeholder: "توضیحات گروه را وارد کنید",
      },
      {
        name: "workspaceUsers",
        label: "مخاطب ها",
        type: "dataTable",
        data: data?.get("workspaceUsers") || [],
        col: 2,
        columns: columnsForSelect,
        multiple: true,
      },
    ],
    validation: createUserGroupSchema,
    layout: {
      columns: 4,
      gap: 4,
    },
  };
};

export const userGroupFormConfig: FormConfig = {
  fields: [
    {
      name: "name",
      label: "نام گروه",
      type: "text",
      placeholder: "نام گروه را وارد کنید",
      required: true,
    },
    {
      name: "description",
      label: "توضیحات",
      type: "textarea",
      placeholder: "توضیحات گروه را وارد کنید",
    },
  ],
  validation: z.object({
    name: z.string().min(1, "نام گروه الزامی است"),
    description: z.string().optional(),
  }),
  layout: {
    columns: 1,
    gap: 4,
  },
};
