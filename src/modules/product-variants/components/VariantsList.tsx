"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { Button } from "ndui-ahrom";

interface Variant {
  id: number;
  name?: string;
  sku?: string;
  price: number;
  stock: number;
  attributes: Record<string, any>;
  isActive: boolean;
}

interface VariantsListProps {
  variants: Variant[];
  onEdit: (variant: Variant) => void;
  onDelete: (id: number) => void;
  loading?: boolean;
}

export default function VariantsList({
  variants,
  onEdit,
  onDelete,
  loading,
}: VariantsListProps) {
  const renderAttributes = (attributes: Record<string, any>) => {
    return Object.entries(attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(" | ");
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <p className="text-gray-500">در حال بارگذاری...</p>
      </div>
    );
  }

  if (variants.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <DIcon
          icon="fa-box-open"
          cdi={false}
          classCustom="text-6xl text-gray-300 mb-4"
        />
        <p className="text-gray-500">هیچ واریانتی برای این محصول تعریف نشده است</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              نام / SKU
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              ویژگی‌ها
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              قیمت
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              موجودی
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              وضعیت
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              عملیات
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {variants.map((variant) => (
            <tr key={variant.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div>
                  {variant.name && (
                    <p className="font-medium">{variant.name}</p>
                  )}
                  {variant.sku && (
                    <p className="text-sm text-gray-500">{variant.sku}</p>
                  )}
                  {!variant.name && !variant.sku && (
                    <p className="text-gray-400">بدون نام</p>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-600">
                  {renderAttributes(variant.attributes)}
                </p>
              </td>
              <td className="px-6 py-4">
                <p className="font-medium">
                  {variant.price.toLocaleString("fa-IR")} تومان
                </p>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    variant.stock > 10
                      ? "bg-green-100 text-green-800"
                      : variant.stock > 0
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {variant.stock} عدد
                </span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    variant.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {variant.isActive ? "فعال" : "غیرفعال"}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(variant)}
                  >
                    <DIcon icon="fa-edit" cdi={false} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(variant.id)}
                    className="text-red-600"
                  >
                    <DIcon icon="fa-trash" cdi={false} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

