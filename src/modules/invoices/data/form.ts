// import { FormConfig } from "@/@Client/types/form";
// import { createInvoiceSchema } from "../validation/schema";

// export const getInvoiceFormConfig = (data?: Map<string, any>): FormConfig => {
//   return {
//     fields: [
//       {
//         name: "items",
//         label: "اقلام فاکتور",
//         type: "dataTable",
//         data: [],
//         multiple: true,
//         col: 4,
//         required: true,
//       },
//       {
//         name: "tax",
//         label: "مالیات (تومان)",
//         type: "number",
//         placeholder: "مبلغ مالیات را وارد کنید",
//         col: 2,
//         required: true,
//       },
//       {
//         name: "discount",
//         label: "تخفیف (تومان)",
//         type: "number",
//         placeholder: "مبلغ تخفیف را وارد کنید",
//         col: 2,
//       },
//       {
//         name: "status",
//         label: "وضعیت",
//         type: "select",
//         options: [
//           { value: "PENDING", label: "در انتظار پرداخت" },
//           { value: "PAID", label: "پرداخت شده" },
//           { value: "CANCELLED", label: "لغو شده" },
//         ],
//         col: 2,
//         required: true,
//       },
//       {
//         name: "paymentDate",
//         label: "تاریخ پرداخت",
//         type: "date",
//         col: 2,
//       },
//     ],
//     validation: createInvoiceSchema,
//     layout: {
//       columns: 4,
//       gap: 4,
//     },
//   };
// };