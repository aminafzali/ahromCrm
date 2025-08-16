"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import Select22 from "@/@Client/Components/wrappers/Select22";
import { columnsForAdmin } from "@/modules/actual-services/data/table";
import { useActualService } from "@/modules/actual-services/hooks/useActualService";
import { ActualService } from "@/modules/actual-services/types";
import { columnsForSelect } from "@/modules/products/data/table";
import { useProduct } from "@/modules/products/hooks/useProduct";
import { ProductWithRelations } from "@/modules/products/types";
import { listItemRenderUser } from "@/modules/requests/data/table";
import { columns } from "@/modules/service-types/data/table";
import { useServiceType } from "@/modules/service-types/hooks/useServiceType";
import { ServiceType } from "@/modules/service-types/types";
import { listItemRender } from "@/modules/workspace-users/data/table";
import { Button, ButtonSelectWithTable, Form, Input } from "ndui-ahrom";
import { useEffect, useState } from "react";
import { z } from "zod";
import InvoiceItems from "./InvoiceItems";
import SelectRequest2 from "./SelectRequest2";
import SelectUser2 from "./SelectUser2";
import StandaloneDatePicker from "./StandaloneDatePicker"; // مطمئن شوید مسیر درست است

const invoiceSchema = z.object({
  // ... (schema شما بدون تغییر باقی می‌ماند)
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
  name: z.string().optional(),
  requestId: z.number().optional(),
  workspaceUser: z.object(
    { id: z.number() },
    { required_error: "انتخاب مشتری الزامی است." }
  ),
  // فیلدهای تاریخ را برای اعتبارسنجی اضافه می‌کنیم
  issueDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

// ... (بقیه schema ها بدون تغییر)
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
const itemActualServiceSchema = z.object({
  quantity: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().min(1, "تعداد باید حداقل 1 باشد")
  ),
  price: z.any().optional(),
  actualService: z.any().optional(),
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
  const [items, setItems] = useState<any[]>(defaultValues?.items || []);
  const [req, setReq] = useState<any | null>(defaultValues?.request || null);
  const [user, setUser] = useState<any | null>(
    defaultValues?.workspaceUser ||
      defaultValues?.request?.workspaceUser ||
      null
  );
  const [tax, setTax] = useState<number>(defaultValues?.tax || 0);
  const [taxPercent, setTaxPercent] = useState<number>(
    defaultValues?.taxPercent || 0
  );
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(
    defaultValues?.discount || 0
  );
  const [discountPercent, setDiscountPercent] = useState<number>(
    defaultValues?.discountPercent || 0
  );
  const [error, setError] = useState<string | null>(null);
  const [itemType, setItemType] = useState<
    "SERVICE" | "PRODUCT" | "ACTUALSERVICE" | "CUSTOM"
  >("CUSTOM");

  const [issueDate, setIssueDate] = useState<string | null>(
    defaultValues?.issueDate || null
  );
  const [dueDate, setDueDate] = useState<string | null>(
    defaultValues?.dueDate || null
  );

  const { getAll: getAllProducts, loading: loadingProduct } = useProduct();
  const { getAll: getAllServices, loading: loadingService } = useServiceType();
  const { getAll: getAllActualServices, loading: loadingActualService } =
    useActualService();

  const [actualServices, setActualServices] = useState<ActualService[]>([]);
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [services, setServices] = useState<ServiceType[]>([]);

  const calculateSubtotal = () =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const get = async () => {
    const p = await getAllProducts();
    setProducts(p.data);
    const s = await getAllServices();
    setServices(s.data);
    const a = await getAllActualServices();
    setActualServices(a.data);
  };

  useEffect(() => {
    get();
  }, []);

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = taxPercent > 0 ? (taxPercent / 100) * subtotal : tax;
    const discountAmount =
      discountPercent > 0 ? (discountPercent / 100) * subtotal : discount;
    return subtotal + taxAmount - discountAmount;
  };

  const onSetRequest = (selectedItem: any) => {
    console.log("درخواست انتخاب شده (selectedItem):", selectedItem);
    setReq(selectedItem);
    setUser(selectedItem.workspaceUser);
    if (
      selectedItem.actualServices &&
      Array.isArray(selectedItem.actualServices)
    ) {
      const newItemsFromRequest = selectedItem.actualServices
        .map((serviceEntry: any) => {
          const details = serviceEntry.actualService;
          if (!details) {
            console.error(
              "اطلاعات 'actualService' در آیتم ورودی وجود ندارد:",
              serviceEntry
            );
            return null;
          }
          const quantity = serviceEntry.quantity || 1;
          return {
            itemType: "ACTUALSERVICE",
            actualServiceId: details.id,
            description: details.name,
            price: details.price,
            quantity: quantity,
            total: details.price * quantity,
          };
        })
        .filter(Boolean);
      setItems((prevItems) => [...prevItems, ...newItemsFromRequest]);
    }
  };

  const onSetUser = (selectedItem: any) => {
    setUser(selectedItem);
  };

  // ===== شروع بهبود =====
  // این تابع اکنون state مربوط به تاریخ را آپدیت می‌کند
  const handleDateChange = (
    payload: { iso: string; jalali: string } | null,
    fieldName: "issueDate" | "dueDate"
  ) => {
    const isoValue = payload ? payload.iso : null;

    if (fieldName === "issueDate") {
      setIssueDate(isoValue);
    } else {
      setDueDate(isoValue);
    }

    // لاگ کردن مقادیر برای دیباگ (این بخش اختیاری است)
    console.log(`تاریخ برای فیلد "${fieldName}" انتخاب شد:`, isoValue);
  };
  // ===== پایان بهبود =====

  const handleAddItem = async (data: any) => {
    // ... (این تابع بدون تغییر باقی می‌ماند)
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
        serviceTypeId: parseInt(data.serviceType.id),
        description: service.name,
        price: service.basePrice,
      };
    } else if (itemType === "ACTUALSERVICE") {
      const actualService = actualServices.find(
        (s) => s.id === parseInt(data.actualService.id)
      );
      if (!actualService) return;

      newItem = {
        ...newItem,
        actualServiceId: parseInt(data.actualService.id),
        description: actualService.name,
        price: actualService.price,
      };
    }

    setItems([...items, newItem]);
    setError(null);
  };

  const handleRemoveItem = (index: number) =>
    setItems(items.filter((_, i) => i !== index));

  const handleSubmit = () => {
    // ===== شروع بهبود =====
    // مقادیر تاریخ از state به آبجکت نهایی اضافه می‌شوند
    try {
      const data = {
        workspaceUser: user,
        items: items,
        tax,
        taxPercent,
        discount,
        discountPercent,
        subtotal: calculateSubtotal(),
        total: calculateTotal(),
        type: "SALES",
        issueDate: issueDate, // <<-- فیلد تاریخ صدور اضافه شد
        dueDate: dueDate, // <<-- فیلد تاریخ سررسید اضافه شد
      };
      // ===== پایان بهبود =====

      if (req) {
        data["requestId"] = req.id;
        data["name"] = `فاکتور فروش ${user.displayName} ${calculateTotal()} ${
          req.id
        }`;
      } else {
        data["name"] = `فاکتور فروش ${user.displayName} ${calculateTotal()}`;
      }

      const validation = invoiceSchema.safeParse(data);
      if (!validation.success) {
        console.error("Validation Errors:", validation.error.flatten());
        setError("لطفاً همه موارد را به درستی تکمیل کنید. (خطا در کنسول)");
        return;
      }

      // داده‌های معتبر برای ارسال به سرور
      onSubmit(validation.data);
    } catch (e) {
      console.error(e);
      setError("خطا در ثبت فاکتور");
    }
  };

  const renderItemForm = () => {
    // ... (این تابع بدون تغییر باقی می‌ماند)
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
      case "ACTUALSERVICE":
        return (
          <ButtonSelectWithTable
            name={"actualService"}
            label={"زیر خدمت"}
            columns={columnsForAdmin}
            data={actualServices}
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
    // ... (این تابع بدون تغییر باقی می‌ماند)
    switch (itemType) {
      case "PRODUCT":
        return itemProductSchema;
      case "SERVICE":
        return itemServiceSchema;
      case "ACTUALSERVICE":
        return itemActualServiceSchema;
      case "CUSTOM":
        return itemSchema;
    }
  };

  if (loadingProduct || loadingService || loadingActualService)
    return <Loading />;

  return (
    <div className="space-y-6">
      {error && (
        <div className="alert alert-error">
          <DIcon icon="fa-exclamation-triangle" cdi={false} />
          <span>{error}</span>
        </div>
      )}
      {/* بخش اطلاعات کلی فاکتور (کد زیباتر شده از قبل) */}
      <div className="card bg-gray-100 shadow-md border">
        <div className="card-body">
          <h3 className="card-title text-lg font-semibold">
            اطلاعات کلی فاکتور
          </h3>
          <p className="text-sm text-base-content/60 -mt-2 mb-4">
            مشتری و تاریخ‌های مهم فاکتور را در این بخش مشخص کنید.
          </p>

          <div className="space-y-6">
            {/* بخش انتخاب مشتری */}
            <div>
              <label className="label">
                <span className="label-text font-medium">مشتری</span>
              </label>
              <div className="p-3 border rounded-lg bg-base-200/50 min-h-[70px] flex items-center">
                {req ? (
                  <div className="w-full flex justify-between items-center">
                    <div>{listItemRenderUser(req)}</div>
                    {/* --- شروع اصلاحیه --- */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="btn-circle" // کلاس برای دایره‌ای کردن دکمه
                      onClick={() => {
                        setReq(null);
                        setUser(null);
                      }}
                    >
                      <DIcon
                        icon="fa-times"
                        //    className="text-error"
                        cdi={false}
                      />
                    </Button>
                    {/* --- پایان اصلاحیه --- */}
                  </div>
                ) : user ? (
                  <div className="w-full flex justify-between items-center">
                    <div>{listItemRender(user)}</div>
                    {/* --- شروع اصلاحیه --- */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="btn-circle" // کلاس برای دایره‌ای کردن دکمه
                      onClick={() => setUser(null)}
                    >
                      <DIcon
                        icon="fa-times"
                        //    className="text-error"
                        cdi={false}
                      />
                    </Button>
                    {/* --- پایان اصلاحیه --- */}
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <SelectRequest2 onSelect={onSetRequest} />
                    <span className="text-base-content/50">یا</span>
                    <SelectUser2 onSelect={onSetUser} />
                  </div>
                )}
              </div>
            </div>
            {/* بخش انتخاب تاریخ‌ها */}
            <div>
              <label className="label">
                <span className="label-text font-medium">تاریخ‌ها</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 border rounded-lg bg-base-200/50">
                <StandaloneDatePicker
                  name="issueDate"
                  label="تاریخ صدور"
                  value={issueDate}
                  onChange={(payload) => handleDateChange(payload, "issueDate")}
                  placeholder="انتخاب کنید"
                />
                <StandaloneDatePicker
                  name="dueDate"
                  label="تاریخ سررسید"
                  value={dueDate}
                  onChange={(payload) => handleDateChange(payload, "dueDate")}
                  placeholder="انتخاب کنید"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* بخش افزودن آیتم */}
      <div className="card bg-base-100 shadow-md border">
        <div className="card-body">
          <h3 className="card-title text-lg font-semibold">آیتم‌های فاکتور</h3>
          <Form schema={getSchema()} onSubmit={handleAddItem} className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <Select22
                label="نوع آیتم"
                value={itemType}
                onChange={(e) => setItemType(e.target.value as any)}
                options={[
                  { value: "CUSTOM", label: "متن آزاد" },
                  { value: "PRODUCT", label: "محصول" },
                  { value: "SERVICE", label: "خدمت" },
                  { value: "ACTUALSERVICE", label: "زیر خدمت" },
                ]}
                name={"itemType"}
              />
              <div className="lg:col-span-2">{renderItemForm()}</div>
              <Input
                name="quantity"
                label="تعداد"
                type="number"
                placeholder="مثلا: 1"
                defaultValue={1}
              />
              <Input
                name="price"
                label="قیمت واحد"
                type="number"
                placeholder="به تومان"
                value={itemPrice}
                onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
                disabled={itemType !== "CUSTOM"}
              />
              <Button
                type="submit"
                className="w-full"
                icon={<DIcon icon="fa-plus" cdi={false} />}
              >
                افزودن
              </Button>
            </div>
          </Form>
        </div>
      </div>

      <InvoiceItems items={items} onRemove={handleRemoveItem} />

      {/* بخش محاسبات نهایی */}
      <div className="card bg-base-100 shadow-md border">
        <div className="card-body">
          <h3 className="card-title text-lg font-semibold">محاسبات نهایی</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
            />
          </div>

          <div className="divider my-6"></div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span>جمع کل:</span>
              <span>{calculateSubtotal().toLocaleString()} تومان</span>
            </div>
            <div className="flex justify-between">
              <span>مالیات ({taxPercent}%):</span>
              <span className="text-success">
                +{tax.toLocaleString()} تومان
              </span>
            </div>
            <div className="flex justify-between">
              <span>تخفیف ({discountPercent}%):</span>
              <span className="text-error">
                -{discount.toLocaleString()} تومان
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
              <span>مبلغ نهایی:</span>
              <span>{calculateTotal().toLocaleString()} تومان</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button
          type="button"
          variant="primary"
          disabled={items.length === 0 || loading || !user}
          onClick={handleSubmit}
          icon={<DIcon icon="fa-check" cdi={false} classCustom="ml-2" />}
        >
          {loading ? "در حال ثبت..." : "ثبت نهایی فاکتور"}
        </Button>
      </div>
    </div>
  );
}

// "use client";

// import DIcon from "@/@Client/Components/common/DIcon";
// import Loading from "@/@Client/Components/common/Loading";
// import Select22 from "@/@Client/Components/wrappers/Select22";
// import { columnsForAdmin } from "@/modules/actual-services/data/table";
// import { columnsForSelect } from "@/modules/products/data/table";
// import { useProduct } from "@/modules/products/hooks/useProduct";
// import { ProductWithRelations } from "@/modules/products/types";
// import { listItemRenderUser } from "@/modules/requests/data/table";
// import { columns } from "@/modules/service-types/data/table";
// import { useServiceType } from "@/modules/service-types/hooks/useServiceType";
// import { ServiceType } from "@/modules/service-types/types";
// //TODO:T2d برای خدمات واقعی باید در اینجا موارد مهم را ایمپورت کنیم
// import { useActualService } from "@/modules/actual-services/hooks/useActualService";
// import { ActualService } from "@/modules/actual-services/types";
// import { listItemRender } from "@/modules/workspace-users/data/table";
// import { Button, ButtonSelectWithTable, Form, Input } from "ndui-ahrom";
// import { useEffect, useState } from "react";
// import { z } from "zod";
// import InvoiceItems from "./InvoiceItems";
// import SelectRequest2 from "./SelectRequest2";
// import SelectUser2 from "./SelectUser2";
// import StandaloneDatePicker from "./StandaloneDatePicker";

// const invoiceSchema = z.object({
//   items: z
//     .array(z.any())
//     .min(1, "حداقل یک آیتم باید وجود داشته باشد")
//     .optional(),
//   tax: z.number().min(0, "مالیات نمی‌تواند منفی باشد"),
//   taxPercent: z.number().min(0, "درصد مالیات نمی‌تواند منفی باشد"),
//   discount: z.number().min(0, "تخفیف نمی‌تواند منفی باشد"),
//   discountPercent: z.number().min(0, "درصد تخفیف نمی‌تواند منفی باشد"),
//   subtotal: z.number(),
//   total: z.number(),
//   type: z.string(),
//   name: z.string().optional(),
//   requestId: z.number().optional(),
//   workspaceUser: z.object(
//     { id: z.number() },
//     { required_error: "انتخاب مشتری الزامی است." }
//   ),
// });

// const itemSchema = z.object({
//   description: z.string().optional(),
//   quantity: z.preprocess(
//     (val) => parseFloat(val as string),
//     z.number().min(1, "تعداد باید حداقل 1 باشد")
//   ),
//   price: z.any().optional(),
// });

// const itemServiceSchema = z.object({
//   quantity: z.preprocess(
//     (val) => parseFloat(val as string),
//     z.number().min(1, "تعداد باید حداقل 1 باشد")
//   ),
//   price: z.any().optional(),
//   serviceType: z.any().optional(),
// });

// // TODO:T2d for actual-service
// const itemActualServiceSchema = z.object({
//   quantity: z.preprocess(
//     (val) => parseFloat(val as string),
//     z.number().min(1, "تعداد باید حداقل 1 باشد")
//   ),
//   price: z.any().optional(),
//   actualService: z.any().optional(),
// });

// const itemProductSchema = z.object({
//   quantity: z.preprocess(
//     (val) => parseFloat(val as string),
//     z.number().min(1, "تعداد باید حداقل 1 باشد")
//   ),
//   price: z.any().optional(),
//   product: z.any().optional(),
// });

// interface InvoiceFormProps {
//   onSubmit: (data: any) => void;
//   defaultValues?: any;
//   loading?: boolean;
// }

// export default function InvoiceForm({
//   onSubmit,
//   defaultValues = {},
//   loading = false,
// }: InvoiceFormProps) {
//   const [items, setItems] = useState<any[]>(defaultValues?.items || []);
//   const [req, setReq] = useState<any | null>(defaultValues?.request || null);
//   // TODO: خط زیر نیاز به بررسی دارد
//   const [user, setUser] = useState<any | null>(defaultValues?.request || null);
//   const [tax, setTax] = useState<number>(defaultValues?.tax || 0);
//   const [taxPercent, setTaxPercent] = useState<number>(
//     defaultValues?.taxPercent || 0
//   );
//   const [itemPrice, setItemPrice] = useState<number>(0);
//   const [discount, setDiscount] = useState<number>(
//     defaultValues?.discount || 0
//   );
//   const [discountPercent, setDiscountPercent] = useState<number>(
//     defaultValues?.discountPercent || 0
//   );
//   const [error, setError] = useState<string | null>(null);
//   const [itemType, setItemType] = useState<
//     "SERVICE" | "PRODUCT" | "ACTUALSERVICE" | "CUSTOM"
//   >("CUSTOM");
//   const { getAll: getAllProducts, loading: loadingProduct } = useProduct();
//   const { getAll: getAllServices, loading: loadingService } = useServiceType();

//   // ===== این دو خط را اضافه کنید =====
//   const [issueDate, setIssueDate] = useState<string | null>(
//     defaultValues?.issueDate || null
//   );
//   const [dueDate, setDueDate] = useState<string | null>(
//     defaultValues?.dueDate || null
//   );
//   // ===================================

//   //TODO:T2d برای خدمات واقعی باید در اینجا موارد را قرار بدهیم
//   const { getAll: getAllActualServices, loading: loadingActualService } =
//     useActualService();
//   const [actualServices, setActualServices] = useState<ActualService[]>([]);

//   const [products, setProducts] = useState<ProductWithRelations[]>([]);
//   const [services, setServices] = useState<ServiceType[]>([]);

//   const calculateSubtotal = () =>
//     items.reduce((sum, item) => sum + item.price * item.quantity, 0);

//   const get = async () => {
//     const p = await getAllProducts();
//     setProducts(p.data);
//     const s = await getAllServices();
//     setServices(s.data);
//     //TODO:T2
//     const a = await getAllActualServices();
//     setActualServices(a.data);
//   };

//   useEffect(() => {
//     get();
//   }, []);

//   const calculateTotal = () => {
//     const subtotal = calculateSubtotal();
//     const taxAmount = (taxPercent / 100) * subtotal;
//     const discountAmount = (discountPercent / 100) * subtotal;
//     return subtotal + taxAmount - discountAmount;
//   };

//   // const onSetRequest = (selectedItem: any) => {
//   //   setReq(selectedItem);
//   //   setUser((selectedItem as any).user);
//   //   let newItem = {};
//   //   //TODO:T2 متن زیر باید اصلاح شود
//   //   newItem = {
//   //     serviceTypeId: parseInt((selectedItem as any).serviceType.id.toString()),
//   //     description: (selectedItem as any).serviceType.name,
//   //     price: (selectedItem as any).serviceType.basePrice,
//   //     total: (selectedItem as any).serviceType.basePrice,
//   //     quantity: 1,
//   //   };

//   //   setItems([...items, newItem]);
//   // };
//   // const onSetUser = (selectedItem: any) => {
//   //   setUser(selectedItem);
//   // };

//   /**
//    * ✅ **کد نهایی با مسیردهی صحیح به داده‌های تودرتو**
//    * این تابع با درک صحیح ساختار Prisma، مقادیر نام، قیمت و تعداد را استخراج می‌کند.
//    */
//   const onSetRequest = (selectedItem: any) => {
//     // برای دیباگ: ساختار دقیق داده‌ای که از کامپوننت انتخاب می‌آید را در کنسول مرورگر ببینید.
//     console.log("درخواست انتخاب شده (selectedItem):", selectedItem);

//     setReq(selectedItem);
//     setUser(selectedItem.workspaceUser);

//     // بررسی می‌کنیم که آرایه actualServices در آبجکت درخواست وجود داشته باشد
//     if (
//       selectedItem.actualServices &&
//       Array.isArray(selectedItem.actualServices)
//     ) {
//       const newItemsFromRequest = selectedItem.actualServices
//         .map((serviceEntry: any) => {
//           // serviceEntry معادل یک رکورد از جدول ActualServiceOnRequest است

//           // 1. دسترسی به جزئیات خدمت (نام و قیمت) از آبجکت تودرتو
//           const details = serviceEntry.actualService;
//           if (!details) {
//             console.error(
//               "اطلاعات 'actualService' در آیتم ورودی وجود ندارد:",
//               serviceEntry
//             );
//             return null; // اگر ساختار تودرتو وجود نداشت، این آیتم را نادیده بگیر
//           }

//           // 2. دسترسی به تعداد از سطح اصلی آبجکت serviceEntry
//           const quantity = serviceEntry.quantity || 1;

//           // 3. ساخت آیتم جدید برای فاکتور
//           return {
//             itemType: "ACTUALSERVICE",
//             actualServiceId: details.id,
//             description: details.name, // <<-- مشکل شرح حل شد
//             price: details.price, // قیمت از منبع اصلی خوانده می‌شود
//             quantity: quantity, // <<-- تعداد صحیح خوانده می‌شود
//             total: details.price * quantity,
//           };
//         })
//         .filter(Boolean); // حذف هر آیتم null که ممکن است به دلیل خطا ایجاد شده باشد

//       setItems((prevItems) => [...prevItems, ...newItemsFromRequest]);
//     }
//   };

//   const onSetUser = (selectedItem: any) => {
//     setUser(selectedItem);
//   };
//   // ===== متد جدید برای مدیریت تغییر تاریخ =====
//   const handleDateChange = (
//     date: { iso: string; jalali: string } | null,
//     fieldName: string
//   ) => {
//     console.log(`تاریخ برای فیلد "${fieldName}" انتخاب شد:`);
//     if (date) {
//       console.log("  - مقدار شمسی (برای نمایش):", date.jalali);
//       console.log("  - مقدار میلادی (برای دیتابیس):", date.iso);
//     } else {
//       console.log("  - تاریخ پاک شد.");
//     }
//   };
//   // ===========================================

//   const handleAddItem = async (data: any) => {
//     let newItem = {
//       ...data,
//       itemType,
//       quantity: parseFloat(data.quantity),
//       price: parseFloat(itemPrice.toString()),
//       total: parseFloat(itemPrice.toString()) * parseFloat(data.quantity),
//     };

//     if (itemType === "PRODUCT") {
//       const product = products.find((p) => p.id === parseInt(data.product.id));
//       if (!product) return;
//       newItem = {
//         ...newItem,
//         productId: parseInt(data.product.id),
//         description: product.name,
//         price: product.price,
//       };
//     } else if (itemType === "SERVICE") {
//       const service = services.find(
//         (s) => s.id === parseInt(data.serviceType.id)
//       );
//       if (!service) return;

//       newItem = {
//         ...newItem,
//         serviceTypeId: parseInt(data.serviceType.id),
//         description: service.name,
//         price: service.basePrice,
//       };
//     } else if (itemType === "ACTUALSERVICE") {
//       const actualService = actualServices.find(
//         (s) => s.id === parseInt(data.actualService.id)
//       );
//       if (!actualService) return;

//       newItem = {
//         ...newItem,
//         actualServiceId: parseInt(data.actualService.id),
//         description: actualService.name,
//         price: actualService.price,
//       };
//     }

//     setItems([...items, newItem]);
//     setError(null);
//   };

//   const handleRemoveItem = (index: number) =>
//     setItems(items.filter((_, i) => i !== index));

//   const handleSubmit = () => {
//     try {
//       const data = {
//         workspaceUser: user,
//         items: items,
//         tax,
//         taxPercent,
//         discount,
//         discountPercent,
//         subtotal: calculateSubtotal(),
//         total: calculateTotal(),
//         type: "SALES", // Default type
//       };
//       if (req) {
//         data["requestId"] = req.id;
//         data["name"] =
//           "فاکتور " +
//           "فروش" +
//           " " +
//           user.displayName +
//           " " +
//           calculateTotal() +
//           " " +
//           req.id;
//         console.log(
//           "name by req in invoice",
//           "فاکتور " +
//             "فروش " +
//             " " +
//             user.displayName +
//             " " +
//             calculateTotal() +
//             " " +
//             req.id
//         );
//         console.log("log data in invoice by req", data["name"]);
//       } else {
//         data["name"] =
//           "فاکتور " + "فروش " + " " + user.displayName + " " + calculateTotal();
//         console.log(
//           "name in invoice ",
//           "فاکتور " + "فروش " + " " + user.displayName + " " + calculateTotal()
//         );
//         console.log("log data in invoice", data["name"]);
//       }

//       //  if (user) data["workspaceUser"] = user;

//       const validation = invoiceSchema.safeParse(data);
//       if (!validation.success) {
//         setError("لطفاً همه موارد را به درستی تکمیل کنید");
//         return;
//       }

//       onSubmit(data);
//     } catch {
//       setError("خطا در ثبت فاکتور");
//     }
//   };

//   const renderItemForm = () => {
//     switch (itemType) {
//       case "PRODUCT":
//         return (
//           <ButtonSelectWithTable
//             name={"product"}
//             label={"محصول"}
//             columns={columnsForSelect}
//             data={products}
//             selectionMode="single"
//             onSelect={function (selectedItems): void {
//               setItemPrice(selectedItems.price);
//             }}
//             iconViewMode={{
//               remove: (
//                 <DIcon icon="fa-times" cdi={false} classCustom="text-error" />
//               ),
//             }}
//           />
//         );
//       case "SERVICE":
//         return (
//           <ButtonSelectWithTable
//             name={"serviceType"}
//             label={"خدمت"}
//             columns={columns}
//             data={services}
//             selectionMode="single"
//             onSelect={function (selectedItems): void {
//               setItemPrice(selectedItems.basePrice);
//             }}
//             iconViewMode={{
//               remove: (
//                 <DIcon icon="fa-times" cdi={false} classCustom="text-error" />
//               ),
//             }}
//           />
//         );
//       //TODO:T2d
//       case "ACTUALSERVICE":
//         return (
//           <ButtonSelectWithTable
//             name={"actualService"}
//             label={"زیر خدمت"}
//             columns={columnsForAdmin}
//             data={actualServices}
//             selectionMode="single"
//             onSelect={function (selectedItems): void {
//               setItemPrice(selectedItems.price);
//             }}
//             iconViewMode={{
//               remove: (
//                 <DIcon icon="fa-times" cdi={false} classCustom="text-error" />
//               ),
//             }}
//           />
//         );
//       case "CUSTOM":
//         return (
//           <Input
//             name="description"
//             label="شرح"
//             placeholder="شرح آیتم را وارد کنید"
//           />
//         );
//     }
//   };

//   const getSchema = () => {
//     switch (itemType) {
//       case "PRODUCT":
//         return itemProductSchema;
//       case "SERVICE":
//         return itemServiceSchema;
//       case "ACTUALSERVICE":
//         return itemActualServiceSchema;
//       case "CUSTOM":
//         return itemSchema;
//     }
//   };

//   if (loadingProduct || loadingService || loadingActualService)
//     return <Loading />;

//   return (
//     <div className="space-y-6">
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//           {error}
//         </div>
//       )}

//       <div className="p-2 flex flex-col gap-4">
//         <div className="flex gap-2">
//           {!req && <SelectRequest2 onSelect={onSetRequest} />}
//           {req && (
//             <Button
//               className="w-fit text-error"
//               variant="ghost"
//               onClick={() => setReq(null)}
//             >
//               حذف درخواست
//             </Button>
//           )}
//         </div>
//         {req && listItemRenderUser(req)}
//       </div>
//       <div className="p-2 flex flex-col gap-4">
//         <div className="flex gap-2">
//           {!req && !user && <SelectUser2 onSelect={onSetUser} />}

//           {user && !req && (
//             <Button
//               className="w-fit text-error "
//               variant="ghost"
//               onClick={() => setUser(null)}
//             >
//               حذف کاربر
//             </Button>
//           )}
//         </div>
//         {user && listItemRender(user)}
//       </div>
//       {/* ===== 4. استفاده از کامپوننت مستقل DatePicker ===== */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <StandaloneDatePicker
//           name="issueDate"
//           label="تاریخ صدور فاکتور"
//           value={issueDate} // مقدار را از state می‌خواند
//           onChange={(payload) => handleDateChange(payload, "issueDate")} // تابع شما را صدا می‌زند
//           placeholder="تاریخ صدور را انتخاب کنید"
//         />
//         <StandaloneDatePicker
//           name="dueDate"
//           label="تاریخ سررسید"
//           value={dueDate} // مقدار را از state می‌خواند
//           onChange={(payload) => handleDateChange(payload, "dueDate")} // تابع شما را صدا می‌زند
//           placeholder="تاریخ سررسید را انتخاب کنید"
//         />
//       </div>
//       {/* ================================================= */}
//       <div className="bg-white rounded-lg p-2">
//         <h3 className="text-lg font-semibold mb-4">افزودن آیتم جدید</h3>
//         <div className="mb-4"></div>
//         <Form schema={getSchema()} onSubmit={handleAddItem}>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
//             <Select22
//               label="نوع"
//               value={itemType}
//               onChange={(e) => setItemType(e.target.value as any)}
//               options={[
//                 { value: "CUSTOM", label: "متن آزاد" },
//                 { value: "PRODUCT", label: "محصول" },
//                 { value: "SERVICE", label: "خدمت" },
//                 { value: "ACTUALSERVICE", label: "زیر خدمت" },
//               ]}
//               name={""}
//             />
//             {renderItemForm()}
//             <Input
//               name="quantity"
//               label="تعداد"
//               type="number"
//               placeholder="تعداد"
//             />
//             <Input
//               name="price"
//               label="قیمت واحد (تومان)"
//               type="number"
//               placeholder="قیمت"
//               value={itemPrice}
//               onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
//             />
//             <Button
//               type="submit"
//               icon={<DIcon icon="fa-plus" cdi={false} classCustom="ml-2" />}
//             >
//               افزودن آیتم
//             </Button>
//           </div>
//         </Form>
//       </div>

//       <InvoiceItems items={items} onRemove={handleRemoveItem} />

//       <Form schema={invoiceSchema} onSubmit={handleSubmit}>
//         <div className="bg-white rounded-lg p-4 border">
//           <h3 className="text-lg font-semibold mb-4">محاسبات نهایی</h3>
//           <div className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <Input
//                 name="taxPercent"
//                 label="درصد مالیات"
//                 type="number"
//                 value={taxPercent}
//                 onChange={(e) => {
//                   const percent = parseFloat(e.target.value) || 0;
//                   setTaxPercent(percent);
//                   setTax((calculateSubtotal() * percent) / 100);
//                 }}
//               />
//               <Input
//                 name="tax"
//                 label="مبلغ مالیات (تومان)"
//                 type="number"
//                 disabled
//                 value={tax}
//                 onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
//               />
//               <Input
//                 name="discountPercent"
//                 label="درصد تخفیف"
//                 type="number"
//                 value={discountPercent}
//                 onChange={(e) => {
//                   const percent = parseFloat(e.target.value) || 0;
//                   setDiscountPercent(percent);
//                   setDiscount((calculateSubtotal() * percent) / 100);
//                 }}
//               />
//               <Input
//                 name="discount"
//                 label="مبلغ تخفیف (تومان)"
//                 type="number"
//                 disabled
//                 value={discount}
//                 onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
//               />
//               <Input
//                 name="subtotal"
//                 label="جمع کل"
//                 type="number"
//                 value={calculateSubtotal()}
//                 readOnly
//               />
//               <Input
//                 name="total"
//                 label="مبلغ نهایی"
//                 type="number"
//                 value={calculateTotal()}
//                 readOnly
//               />
//             </div>

//             <div className="border-t pt-4 space-y-2">
//               <div className="flex justify-between">
//                 <span>جمع کل:</span>
//                 <span>{calculateSubtotal().toLocaleString()} تومان</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>مالیات ({taxPercent}%):</span>
//                 <span>{tax.toLocaleString()} تومان</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>تخفیف ({discountPercent}%):</span>
//                 <span>{discount.toLocaleString()} تومان</span>
//               </div>
//               <div className="flex justify-between font-bold text-lg border-t pt-2">
//                 <span>مبلغ نهایی:</span>
//                 <span>{calculateTotal().toLocaleString()} تومان</span>
//               </div>
//             </div>
//           </div>

//           <div className="flex justify-end mt-6">
//             <Button
//               type="button"
//               disabled={items.length === 0 || loading}
//               onClick={handleSubmit}
//               icon={<DIcon icon="fa-check" cdi={false} classCustom="ml-2" />}
//             >
//               {loading ? "در حال ثبت..." : "ثبت فاکتور"}
//             </Button>
//           </div>
//         </div>
//       </Form>
//     </div>
//   );
// }
