"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { Button } from "ndui-ahrom";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await fetch("/api/my-orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      NEW: "جدید",
      PENDING_PAYMENT: "در انتظار پرداخت",
      PAID: "پرداخت شده",
      PREPARING: "در حال آماده‌سازی",
      SHIPPED: "ارسال شده",
      COMPLETED: "تکمیل شده",
      CANCELED: "لغو شده",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: "bg-blue-100 text-blue-800",
      PENDING_PAYMENT: "bg-yellow-100 text-yellow-800",
      PAID: "bg-green-100 text-green-800",
      PREPARING: "bg-purple-100 text-purple-800",
      SHIPPED: "bg-indigo-100 text-indigo-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">سفارشات من</h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <DIcon
            icon="fa-shopping-bag"
            cdi={false}
            classCustom="text-6xl text-gray-300 mb-4"
          />
          <p className="text-gray-500 mb-4">شما هنوز سفارشی ثبت نکرده‌اید</p>
          <Link href="/shop/products">
            <Button>
              <DIcon icon="fa-shopping-cart" cdi={false} classCustom="ml-2" />
              مشاهده محصولات
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">سفارش #{order.id}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("fa-IR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-500">مبلغ کل</p>
                  <p className="font-semibold">
                    {order.total.toLocaleString("fa-IR")} تومان
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">هزینه ارسال</p>
                  <p className="font-semibold">
                    {order.shippingCost?.toLocaleString("fa-IR") || "0"} تومان
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">روش پرداخت</p>
                  <p className="font-semibold">
                    {order.paymentMethod === "ONLINE_GATEWAY"
                      ? "درگاه آنلاین"
                      : order.paymentMethod === "COD"
                      ? "پرداخت در محل"
                      : order.paymentMethod}
                  </p>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">آیتم‌های سفارش:</p>
                  <div className="space-y-2">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>
                          {item.product?.name || "محصول"} × {item.quantity}
                        </span>
                        <span className="font-medium">
                          {item.total.toLocaleString("fa-IR")} تومان
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {order.shippingAddress && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm font-medium mb-1">آدرس ارسال:</p>
                  <p className="text-sm text-gray-700">
                    {order.shippingAddress}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Link href={`/panel/orders/${order.id}`}>
                  <Button size="sm" variant="ghost">
                    <DIcon icon="fa-eye" cdi={false} classCustom="ml-2" />
                    جزئیات
                  </Button>
                </Link>
                {order.status === "PENDING_PAYMENT" && (
                  <Button size="sm">
                    <DIcon
                      icon="fa-credit-card"
                      cdi={false}
                      classCustom="ml-2"
                    />
                    پرداخت
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
