import { FormConfig } from "@/@Client/types/form";
import { columnsForSelect as brandColumns } from "@/modules/brands/data/table";
import { columnsForSelect as categoryColumns } from "@/modules/categories/data/table";
import { createProductSchema } from "../validation/schema";

export const getProductFormConfig = (data?: Map<string, any>): FormConfig => {
  const userGroups = data?.get("userGroups") || [];

  return {
    fields: [
      {
        name: "name",
        label: "نام محصول",
        type: "text",
        placeholder: "نام محصول را وارد کنید",
        required: true,
      },
      {
        name: "price",
        label: "قیمت",
        type: "number",
        placeholder: "قیمت محصول را وارد کنید",
        required: true,
      },
      {
        name: "stock",
        label: "موجودی",
        type: "number",
        placeholder: "موجودی محصول را وارد کنید",
        required: true,
      },
      {
        name: "brand",
        label: "برند",
        type: "dataTable",
        data: data?.get("brands") || [],
        columns: brandColumns,
      },
      {
        name: "category",
        label: "دسته‌بندی",
        type: "dataTable",
        data: data?.get("categories") || [],
        columns: categoryColumns,
      },
      {
        name: "description",
        label: "توضیحات",
        type: "textarea",
        placeholder: "توضیحات محصول را وارد کنید",
      },
      // Visibility Settings
      {
        name: "isPublicVisible",
        label: "نمایش عمومی در فروشگاه",
        type: "checkbox",
        defaultValue: false,
      },
      {
        name: "isCustomerPanelVisible",
        label: "نمایش در پنل مشتری",
        type: "checkbox",
        defaultValue: false,
      },
      {
        name: "onlinePurchaseEnabled",
        label: "فعال‌سازی خرید آنلاین",
        type: "checkbox",
        defaultValue: false,
      },
      {
        name: "isActive",
        label: "فعال",
        type: "checkbox",
        defaultValue: true,
      },
      // Payment Options Section
      {
        name: "paymentOptions",
        label: "روش‌های پرداخت مجاز",
        type: "multiSelect",
        options: [
          { value: "ONLINE_GATEWAY", label: "درگاه پرداخت آنلاین" },
          { value: "COD", label: "پرداخت در محل" },
          { value: "CASH", label: "نقدی" },
          { value: "CARD", label: "کارت به کارت" },
          { value: "INSTALLMENT", label: "قسطی" },
          { value: "CHEQUE", label: "چک" },
        ],
        defaultValue: [],
      },
      // User Group Visibility
      ...(userGroups.length > 0
        ? [
            {
              name: "visibilityByGroup",
              label: "تنظیمات نمایش بر اساس گروه کاربری",
              type: "custom" as const,
              render: (field: any, value: any, onChange: any) => (
                <div className="space-y-2">
                  <label className="block text-sm font-medium mb-2">
                    دسترسی گروه‌های کاربری
                  </label>
                  {userGroups.map((group: any) => {
                    const groupVisibility = value?.find(
                      (v: any) => v.userGroupId === group.id
                    ) || { canView: false, canBuy: false };

                    return (
                      <div
                        key={group.id}
                        className="flex items-center gap-4 p-3 border rounded"
                      >
                        <span className="flex-1 font-medium">{group.name}</span>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={groupVisibility.canView}
                            onChange={(e) => {
                              const updated =
                                value?.filter(
                                  (v: any) => v.userGroupId !== group.id
                                ) || [];
                              if (e.target.checked || groupVisibility.canBuy) {
                                updated.push({
                                  userGroupId: group.id,
                                  canView: e.target.checked,
                                  canBuy: groupVisibility.canBuy,
                                });
                              }
                              onChange(updated);
                            }}
                            className="checkbox"
                          />
                          <span className="text-sm">مشاهده</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={groupVisibility.canBuy}
                            onChange={(e) => {
                              const updated =
                                value?.filter(
                                  (v: any) => v.userGroupId !== group.id
                                ) || [];
                              if (e.target.checked || groupVisibility.canView) {
                                updated.push({
                                  userGroupId: group.id,
                                  canView: groupVisibility.canView,
                                  canBuy: e.target.checked,
                                });
                              }
                              onChange(updated);
                            }}
                            className="checkbox"
                          />
                          <span className="text-sm">خرید</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              ),
            },
          ]
        : []),
    ],
    validation: createProductSchema,
    layout: {
      columns: 2,
      gap: 4,
    },
  };
};
