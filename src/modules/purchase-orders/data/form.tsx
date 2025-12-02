import { FormConfig } from "@/@Client/types/form";
import { createPurchaseOrderSchema } from "../validation/schema";

export const getPurchaseOrderFormConfig = (
  data?: Map<string, any>
): FormConfig => {
  const suppliers = data?.get("suppliers") || [];
  const products = data?.get("products") || [];

  return {
    fields: [
      {
        name: "supplierWorkspaceUser",
        label: "تامین‌کننده",
        type: "select",
        options: suppliers.map((s: any) => ({
          value: s.id,
          label: s.user?.name || `User ${s.id}`,
        })),
        placeholder: "انتخاب تامین‌کننده",
      },
      {
        name: "status",
        label: "وضعیت",
        type: "select",
        options: [
          { value: "PENDING", label: "در انتظار" },
          { value: "APPROVED", label: "تایید شده" },
          { value: "RECEIVED", label: "دریافت شده" },
          { value: "CANCELED", label: "لغو شده" },
        ],
        defaultValue: "PENDING",
      },
      {
        name: "notes",
        label: "یادداشت",
        type: "textarea",
        placeholder: "یادداشت‌های مربوط به سفارش خرید...",
      },
      {
        name: "items",
        label: "آیتم‌های سفارش",
        type: "custom",
        render: (field: any, value: any, onChange: any) => (
          <div className="space-y-4">
            <label className="block text-sm font-medium mb-2">
              آیتم‌های سفارش خرید
            </label>
            <div className="text-sm text-gray-500 mb-4">
              از کامپوننت PurchaseOrderItems استفاده شود
            </div>
          </div>
        ),
      },
    ],
    validation: createPurchaseOrderSchema,
    layout: {
      columns: 1,
      gap: 4,
    },
  };
};
