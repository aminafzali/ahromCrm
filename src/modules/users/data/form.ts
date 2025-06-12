import { FormConfig } from "@/@Client/types/form";
import { columnsForSelect } from "@/modules/labels/data/table";
import { columnsForSelect as columnsForSelectGroup } from "@/modules/user-groups/data/table";
import { createUserSchema } from "../validation/schema";

export const getUserFormConfig = (data?: Map<string, any>): FormConfig => {
  return {
    fields: [
      {
        name: "name",
        label: "نام",
        type: "text",
        placeholder: "نام کامل",
        required: true,
        col: 2,
      },
      {
        name: "phone",
        label: "شماره تماس",
        type: "tel",
        placeholder: "09123456789",
        required: true,
        col: 2,
      },
      {
        name: "labels",
        label: "برچسب‌ها",
        type: "dataTable",
        data: data?.get("labels") || [],
        col: 2,
        columns: columnsForSelect,
        multiple: true,
      },
      {
        name: "groups",
        label: "گروه‌ها",
        type: "dataTable",
        data: data?.get("groups") || [],
        col: 2,
        columns: columnsForSelectGroup,
        multiple: true,
      },
    ],
    validation: createUserSchema,
    layout: {
      columns: 4,
      gap: 4,
    },
  };
};