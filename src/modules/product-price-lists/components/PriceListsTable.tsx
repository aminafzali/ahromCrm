"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { Button } from "ndui-ahrom";

interface PriceList {
  id: number;
  price: number;
  discountPrice?: number;
  discountPercent?: number;
  discountStartDate?: Date;
  discountEndDate?: Date;
  isActive: boolean;
  userGroup: {
    id: number;
    name: string;
  };
}

interface PriceListsTableProps {
  priceLists: PriceList[];
  onEdit: (priceList: PriceList) => void;
  onDelete: (id: number) => void;
  loading?: boolean;
}

export default function PriceListsTable({
  priceLists,
  onEdit,
  onDelete,
  loading,
}: PriceListsTableProps) {
  const isDiscountActive = (priceList: PriceList) => {
    if (!priceList.discountPrice) return false;

    const now = new Date();
    const start = priceList.discountStartDate
      ? new Date(priceList.discountStartDate)
      : null;
    const end = priceList.discountEndDate ? new Date(priceList.discountEndDate) : null;

    if (start && start > now) return false;
    if (end && end < now) return false;

    return true;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <p className="text-gray-500">در حال بارگذاری...</p>
      </div>
    );
  }

  if (priceLists.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <DIcon
          icon="fa-tags"
          cdi={false}
          classCustom="text-6xl text-gray-300 mb-4"
        />
        <p className="text-gray-500">
          هیچ قیمت گروهی برای این محصول تعریف نشده است
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              گروه کاربری
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              قیمت اصلی
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              تخفیف
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              قیمت نهایی
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
          {priceLists.map((priceList) => {
            const hasActiveDiscount = isDiscountActive(priceList);
            const finalPrice = hasActiveDiscount
              ? priceList.discountPrice!
              : priceList.price;

            return (
              <tr key={priceList.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium">{priceList.userGroup.name}</p>
                </td>
                <td className="px-6 py-4">
                  <p className={hasActiveDiscount ? "line-through text-gray-400" : ""}>
                    {priceList.price.toLocaleString("fa-IR")} تومان
                  </p>
                </td>
                <td className="px-6 py-4">
                  {priceList.discountPrice && (
                    <div>
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          hasActiveDiscount
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {priceList.discountPercent?.toFixed(0)}%
                      </span>
                      {!hasActiveDiscount && (
                        <p className="text-xs text-gray-500 mt-1">منقضی شده</p>
                      )}
                    </div>
                  )}
                  {!priceList.discountPrice && (
                    <p className="text-gray-400">-</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-green-600">
                    {finalPrice.toLocaleString("fa-IR")} تومان
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      priceList.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {priceList.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(priceList)}
                    >
                      <DIcon icon="fa-edit" cdi={false} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(priceList.id)}
                      className="text-red-600"
                    >
                      <DIcon icon="fa-trash" cdi={false} />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

