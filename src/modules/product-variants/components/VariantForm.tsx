"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { Button, Input } from "ndui-ahrom";
import { useState } from "react";

interface VariantAttribute {
  key: string;
  value: string;
}

interface VariantFormProps {
  productId: number;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
}

export default function VariantForm({
  productId,
  onSubmit,
  onCancel,
  initialData,
}: VariantFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    price: initialData?.price || 0,
    stock: initialData?.stock || 0,
    weight: initialData?.weight || "",
    length: initialData?.length || "",
    width: initialData?.width || "",
    height: initialData?.height || "",
    isActive: initialData?.isActive ?? true,
  });

  const [attributes, setAttributes] = useState<VariantAttribute[]>(
    initialData?.attributes
      ? Object.entries(initialData.attributes).map(([key, value]) => ({
          key,
          value: String(value),
        }))
      : [{ key: "", value: "" }]
  );

  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [loading, setLoading] = useState(false);

  const addAttribute = () => {
    setAttributes([...attributes, { key: "", value: "" }]);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, field: "key" | "value", value: string) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);
  };

  const addImage = () => {
    const url = prompt("آدرس تصویر را وارد کنید:");
    if (url) {
      setImages([...images, url]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // تبدیل attributes به object
      const attributesObj: Record<string, string> = {};
      attributes.forEach((attr) => {
        if (attr.key && attr.value) {
          attributesObj[attr.key] = attr.value;
        }
      });

      const data = {
        productId,
        ...formData,
        price: parseFloat(String(formData.price)),
        stock: parseInt(String(formData.stock)),
        weight: formData.weight ? parseFloat(String(formData.weight)) : undefined,
        length: formData.length ? parseFloat(String(formData.length)) : undefined,
        width: formData.width ? parseFloat(String(formData.width)) : undefined,
        height: formData.height ? parseFloat(String(formData.height)) : undefined,
        attributes: attributesObj,
        images: images.length > 0 ? images : undefined,
      };

      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting variant:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* اطلاعات اصلی */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h3 className="text-lg font-semibold">اطلاعات اصلی</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">نام واریانت</label>
            <Input
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: رنگ قرمز - سایز L"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">کد محصول (SKU)</label>
            <Input
              name="sku"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="PROD-001-RED-L"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">قیمت (تومان)</label>
            <Input
              name="price"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">موجودی</label>
            <Input
              name="stock"
              type="number"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
              }
              required
            />
          </div>
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
      </div>

      {/* ویژگی‌ها */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">ویژگی‌های واریانت</h3>
          <Button type="button" size="sm" onClick={addAttribute}>
            <DIcon icon="fa-plus" cdi={false} classCustom="ml-2" />
            افزودن ویژگی
          </Button>
        </div>

        {attributes.map((attr, index) => (
          <div key={index} className="flex gap-2">
            <Input
              name={`attr-key-${index}`}
              value={attr.key}
              onChange={(e) => updateAttribute(index, "key", e.target.value)}
              placeholder="نام ویژگی (مثلاً: رنگ)"
              className="flex-1"
            />
            <Input
              name={`attr-value-${index}`}
              value={attr.value}
              onChange={(e) => updateAttribute(index, "value", e.target.value)}
              placeholder="مقدار (مثلاً: قرمز)"
              className="flex-1"
            />
            {attributes.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeAttribute(index)}
                className="text-red-600"
              >
                <DIcon icon="fa-trash" cdi={false} />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* ابعاد و وزن */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h3 className="text-lg font-semibold">ابعاد و وزن (برای حمل و نقل)</h3>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">وزن (گرم)</label>
            <Input
              name="weight"
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">طول (سانتی‌متر)</label>
            <Input
              name="length"
              type="number"
              value={formData.length}
              onChange={(e) => setFormData({ ...formData, length: e.target.value })}
              placeholder="30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">عرض (سانتی‌متر)</label>
            <Input
              name="width"
              type="number"
              value={formData.width}
              onChange={(e) => setFormData({ ...formData, width: e.target.value })}
              placeholder="20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">ارتفاع (سانتی‌متر)</label>
            <Input
              name="height"
              type="number"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              placeholder="10"
            />
          </div>
        </div>
      </div>

      {/* تصاویر */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">تصاویر واریانت</h3>
          <Button type="button" size="sm" onClick={addImage}>
            <DIcon icon="fa-image" cdi={false} classCustom="ml-2" />
            افزودن تصویر
          </Button>
        </div>

        {images.length === 0 ? (
          <p className="text-gray-500 text-sm">هیچ تصویری اضافه نشده است</p>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {images.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="w-full h-32 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition"
                >
                  <DIcon icon="fa-trash" cdi={false} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* دکمه‌ها */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          انصراف
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "در حال ذخیره..." : "ذخیره واریانت"}
        </Button>
      </div>
    </form>
  );
}

