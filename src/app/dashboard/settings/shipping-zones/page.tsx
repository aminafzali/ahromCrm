"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { Button, Input } from "ndui-ahrom";
import { useEffect, useState } from "react";

export default function ShippingZonesPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      // فعلاً placeholder - باید API ایجاد شود
      setZones([]);
    } catch (error) {
      console.error("Error loading zones:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert("این قابلیت به‌زودی اضافه خواهد شد");
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">مناطق ارسال</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <DIcon icon="fa-plus" cdi={false} classCustom="ml-2" />
            افزودن منطقه جدید
          </Button>
        )}
      </div>

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold">افزودن منطقه ارسال جدید</h2>

          <div>
            <label className="block text-sm font-medium mb-2">نام منطقه *</label>
            <Input
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="مثال: تهران"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">توضیحات</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder="توضیحات اختیاری"
            />
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
        <div className="bg-white rounded-lg border p-12 text-center">
          <DIcon
            icon="fa-map-location-dot"
            cdi={false}
            classCustom="text-6xl text-gray-300 mb-4"
          />
          <p className="text-gray-500 mb-4">
            این قابلیت به‌زودی اضافه خواهد شد
          </p>
        </div>
      )}
    </div>
  );
}

