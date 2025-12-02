"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import VariantForm from "@/modules/product-variants/components/VariantForm";
import { Button } from "ndui-ahrom";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductVariantsPage() {
  const params = useParams();
  const productId = params?.id ? Number(params.id) : 0;

  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any>(null);

  useEffect(() => {
    if (productId) {
      loadVariants();
    }
  }, [productId]);

  const loadVariants = async () => {
    try {
      const response = await fetch(
        `/api/product-variants?productId=${productId}`
      );
      if (response.ok) {
        const data = await response.json();
        setVariants(data.data || []);
      }
    } catch (error) {
      console.error("Error loading variants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const url = editingVariant
        ? `/api/product-variants/${editingVariant.id}`
        : "/api/product-variants";
      const method = editingVariant ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, productId }),
      });

      if (response.ok) {
        alert("واریانت با موفقیت ذخیره شد");
        setShowForm(false);
        setEditingVariant(null);
        loadVariants();
      } else {
        alert("خطا در ذخیره واریانت");
      }
    } catch (error) {
      console.error("Error saving variant:", error);
      alert("خطا در ذخیره واریانت");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این واریانت اطمینان دارید؟")) return;

    try {
      const response = await fetch(`/api/product-variants/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("واریانت با موفقیت حذف شد");
        loadVariants();
      } else {
        alert("خطا در حذف واریانت");
      }
    } catch (error) {
      console.error("Error deleting variant:", error);
      alert("خطا در حذف واریانت");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">واریانت‌های محصول</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <DIcon icon="fa-plus" cdi={false} classCustom="ml-2" />
            افزودن واریانت جدید
          </Button>
        )}
      </div>

      {showForm ? (
        <VariantForm
          productId={productId}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingVariant(null);
          }}
          initialData={editingVariant}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {variants.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg border p-12 text-center">
              <DIcon
                icon="fa-box-open"
                cdi={false}
                classCustom="text-6xl text-gray-300 mb-4"
              />
              <p className="text-gray-500">
                هیچ واریانتی برای این محصول تعریف نشده است
              </p>
            </div>
          ) : (
            variants.map((variant) => (
              <div
                key={variant.id}
                className="bg-white rounded-lg border p-6 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg">{variant.name}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      variant.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {variant.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </div>

                {variant.sku && (
                  <p className="text-sm text-gray-600">SKU: {variant.sku}</p>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm">
                  {variant.price && (
                    <div>
                      <p className="text-gray-500">قیمت</p>
                      <p className="font-medium">
                        {variant.price.toLocaleString("fa-IR")} تومان
                      </p>
                    </div>
                  )}
                  {variant.stock !== null && (
                    <div>
                      <p className="text-gray-500">موجودی</p>
                      <p className="font-medium">{variant.stock}</p>
                    </div>
                  )}
                  {variant.weight && (
                    <div>
                      <p className="text-gray-500">وزن</p>
                      <p className="font-medium">{variant.weight} گرم</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditingVariant(variant);
                      setShowForm(true);
                    }}
                  >
                    <DIcon icon="fa-edit" cdi={false} classCustom="ml-2" />
                    ویرایش
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(variant.id)}
                  >
                    <DIcon icon="fa-trash" cdi={false} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
