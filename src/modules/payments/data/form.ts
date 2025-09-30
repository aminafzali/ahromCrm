import { FormConfig } from "@/@Client/types/form";
import { createPaymentSchema } from "../validation/schema";

export const getPaymentFormConfig = (data?: Map<string, any>): FormConfig => {
  return {
    fields: [
      {
        name: "amount",
        label: "مبلغ (تومان)",
        type: "number",
        placeholder: "مبلغ را وارد کنید",
        required: true,
        col: 2,
      },
      {
        name: "method",
        label: "روش پرداخت",
        type: "select",
        defaultValue: "CARD",
        options: [
          { value: "CASH", label: "نقدی" },
          { value: "CARD", label: "کارتخوان" },
          { value: "TRANSFER", label: "انتقال" },
        ],
        required: true,
        col: 1,
      },
      {
        name: "type",
        label: "نوع تراکنش",
        type: "select",
        defaultValue: "RECEIVE",
        options: [
          { value: "RECEIVE", label: "دریافت" },
          { value: "PAY", label: "پرداخت" },
        ],
        required: true,
        col: 1,
      },
      {
        name: "reference",
        label: "شماره پیگیری",
        type: "text",
        placeholder: "شماره پیگیری را وارد کنید",
        col: 2,
      },
      {
        name: "status",
        label: "وضعیت",
        type: "select",
        defaultValue: "SUCCESS",
        options: [
          { value: "PENDING", label: "در انتظار تایید" },
          { value: "SUCCESS", label: "موفق" },
          { value: "FAILED", label: "ناموفق" },
        ],
        required: true,
        col: 2,
      },
      {
        name: "workspaceUser",
        label: "کاربر",
        type: "dataTable",
        data: data?.get("workspaceUsers") || [],
        columns: [
          { name: "displayName", field: "displayName", label: "نام" },
          { name: "phone", field: "phone", label: "شماره تماس" },
        ],
        col: 2,
      },
      {
        name: "invoice",
        label: "فاکتور",
        type: "dataTable",
        data: data?.get("invoices") || [],
        columns: [
          { name: "id", field: "id", label: "شماره فاکتور" },
          { name: "total", field: "total", label: "مبلغ کل" },
        ],
        col: 2,
      },
      {
        name: "description",
        label: "توضیحات",
        type: "textarea",
        className: "w-full",
        col: 4,
      },
    ],
    validation: createPaymentSchema,
    layout: {
      columns: 4,
      gap: 4,
    },
  };
};
