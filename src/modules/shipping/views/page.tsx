"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { Button, Input } from "ndui-ahrom";
import { useEffect, useState } from "react";

export default function ShippingMethodsView() {
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "FIXED",
    cost: 0,
    isActive: true,
  });

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    try {
      const response = await fetch("/api/shipping");
      if (response.ok) {
        const data = await response.json();
        setMethods(data.data || []);
      }
    } catch (error) {
      console.error("Error loading shipping methods:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("روش ارسال با موفقیت ایجاد شد");
        setShowForm(false);
        setFormData({ name: "", type: "FIXED", cost: 0, isActive: true });
        loadMethods();
      } else {
        alert("خطا در ذخیره روش ارسال");
      }
    } catch (error) {
      console.error("Error submitting:", error);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">روش‌های ارسال</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <DIcon icon="fa-plus" cdi={false} classCustom="ml-2" />
            افزودن روش جدید
          </Button>
        )}
      </div>

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold">افزودن روش ارسال جدید</h2>

          <div>
            <label className="block text-sm font-medium mb-2">نام روش *</label>
            <Input
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="مثال: پست پیشتاز"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">نوع *</label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            >
              <option value="FIXED">مبلغ ثابت</option>
              <option value="BY_WEIGHT">بر اساس وزن</option>
              <option value="BY_CART_VALUE">بر اساس مبلغ سبد</option>
              <option value="BY_DISTANCE">بر اساس مسافت</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              هزینه (تومان) *
            </label>
            <Input
              name="cost"
              type="number"
              value={formData.cost}
              onChange={(e) =>
                setFormData({ ...formData, cost: parseFloat(e.target.value) })
              }
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-4 h-4"
            />
            <label className="text-sm font-medium">فعال</label>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowForm(false)}
            >
              انصراف
            </Button>
            <Button type="submit">ذخیره</Button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  نام
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  نوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  هزینه
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  وضعیت
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {methods.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <p className="text-gray-500">هیچ روش ارسالی تعریف نشده است</p>
                  </td>
                </tr>
              ) : (
                methods.map((method) => (
                  <tr key={method.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium">{method.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{method.type}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">
                        {method.cost.toLocaleString("fa-IR")} تومان
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          method.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {method.isActive ? "فعال" : "غیرفعال"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

