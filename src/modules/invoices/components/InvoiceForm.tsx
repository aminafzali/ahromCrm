"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import Select22 from "@/@Client/Components/wrappers/Select22";
import { columnsForSelect } from "@/modules/products/data/table";
import { useProduct } from "@/modules/products/hooks/useProduct";
import { ProductWithRelations } from "@/modules/products/types";
import { listItemRenderUser } from "@/modules/requests/data/table";
import { columns } from "@/modules/service-types/data/table";
import { useServiceType } from "@/modules/service-types/hooks/useServiceType";
import { ServiceType } from "@/modules/service-types/types";
import { listItemRender } from "@/modules/users/data/table";
import { Button, ButtonSelectWithTable, Form, Input } from "ndui-ahrom";
import { useEffect, useState } from "react";
import { z } from "zod";
import InvoiceItems from "./InvoiceItems";
import SelectRequest from "./SelectRequest";
import SelectUser from "./SelectUser";

const invoiceSchema = z.object({
  items: z
    .array(z.any())
    .min(1, "حداقل یک آیتم باید وجود داشته باشد")
    .optional(),
  tax: z.number().min(0, "مالیات نمی‌تواند منفی باشد"),
  taxPercent: z.number().min(0, "درصد مالیات نمی‌تواند منفی باشد"),
  discount: z.number().min(0, "تخفیف نمی‌تواند منفی باشد"),
  discountPercent: z.number().min(0, "درصد تخفیف نمی‌تواند منفی باشد"),
  subtotal: z.number(),
  total: z.number(),
  type: z.string(),
  requestId: z.number().optional(),
  userId: z.number(),
});

const itemSchema = z.object({
  description: z.string().optional(),
  quantity: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().min(1, "تعداد باید حداقل 1 باشد")
  ),
  price: z.any().optional(),
});

const itemServiceSchema = z.object({
  quantity: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().min(1, "تعداد باید حداقل 1 باشد")
  ),
  price: z.any().optional(),
  serviceType: z.any().optional(),
});

const itemProductSchema = z.object({
  quantity: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().min(1, "تعداد باید حداقل 1 باشد")
  ),
  price: z.any().optional(),
  product: z.any().optional(),
});

interface InvoiceFormProps {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  loading?: boolean;
}

export default function InvoiceForm({
  onSubmit,
  defaultValues = {},
  loading = false,
}: InvoiceFormProps) {
  const [items, setItems] = useState<any[]>(defaultValues.items || []);
  const [req, setReq] = useState<any | null>(defaultValues.request || null);
  // TODO: خط زیر نیاز به بررسی دارد
  const [user, setUser] = useState<any | null>(defaultValues.request || null);
  const [tax, setTax] = useState<number>(defaultValues.tax || 0);
  const [taxPercent, setTaxPercent] = useState<number>(
    defaultValues.taxPercent || 0
  );
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(defaultValues.discount || 0);
  const [discountPercent, setDiscountPercent] = useState<number>(
    defaultValues.discountPercent || 0
  );
  const [error, setError] = useState<string | null>(null);
  const [itemType, setItemType] = useState<"SERVICE" | "PRODUCT" | "CUSTOM">(
    "CUSTOM"
  );
  const { getAll: getAllProducts, loading: loadingProduct } = useProduct();
  const { getAll: getAllServices, loading: loadingService } = useServiceType();
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [services, setServices] = useState<ServiceType[]>([]);

  const calculateSubtotal = () =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const get = async () => {
    const p = await getAllProducts();
    setProducts(p.data);
    const s = await getAllServices();
    setServices(s.data);
  };

  useEffect(() => {
    get();
  }, []);

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = (taxPercent / 100) * subtotal;
    const discountAmount = (discountPercent / 100) * subtotal;
    return subtotal + taxAmount - discountAmount;
  };

  const onSetRequest = (selectedItem: any) => {
    setReq(selectedItem);
    setUser((selectedItem as any).user);
    let newItem = {};

    newItem = {
      serviceTypeId: parseInt((selectedItem as any).serviceType.id.toString()),
      description: (selectedItem as any).serviceType.name,
      price: (selectedItem as any).serviceType.basePrice,
      total: (selectedItem as any).serviceType.basePrice,
      quantity: 1,
    };

    setItems([...items, newItem]);
  };
  const onSetUser = (selectedItem: any) => {
    setUser(selectedItem);
  };

  const handleAddItem = async (data: any) => {
    let newItem = {
      ...data,
      itemType,
      quantity: parseFloat(data.quantity),
      price: parseFloat(itemPrice.toString()),
      total: parseFloat(itemPrice.toString()) * parseFloat(data.quantity),
    };

    if (itemType === "PRODUCT") {
      const product = products.find((p) => p.id === parseInt(data.product.id));
      if (!product) return;
      newItem = {
        ...newItem,
        productId: parseInt(data.product.id),
        description: product.name,
        price: product.price,
      };
    } else if (itemType === "SERVICE") {
      const service = services.find(
        (s) => s.id === parseInt(data.serviceType.id)
      );
      if (!service) return;

      newItem = {
        ...newItem,
        serviceTypeId: parseInt(data.serviceTypeId),
        description: service.name,
        price: service.basePrice,
      };
    }

    setItems([...items, newItem]);
    setError(null);
  };

  const handleRemoveItem = (index: number) =>
    setItems(items.filter((_, i) => i !== index));

  const handleSubmit = () => {
    try {
      const data = {
        items: items,
        tax,
        taxPercent,
        discount,
        discountPercent,
        subtotal: calculateSubtotal(),
        total: calculateTotal(),
        type: "SALES", // Default type
      };
      if (req) data["requestId"] = req.id;
      if (user) data["userId"] = user.id;

      const validation = invoiceSchema.safeParse(data);
      if (!validation.success) {
        setError("لطفاً همه موارد را به درستی تکمیل کنید");
        return;
      }

      onSubmit(data);
    } catch {
      setError("خطا در ثبت فاکتور");
    }
  };

  const renderItemForm = () => {
    switch (itemType) {
      case "PRODUCT":
        return (
          <ButtonSelectWithTable
            name={"product"}
            label={"محصول"}
            columns={columnsForSelect}
            data={products}
            selectionMode="single"
            onSelect={function (selectedItems): void {
              setItemPrice(selectedItems.price);
            }}
            iconViewMode={{
              remove: (
                <DIcon icon="fa-times" cdi={false} classCustom="text-error" />
              ),
            }}
          />
        );
      case "SERVICE":
        return (
          <ButtonSelectWithTable
            name={"serviceType"}
            label={"خدمت"}
            columns={columns}
            data={services}
            selectionMode="single"
            onSelect={function (selectedItems): void {
              setItemPrice(selectedItems.basePrice);
            }}
            iconViewMode={{
              remove: (
                <DIcon icon="fa-times" cdi={false} classCustom="text-error" />
              ),
            }}
          />
        );
      case "CUSTOM":
        return (
          <Input
            name="description"
            label="شرح"
            placeholder="شرح آیتم را وارد کنید"
          />
        );
    }
  };

  const getSchema = () => {
    switch (itemType) {
      case "PRODUCT":
        return itemProductSchema;
      case "SERVICE":
        return itemServiceSchema;
      case "CUSTOM":
        return itemSchema;
    }
  };

  if (loadingProduct || loadingService) return <Loading />;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="p-2 flex flex-col gap-4">
        <div className="flex gap-2">
          <SelectRequest onSelect={onSetRequest} />

          {req && (
            <Button
              className="w-fit text-error "
              variant="ghost"
              onClick={() => setReq(null)}
            >
              حذف درخواست
            </Button>
          )}
        </div>
        {req && listItemRenderUser(req)}
      </div>
      <div className="p-2 flex flex-col gap-4">
        <div className="flex gap-2">
          <SelectUser onSelect={onSetUser} />

          {req && (
            <Button
              className="w-fit text-error "
              variant="ghost"
              onClick={() => setUser(null)}
            >
              حذف کاربر
            </Button>
          )}
        </div>

        {user && listItemRender(user)}
      </div>

      <div className="bg-white rounded-lg p-2">
        <h3 className="text-lg font-semibold mb-4">افزودن آیتم جدید</h3>
        <div className="mb-4"></div>
        <Form schema={getSchema()} onSubmit={handleAddItem}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <Select22
              label="نوع"
              value={itemType}
              onChange={(e) => setItemType(e.target.value as any)}
              options={[
                { value: "CUSTOM", label: "متن آزاد" },
                { value: "PRODUCT", label: "محصول" },
                { value: "SERVICE", label: "خدمت" },
              ]}
              name={""}
            />
            {renderItemForm()}
            <Input
              name="quantity"
              label="تعداد"
              type="number"
              placeholder="تعداد"
            />
            <Input
              name="price"
              label="قیمت واحد (تومان)"
              type="number"
              placeholder="قیمت"
              value={itemPrice}
              onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
            />
            <Button
              type="submit"
              icon={<DIcon icon="fa-plus" cdi={false} classCustom="ml-2" />}
            >
              افزودن آیتم
            </Button>
          </div>
        </Form>
      </div>

      <InvoiceItems items={items} onRemove={handleRemoveItem} />

      <Form schema={invoiceSchema} onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg p-4 border">
          <h3 className="text-lg font-semibold mb-4">محاسبات نهایی</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="taxPercent"
                label="درصد مالیات"
                type="number"
                value={taxPercent}
                onChange={(e) => {
                  const percent = parseFloat(e.target.value) || 0;
                  setTaxPercent(percent);
                  setTax((calculateSubtotal() * percent) / 100);
                }}
              />
              <Input
                name="tax"
                label="مبلغ مالیات (تومان)"
                type="number"
                disabled
                value={tax}
                onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
              />
              <Input
                name="discountPercent"
                label="درصد تخفیف"
                type="number"
                value={discountPercent}
                onChange={(e) => {
                  const percent = parseFloat(e.target.value) || 0;
                  setDiscountPercent(percent);
                  setDiscount((calculateSubtotal() * percent) / 100);
                }}
              />
              <Input
                name="discount"
                label="مبلغ تخفیف (تومان)"
                type="number"
                disabled
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              />
              <Input
                name="subtotal"
                label="جمع کل"
                type="number"
                value={calculateSubtotal()}
                readOnly
              />
              <Input
                name="total"
                label="مبلغ نهایی"
                type="number"
                value={calculateTotal()}
                readOnly
              />
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>جمع کل:</span>
                <span>{calculateSubtotal().toLocaleString()} تومان</span>
              </div>
              <div className="flex justify-between">
                <span>مالیات ({taxPercent}%):</span>
                <span>{tax.toLocaleString()} تومان</span>
              </div>
              <div className="flex justify-between">
                <span>تخفیف ({discountPercent}%):</span>
                <span>{discount.toLocaleString()} تومان</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>مبلغ نهایی:</span>
                <span>{calculateTotal().toLocaleString()} تومان</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              type="button"
              disabled={items.length === 0 || loading}
              onClick={handleSubmit}
              icon={<DIcon icon="fa-check" cdi={false} classCustom="ml-2" />}
            >
              {loading ? "در حال ثبت..." : "ثبت فاکتور"}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
