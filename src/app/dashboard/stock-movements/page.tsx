"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { useEffect, useState } from "react";

export default function StockMovementsPage() {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovements();
  }, []);

  const loadMovements = async () => {
    try {
      const response = await fetch("/api/inventory/history");
      if (response.ok) {
        const data = await response.json();
        setMovements(data.data || []);
      }
    } catch (error) {
      console.error("Error loading movements:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">تاریخچه تغییرات موجودی</h1>

      {movements.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <DIcon
            icon="fa-clock-rotate-left"
            cdi={false}
            classCustom="text-6xl text-gray-300 mb-4"
          />
          <p className="text-gray-500">هیچ تغییری ثبت نشده است</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
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
                  نوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  تعداد
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  تاریخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  توضیحات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {movements.map((movement: any) => (
                <tr key={movement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium">
                      {movement.product?.name || "نامشخص"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p>{movement.warehouse?.name || "نامشخص"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        movement.type === "IN"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {movement.type === "IN" ? "ورود" : "خروج"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold">{movement.quantity}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">
                      {new Date(movement.createdAt).toLocaleDateString("fa-IR")}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">
                      {movement.notes || "-"}
                    </p>
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

