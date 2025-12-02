"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { Button, Input } from "ndui-ahrom";
import { useEffect, useState } from "react";

export default function PaymentGatewaysView() {
  const [gateways, setGateways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    gateway: "",
    merchantId: "",
    isActive: true,
    isDefault: false,
  });

  useEffect(() => {
    loadGateways();
  }, []);

  const loadGateways = async () => {
    try {
      const response = await fetch("/api/payment-gateways");
      if (response.ok) {
        const data = await response.json();
        setGateways(data.data || []);
      }
    } catch (error) {
      console.error("Error loading payment gateways:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/payment-gateways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("درگاه پرداخت با موفقیت ایجاد شد");
        setShowForm(false);
        setFormData({
          name: "",
          gateway: "",
          merchantId: "",
          isActive: true,
          isDefault: false,
        });
        loadGateways();
      } else {
        alert("خطا در ذخیره درگاه پرداخت");
      }
    } catch (error) {
      console.error("Error submitting:", error);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">درگاه‌های پرداخت</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <DIcon icon="fa-plus" cdi={false} classCustom="ml-2" />
            افزودن درگاه جدید
          </Button>
        )}
      </div>

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold">افزودن درگاه پرداخت جدید</h2>

          <div>
            <label className="block text-sm font-medium mb-2">نام نمایشی *</label>
            <Input
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="مثال: پرداخت آنلاین"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">نوع درگاه *</label>
            <select
              value={formData.gateway}
              onChange={(e) =>
                setFormData({ ...formData, gateway: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">انتخاب کنید...</option>
              <option value="ZARINPAL">زرین‌پال</option>
              <option value="MELLAT">بانک ملت</option>
              <option value="SAMAN">بانک سامان</option>
              <option value="PARSIAN">بانک پارسیان</option>
              <option value="PASARGAD">بانک پاسارگاد</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">شناسه پذیرنده *</label>
            <Input
              name="merchantId"
              value={formData.merchantId}
              onChange={(e) =>
                setFormData({ ...formData, merchantId: e.target.value })
              }
              required
              placeholder="Merchant ID"
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) =>
                setFormData({ ...formData, isDefault: e.target.checked })
              }
              className="w-4 h-4"
            />
            <label className="text-sm font-medium">پیش‌فرض</label>
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
                  نوع درگاه
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  وضعیت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  پیش‌فرض
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {gateways.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <p className="text-gray-500">هیچ درگاهی تعریف نشده است</p>
                  </td>
                </tr>
              ) : (
                gateways.map((gateway) => (
                  <tr key={gateway.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium">{gateway.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{gateway.gateway}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          gateway.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {gateway.isActive ? "فعال" : "غیرفعال"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {gateway.isDefault && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          پیش‌فرض
                        </span>
                      )}
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

