"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { useWarehouse } from "@/modules/warehouses/hooks/useWarehouse";
import { Button, Input } from "ndui-ahrom";
import { useEffect, useState } from "react";

export default function WarehousesPage() {
  const { getAll, create, update, remove, loading } = useWarehouse();
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    const result = await getAll({ page: 1, limit: 100 });
    setWarehouses(result.data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingWarehouse) {
        await update(editingWarehouse.id, formData);
        alert("انبار با موفقیت به‌روزرسانی شد");
      } else {
        await create(formData);
        alert("انبار با موفقیت ایجاد شد");
      }
      setShowForm(false);
      setEditingWarehouse(null);
      setFormData({ name: "", address: "", description: "", isActive: true });
      loadWarehouses();
    } catch (error) {
      console.error("Error submitting warehouse:", error);
    }
  };

  const handleEdit = (warehouse: any) => {
    setEditingWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      address: warehouse.address || "",
      description: warehouse.description || "",
      isActive: warehouse.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این انبار اطمینان دارید؟")) return;

    try {
      await remove(id);
      alert("انبار با موفقیت حذف شد");
      loadWarehouses();
    } catch (error) {
      console.error("Error deleting warehouse:", error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingWarehouse(null);
    setFormData({ name: "", address: "", description: "", isActive: true });
  };

  if (loading && warehouses.length === 0) return <Loading />;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">مدیریت انبارها</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <DIcon icon="fa-plus" cdi={false} classCustom="ml-2" />
            افزودن انبار جدید
          </Button>
        )}
      </div>

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold">
            {editingWarehouse ? "ویرایش انبار" : "افزودن انبار جدید"}
          </h2>

          <div>
            <label className="block text-sm font-medium mb-2">
              نام انبار *
            </label>
            <Input
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="مثال: انبار مرکزی"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">آدرس</label>
            <Input
              name="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="آدرس انبار"
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
            <Button type="button" variant="ghost" onClick={handleCancel}>
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
                  آدرس
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  توضیحات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  وضعیت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {warehouses.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <DIcon
                      icon="fa-warehouse"
                      cdi={false}
                      classCustom="text-6xl text-gray-300 mb-4"
                    />
                    <p>هیچ انباری تعریف نشده است</p>
                  </td>
                </tr>
              ) : (
                warehouses.map((warehouse) => (
                  <tr key={warehouse.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium">{warehouse.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {warehouse.address || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {warehouse.description || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          warehouse.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {warehouse.isActive ? "فعال" : "غیرفعال"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(warehouse)}
                        >
                          <DIcon icon="fa-edit" cdi={false} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(warehouse.id)}
                          className="text-red-600"
                        >
                          <DIcon icon="fa-trash" cdi={false} />
                        </Button>
                      </div>
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
