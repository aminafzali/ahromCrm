"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { Button } from "ndui-ahrom";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OrdersView() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await fetch("/api/orders");
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
        <h1 className="text-2xl font-bold">سفارشات مشتریان</h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <DIcon
            icon="fa-shopping-bag"
            cdi={false}
            classCustom="text-6xl text-gray-300 mb-4"
          />
          <p className="text-gray-500">هیچ سفارشی یافت نشد</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  شناسه
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  مشتری
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  مبلغ کل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  وضعیت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  تاریخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium">#{order.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p>{order.workspaceUser?.displayName || "نامشخص"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold">
                      {order.total.toLocaleString("fa-IR")} تومان
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-sm ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/orders/${order.id}`}>
                      <Button size="sm" variant="ghost">
                        <DIcon icon="fa-eye" cdi={false} />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

