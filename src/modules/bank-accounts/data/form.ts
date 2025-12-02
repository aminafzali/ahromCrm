import { FormConfig } from "@/@Client/types/form";
import { columnsForSelect as columnsForSelectWorkspaceUser } from "@/modules/workspace-users/data/table";
import { createBankAccountSchema } from "../validation/schema";

export const getBankAccountFormConfig = (
  data?: Map<string, any>
): FormConfig => {
  return {
    fields: [
      {
        name: "title",
        label: "نام حساب بانکی",
        type: "text",
        placeholder: "مثلاً حساب اصلی شرکت",
        required: true,
        col: 2,
      },
      {
        name: "bankName",
        label: "بانک",
        type: "text",
        placeholder: "نام بانک را وارد کنید",
        col: 2,
      },
      {
        name: "cardNumber",
        label: "شماره کارت",
        type: "text",
        placeholder: "مثلاً ۶۲۷۴-۱۲۳۴-....",
        col: 2,
      },
      {
        name: "accountNumber",
        label: "شماره حساب",
        type: "text",
        placeholder: "شماره حساب را وارد کنید",
        col: 2,
      },
      {
        name: "iban",
        label: "شماره شبا (اختیاری)",
        type: "text",
        placeholder: "IRxxxxxxxxxxxxxxxxxxxxxx",
        col: 2,
      },
      {
        name: "workspaceUser",
        label: "مخاطب (صاحب حساب)",
        type: "dataTable",
        data: data?.get("workspaceUsers") || [],
        columns: columnsForSelectWorkspaceUser,
        multiple: false,
        col: 2,
      },
      {
        name: "isDefaultForReceive",
        label: "پیش‌فرض دریافتی‌ها",
        type: "checkbox",
        col: 1,
      },
      {
        name: "isDefaultForPay",
        label: "پیش‌فرض پرداختی‌ها",
        type: "checkbox",
        col: 1,
      },
    ],
    validation: createBankAccountSchema,
    layout: {
      columns: 2,
      gap: 4,
    },
  };
};
