"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { Button } from "ndui-ahrom";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params?.id;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrderDetails(Number(id));
    }
  }, [id]);

  const loadOrderDetails = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data.data);
      } else {
        console.error("Failed to fetch order details:", response.statusText);
      }
    } catch (error) {
      console.error("Error loading order details:", error);
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
  if (!order)
    return <div className="p-6 text-center text-gray-500">سفارش یافت نشد.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">جزئیات سفارش #{order.id}</h1>
        <Link href="/dashboard/orders">
          <Button variant="ghost" size="sm">
            <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
            بازگشت به سفارشات
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">تاریخ ثبت</p>
            <p className="font-semibold">
              {new Date(order.createdAt).toLocaleDateString("fa-IR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
              order.status
            )}`}
          >
            {getStatusLabel(order.status)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t pt-4">
          <div>
            <p className="text-sm text-gray-500">مبلغ کل</p>
            <p className="font-semibold text-lg">
              {order.total.toLocaleString("fa-IR")} تومان
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">هزینه ارسال</p>
            <p className="font-semibold text-lg">
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
          {order.paymentStatus && (
            <div>
              <p className="text-sm text-gray-500">وضعیت پرداخت</p>
              <p className="font-semibold">{order.paymentStatus}</p>
            </div>
          )}
        </div>
      </div>

      {order.workspaceUser && (
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h3 className="text-lg font-semibold">مشتری</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">نام</p>
              <p className="font-medium">{order.workspaceUser.displayName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">شماره تماس</p>
              <p className="font-medium">{order.workspaceUser.user?.phone}</p>
            </div>
          </div>
        </div>
      )}

      {order.items && order.items.length > 0 && (
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h3 className="text-lg font-semibold">آیتم‌های سفارش</h3>
          {order.items.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                  <DIcon
                    icon="fa-box"
                    cdi={false}
                    classCustom="text-gray-400"
                  />
                </div>
                <div>
                  <p className="font-medium">{item.product?.name || "محصول"}</p>
                  <p className="text-sm text-gray-500">
                    تعداد: {item.quantity} ×{" "}
                    {item.unitPrice.toLocaleString("fa-IR")} تومان
                  </p>
                </div>
              </div>
              <span className="font-semibold">
                {item.total.toLocaleString("fa-IR")} تومان
              </span>
            </div>
          ))}
        </div>
      )}

      {order.shippingAddress && (
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h3 className="text-lg font-semibold">آدرس ارسال</h3>
          <p className="text-gray-700">{order.shippingAddress}</p>
          {order.shippingMethod && (
            <p className="text-sm text-gray-500">
              روش ارسال: {order.shippingMethod.name}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
