"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type CartItem = {
  productId: number;
  quantity: number;
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<CartItem[]>([]);
  const [workspaceUserId, setWorkspaceUserId] = useState<number | "">("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingMethodId, setShippingMethodId] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE_GATEWAY" | "COD">(
    "ONLINE_GATEWAY"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem("cart") : null;
    const parsed: CartItem[] = raw ? JSON.parse(raw) : [];
    if (!parsed.length) {
      router.replace("../cart");
      return;
    }
    setItems(parsed);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!workspaceUserId) {
      setError("شناسه مشتری (workspaceUserId) الزامی است.");
      return;
    }

    if (!items.length) {
      setError("سبد خرید خالی است.");
      return;
    }

    setSubmitting(true);
    try {
      const body: any = {
        workspaceUserId: Number(workspaceUserId),
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        shippingAddress: shippingAddress || undefined,
        paymentMethod,
      };
      if (shippingMethodId) {
        body.shippingMethodId = Number(shippingMethodId);
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "خطا در ثبت سفارش");
      }

      const order = await res.json();
      // پاک کردن سبد خرید
      localStorage.removeItem("cart");
      router.replace(`../../dashboard/orders/${order.id}`);
    } catch (err: any) {
      setError(err.message || "خطای نامشخص");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-4">ثبت سفارش</h1>

      {error && (
        <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            شناسه مشتری (workspaceUserId)
          </label>
          <input
            type="number"
            value={workspaceUserId}
            onChange={(e) =>
              setWorkspaceUserId(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="مثلا 123"
          />
          <p className="text-xs text-gray-500 mt-1">
            فعلاً موقتاً باید این مقدار را دستی وارد کنی (ID مشتری در
            Workspace).
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            آدرس ارسال (اختیاری)
          </label>
          <textarea
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            شناسه روش ارسال (shippingMethodId) - اختیاری
          </label>
          <input
            type="number"
            value={shippingMethodId}
            onChange={(e) =>
              setShippingMethodId(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="اگر تهی باشد، هزینه حمل صفر در نظر گرفته می‌شود"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">روش پرداخت</label>
          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(e.target.value as "ONLINE_GATEWAY" | "COD")
            }
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="ONLINE_GATEWAY">درگاه آنلاین</option>
            <option value="COD">پرداخت در محل (COD)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 px-4 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {submitting ? "در حال ثبت..." : "ثبت نهایی سفارش"}
        </button>
      </form>
    </div>
  );
}
