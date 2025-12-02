"use client";

import Loading from "@/@Client/Components/common/Loading";
import DIcon from "@/@Client/Components/common/DIcon";
import { Button } from "ndui-ahrom";
import { useEffect, useState } from "react";
import { useToast } from "@/@Client/hooks/useToast";

interface LowStockAlert {
  productId: number;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  currentStock: number;
  minimumStock: number;
  status: "critical" | "warning" | "ok";
}

interface StockHistory {
  id: number;
  productId: number;
  warehouseId: number;
  quantity: number;
  movementType: string;
  createdAt: string;
  description?: string;
  product: { id: number; name: string };
  warehouse: { id: number; name: string };
}

interface InventorySummary {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
  recentMovements: StockHistory[];
  lowStockAlerts: LowStockAlert[];
}

export default function InventoryPage() {
  const toast = useToast();
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingAlerts, setSendingAlerts] = useState(false);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const response = await fetch("/api/inventory/summary");
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      } else {
        toast.error("خطا در بارگذاری اطلاعات موجودی");
      }
    } catch (error) {
      console.error("Error loading inventory summary:", error);
      toast.error("خطا در بارگذاری اطلاعات موجودی");
    } finally {
      setLoading(false);
    }
  };

  const sendAlerts = async () => {
    setSendingAlerts(true);
    try {
      const response = await fetch("/api/inventory/alerts", {
        method: "POST",
      });
      if (response.ok) {
        toast.success("هشدارها با موفقیت ارسال شدند");
      } else {
        toast.error("خطا در ارسال هشدارها");
      }
    } catch (error) {
      console.error("Error sending alerts:", error);
      toast.error("خطا در ارسال هشدارها");
    } finally {
      setSendingAlerts(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-green-100 text-green-800 border-green-300";
    }
  };

  const getMovementTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      PURCHASE: "خرید",
      SALE: "فروش",
      RETURN: "مرجوعی",
      ADJUSTMENT: "تعدیل",
      TRANSFER_IN: "حواله ورودی",
      TRANSFER_OUT: "حواله خروجی",
    };
    return labels[type] || type;
  };

  if (loading) return <Loading />;

  return (
    <>
      <toast.ToastContainer />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">مدیریت موجودی</h1>
          <Button
            onClick={sendAlerts}
            disabled={sendingAlerts}
            icon={<DIcon icon="fa-bell" cdi={false} classCustom="ml-2" />}
          >
            ارسال هشدارها به ادمین‌ها
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">تعداد کل محصولات</p>
                <p className="text-2xl font-bold mt-1">
                  {summary?.totalProducts || 0}
                </p>
              </div>
              <DIcon
                icon="fa-box"
                cdi={false}
                classCustom="text-4xl text-blue-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">موجودی پایین</p>
                <p className="text-2xl font-bold mt-1 text-yellow-600">
                  {summary?.lowStockProducts || 0}
                </p>
              </div>
              <DIcon
                icon="fa-exclamation-triangle"
                cdi={false}
                classCustom="text-4xl text-yellow-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">موجودی تمام شده</p>
                <p className="text-2xl font-bold mt-1 text-red-600">
                  {summary?.outOfStockProducts || 0}
                </p>
              </div>
              <DIcon
                icon="fa-times-circle"
                cdi={false}
                classCustom="text-4xl text-red-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">ارزش کل موجودی</p>
                <p className="text-2xl font-bold mt-1">
                  {(summary?.totalValue || 0).toLocaleString("fa-IR")}
                </p>
                <p className="text-xs text-gray-500 mt-1">تومان</p>
              </div>
              <DIcon
                icon="fa-money-bill-wave"
                cdi={false}
                classCustom="text-4xl text-green-500"
              />
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {summary?.lowStockAlerts && summary.lowStockAlerts.length > 0 && (
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <DIcon icon="fa-bell" cdi={false} />
                هشدارهای موجودی
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {summary.lowStockAlerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${getStatusColor(
                      alert.status
                    )}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{alert.productName}</p>
                        <p className="text-sm mt-1">
                          انبار: {alert.warehouseName}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-lg font-bold">
                          {alert.currentStock} عدد
                        </p>
                        <p className="text-sm">
                          حداقل: {alert.minimumStock} عدد
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Movements */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <DIcon icon="fa-history" cdi={false} />
              آخرین حرکات موجودی
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    محصول
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    انبار
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    نوع حرکت
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    مقدار
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    توضیحات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    تاریخ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {summary?.recentMovements && summary.recentMovements.length > 0 ? (
                  summary.recentMovements.map((movement) => (
                    <tr key={movement.id}>
                      <td className="px-6 py-4">{movement.product?.name}</td>
                      <td className="px-6 py-4">{movement.warehouse?.name}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            movement.quantity > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {getMovementTypeLabel(movement.movementType)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-medium ${
                            movement.quantity > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {movement.quantity > 0 ? "+" : ""}
                          {movement.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {movement.description || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(movement.createdAt).toLocaleDateString("fa-IR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      هیچ حرکتی ثبت نشده است
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

