"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { Button, Input } from "ndui-ahrom";
import { useState } from "react";

interface PurchaseOrderItem {
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PurchaseOrderItemsProps {
  value: PurchaseOrderItem[];
  onChange: (items: PurchaseOrderItem[]) => void;
  products: any[];
}

export default function PurchaseOrderItems({
  value = [],
  onChange,
  products = [],
}: PurchaseOrderItemsProps) {
  const [items, setItems] = useState<PurchaseOrderItem[]>(value);

  const addItem = () => {
    const newItem: PurchaseOrderItem = {
      productId: 0,
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    onChange(updatedItems);
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    onChange(updatedItems);
  };

  const updateItem = (
    index: number,
    field: keyof PurchaseOrderItem,
    value: any
  ) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // محاسبه خودکار total
    if (field === "quantity" || field === "unitPrice") {
      updatedItems[index].total =
        updatedItems[index].quantity * updatedItems[index].unitPrice;
    }

    // اگر محصول انتخاب شد، قیمت آن را بگیر
    if (field === "productId") {
      const product = products.find((p) => p.id === value);
      if (product) {
        updatedItems[index].productName = product.name;
        updatedItems[index].unitPrice = product.price;
        updatedItems[index].total =
          updatedItems[index].quantity * product.price;
      }
    }

    setItems(updatedItems);
    onChange(updatedItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">آیتم‌های سفارش خرید</h3>
        <Button size="sm" onClick={addItem}>
          <DIcon icon="fa-plus" cdi={false} classCustom="ml-2" />
          افزودن آیتم
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
          هیچ آیتمی اضافه نشده است. روی دکمه &quot;افزودن آیتم&quot; کلیک کنید.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-3 p-4 bg-gray-50 rounded-lg border"
            >
              <div className="col-span-4">
                <label className="block text-sm font-medium mb-1">محصول</label>
                <select
                  value={item.productId}
                  onChange={(e) =>
                    updateItem(index, "productId", parseInt(e.target.value))
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value={0}>انتخاب محصول</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">تعداد</label>
                <Input
                  name={`quantity-${index}`}
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, "quantity", parseInt(e.target.value) || 1)
                  }
                  min="1"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">
                  قیمت واحد
                </label>
                <Input
                  name={`unitPrice-${index}`}
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "unitPrice",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  min="0"
                  required
                />
              </div>

              <div className="col-span-3">
                <label className="block text-sm font-medium mb-1">جمع</label>
                <Input
                  name={`total-${index}`}
                  type="number"
                  value={item.total}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div className="col-span-1 flex items-end">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeItem(index)}
                  className="text-red-600"
                >
                  <DIcon icon="fa-trash" cdi={false} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="flex justify-end p-4 bg-blue-50 rounded-lg">
          <div className="text-lg font-semibold">
            جمع کل: {calculateTotal().toLocaleString("fa-IR")} تومان
          </div>
        </div>
      )}
    </div>
  );
}
