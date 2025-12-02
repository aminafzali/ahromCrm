"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CartItem = {
  productId: number;
  quantity: number;
};

type Product = {
  id: number;
  name: string;
  price: number;
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Record<number, Product>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem("cart") : null;
    const parsed: CartItem[] = raw ? JSON.parse(raw) : [];
    setItems(parsed);
  }, []);

  useEffect(() => {
    async function loadProducts() {
      if (items.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const ids = Array.from(new Set(items.map((i) => i.productId)));
        const res = await fetch("/api/products?ids=" + ids.join(","));
        if (!res.ok) {
          throw new Error("Failed to load products");
        }
        const data = await res.json();
        const map: Record<number, Product> = {};
        (data.data || data).forEach((p: any) => {
          map[p.id] = { id: p.id, name: p.name, price: p.price };
        });
        setProducts(map);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [items]);

  const removeItem = (productId: number) => {
    const next = items.filter((i) => i.productId !== productId);
    setItems(next);
    localStorage.setItem("cart", JSON.stringify(next));
  };

  const total = items.reduce((sum, item) => {
    const p = products[item.productId];
    return sum + (p ? p.price * item.quantity : 0);
  }, 0);

  if (loading) {
    return <div className="p-4">در حال بارگذاری سبد خرید...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="p-4">
        <p>سبد خرید خالی است.</p>
        <Link href="../" className="text-blue-500">
          بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-4">سبد خرید</h1>

      <div className="space-y-3">
        {items.map((item) => {
          const product = products[item.productId];
          return (
            <div
              key={item.productId}
              className="flex items-center justify-between border rounded p-3"
            >
              <div>
                <div className="font-semibold">
                  {product ? product.name : `محصول #${item.productId}`}
                </div>
                <div className="text-sm text-gray-600">
                  تعداد: {item.quantity}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="font-bold">
                  {product
                    ? (product.price * item.quantity).toLocaleString("fa-IR")
                    : 0}{" "}
                  تومان
                </div>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-red-500 text-sm"
                >
                  حذف
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t pt-4 mt-4">
        <span className="font-semibold">جمع کل:</span>
        <span className="font-bold text-green-600">
          {total.toLocaleString("fa-IR")} تومان
        </span>
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href="../"
          className="px-4 py-2 rounded border border-gray-300 text-gray-700"
        >
          ادامه خرید
        </Link>
        <Link
          href="../checkout"
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          ادامه به ثبت سفارش
        </Link>
      </div>
    </div>
  );
}
