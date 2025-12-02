"use client";

import { Button, Input } from "ndui-ahrom";
import { useState } from "react";

interface PriceListFormProps {
  productId: number;
  userGroups: Array<{ id: number; name: string }>;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
}

export default function PriceListForm({
  productId,
  userGroups,
  onSubmit,
  onCancel,
  initialData,
}: PriceListFormProps) {
  const [formData, setFormData] = useState({
    userGroupId: initialData?.userGroupId || "",
    price: initialData?.price || 0,
    discountPrice: initialData?.discountPrice || "",
    discountPercent: initialData?.discountPercent || "",
    discountStartDate: initialData?.discountStartDate
      ? new Date(initialData.discountStartDate).toISOString().split("T")[0]
      : "",
    discountEndDate: initialData?.discountEndDate
      ? new Date(initialData.discountEndDate).toISOString().split("T")[0]
      : "",
    isActive: initialData?.isActive ?? true,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        productId,
        userGroupId: parseInt(String(formData.userGroupId)),
        price: parseFloat(String(formData.price)),
        discountPrice: formData.discountPrice
          ? parseFloat(String(formData.discountPrice))
          : undefined,
        discountPercent: formData.discountPercent
          ? parseFloat(String(formData.discountPercent))
          : undefined,
        discountStartDate: formData.discountStartDate
          ? new Date(formData.discountStartDate)
          : undefined,
        discountEndDate: formData.discountEndDate
          ? new Date(formData.discountEndDate)
          : undefined,
        isActive: formData.isActive,
      };

      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting price list:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = () => {
    if (formData.price && formData.discountPrice) {
      const price = parseFloat(String(formData.price));
      const discountPrice = parseFloat(String(formData.discountPrice));
      const percent = ((price - discountPrice) / price) * 100;
      setFormData({ ...formData, discountPercent: percent.toFixed(2) });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* گروه کاربری */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h3 className="text-lg font-semibold">انتخاب گروه کاربری</h3>

        <div>
          <label className="block text-sm font-medium mb-2">
            گروه کاربری *
          </label>
          <select
            value={formData.userGroupId}
            onChange={(e) =>
              setFormData({ ...formData, userGroupId: e.target.value })
            }
            required
            disabled={!!initialData}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">انتخاب کنید...</option>
            {userGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          {initialData && (
            <p className="text-sm text-gray-500 mt-1">
              گروه کاربری بعد از ایجاد قابل تغییر نیست
            </p>
          )}
        </div>
      </div>

      {/* قیمت */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h3 className="text-lg font-semibold">قیمت</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              قیمت اصلی (تومان) *
            </label>
            <Input
              name="price"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: parseFloat(e.target.value) || 0,
                })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              قیمت با تخفیف (تومان)
            </label>
            <Input
              name="discountPrice"
              type="number"
              value={formData.discountPrice}
              onChange={(e) =>
                setFormData({ ...formData, discountPrice: e.target.value })
              }
              onBlur={calculateDiscount}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">درصد تخفیف</label>
            <Input
              name="discountPercent"
              type="number"
              value={formData.discountPercent}
              onChange={(e) =>
                setFormData({ ...formData, discountPercent: e.target.value })
              }
              disabled
              className="bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* بازه تخفیف */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h3 className="text-lg font-semibold">بازه زمانی تخفیف (اختیاری)</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">تاریخ شروع</label>
            <Input
              name="discountStartDate"
              type="date"
              value={formData.discountStartDate}
              onChange={(e) =>
                setFormData({ ...formData, discountStartDate: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              تاریخ پایان
            </label>
            <Input
              name="discountEndDate"
              type="date"
              value={formData.discountEndDate}
              onChange={(e) =>
                setFormData({ ...formData, discountEndDate: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* وضعیت */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
            className="w-4 h-4"
          />
          <label className="text-sm font-medium">فعال</label>
        </div>
      </div>

      {/* دکمه‌ها */}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
        >
          انصراف
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "در حال ذخیره..." : "ذخیره قیمت"}
        </Button>
      </div>
    </form>
  );
}
