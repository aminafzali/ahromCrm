// src/modules/invoices/components/InvoiceForm.tsx
"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { useActualService } from "@/modules/actual-services/hooks/useActualService";
import { ActualService } from "@/modules/actual-services/types";
import SelectInvoice from "@/modules/payments/components/SelectInvoice";
import { useProduct } from "@/modules/products/hooks/useProduct";
import { ProductWithRelations } from "@/modules/products/types";
import { listItemRenderUser } from "@/modules/requests/data/table";
import { useServiceType } from "@/modules/service-types/hooks/useServiceType";
import { ServiceType } from "@/modules/service-types/types";
import { listItemRender } from "@/modules/workspace-users/data/table";
import { Button, Input, Modal } from "ndui-ahrom";
import { useEffect, useId, useState } from "react";
import { z } from "zod";
import SelectRequest2 from "./SelectRequest2";
import SelectUser2 from "./SelectUser2";
import StandaloneDatePicker from "./StandaloneDatePicker";

/* ---------- schema (client-side reference) ---------- */
const invoiceSchema = z.object({
  items: z.array(z.any()).min(1).optional(),
  tax: z.number().min(0),
  taxPercent: z.number().min(0),
  discount: z.number().min(0),
  discountPercent: z.number().min(0),
  subtotal: z.number(),
  total: z.number(),
  type: z.enum([
    "SALES",
    "PURCHASE",
    "PROFORMA",
    "RETURN_SALES",
    "RETURN_PURCHASE",
  ]),
  name: z.string().optional(),
  requestId: z.number().optional(),
  referenceInvoiceId: z.number().optional(),
  workspaceUser: z.object({ id: z.number() }),
  issueDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

/* ---------- types ---------- */
type RowItem = {
  id: string;
  itemName?: string;
  description?: string;
  sku?: string;
  unit?: string;
  quantity?: number;
  unitPrice?: number;
  discountPercent?: number;
  taxPercent?: number;
  total?: number;
  productId?: number;
  actualServiceId?: number;
};

interface ItemPickerProps {
  isOpen: boolean;
  mode: "products" | "actuals";
  items: any[];
  onClose: () => void;
  onSelect: (item: any) => void;
  title?: string;
}
function ItemPicker({
  isOpen,
  mode,
  items,
  onClose,
  onSelect,
  title,
}: ItemPickerProps) {
  const [q, setQ] = useState("");
  useEffect(() => {
    if (!isOpen) setQ("");
  }, [isOpen]);

  const list = (items || []).filter((it) => {
    if (!q) return true;
    const s = `${it.name || ""} ${it.sku || ""}`.toLowerCase();
    return s.includes(q.trim().toLowerCase());
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <div className="p-4 max-h-[72vh] overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">
            {title || (mode === "products" ? "انتخاب محصول" : "انتخاب زیرخدمت")}
          </h3>
          <Button variant="ghost" onClick={onClose}>
            <DIcon icon="fa-times" cdi={false} />
          </Button>
        </div>

        <div className="mb-3">
          <Input
            name="itempicker-search"
            placeholder="جستجو بر اساس نام یا کد"
            value={q}
            onChange={(e: any) => setQ(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto rounded-md border">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-base-200">
                <th className="p-2 text-left w-12">#</th>
                <th className="p-2 text-left">نام</th>
                <th className="p-2 text-left w-32">قیمت</th>
                <th className="p-2 text-left w-24">کد</th>
                <th className="p-2 w-28">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {list.map((it, i) => (
                <tr key={it.id ?? i} className="border-t hover:bg-base-100">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">{it.name}</td>
                  <td className="p-2">
                    {Number(it.price ?? it.basePrice ?? 0).toLocaleString()}
                  </td>
                  <td className="p-2">{it.sku || "-"}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          onSelect(it);
                          onClose();
                        }}
                        icon={<DIcon icon="fa-check" cdi={false} />}
                      >
                        انتخاب
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-4 text-center text-base-content/60"
                  >
                    موردی یافت نشد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- InvoiceForm ---------- */
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
  const rootId = useId();

  /* ---------- hooks (همه بالای کامپوننت) ---------- */
  const [items, setItems] = useState<RowItem[]>(
    (defaultValues?.items || []).map((it: any, i: number) => ({
      id: `${Date.now()}-${i}`,
      ...it,
    }))
  );
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
  const [discount, setDiscount] = useState<number>(
    defaultValues?.discount || 0
  );
  const [discountPercent, setDiscountPercent] = useState<number>(
    defaultValues?.discountPercent || 0
  );

  const [issueDate, setIssueDate] = useState<string | null>(
    defaultValues?.issueDate || null
  );
  const [dueDate, setDueDate] = useState<string | null>(
    defaultValues?.dueDate || null
  );

  const [error, setError] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string[]>>({});
  const [mode, setMode] = useState<"table" | "card">("table");
  const [type, setType] = useState<
    "SALES" | "PURCHASE" | "PROFORMA" | "RETURN_SALES" | "RETURN_PURCHASE"
  >(defaultValues?.type || "SALES");
  const [referenceInvoice, setReferenceInvoice] = useState<any | null>(
    defaultValues?.referenceInvoice || null
  );

  const { getAll: getAllProducts, loading: loadingProduct } = useProduct();
  const { getAll: getAllServices, loading: loadingService } = useServiceType();
  const { getAll: getAllActualServices, loading: loadingActualService } =
    useActualService();

  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [actualServices, setActualServices] = useState<ActualService[]>([]);

  // picker state (مثل کد قبلی)
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"products" | "actuals">(
    "products"
  );
  const [pickerTargetRow, setPickerTargetRow] = useState<string | null>(null);

  /* ---------- load data once ---------- */
  useEffect(() => {
    const load = async () => {
      try {
        const p = await getAllProducts();
        setProducts(p.data || []);
      } catch (e) {
        console.error("getAllProducts failed", e);
      }
      try {
        const s = await getAllServices();
        setServices(s.data || []);
      } catch (e) {
        console.error("getAllServices failed", e);
      }
      try {
        const a = await getAllActualServices();
        setActualServices(a.data || []);
      } catch (e) {
        console.error("getAllActualServices failed", e);
      }
    };
    load();
  }, []);

  /* ---------- helpers ---------- */
  const recalcRow = (r: RowItem) => {
    const q = Number(r.quantity || 0) || 0;
    const up = Number(r.unitPrice || 0) || 0;
    const dp = Number(r.discountPercent || 0) / 100;
    const tp = Number(r.taxPercent || 0) / 100;
    let base = q * up;
    const discountAmount = base * dp;
    base = base - discountAmount;
    const taxAmount = base * tp;
    const total = Math.round((base + taxAmount) * 100) / 100;
    return { ...r, total };
  };

  const validateRow = (r: RowItem) => {
    const errs: string[] = [];
    if (!r.description || String(r.description).trim() === "")
      errs.push("شرح آیتم الزامی است");
    if (!r.itemName || String(r.itemName).trim() === "")
      errs.push("نام آیتم الزامی است");
    if (Number(r.unitPrice || 0) <= 0)
      errs.push("قیمت واحد باید بزرگتر از صفر باشد");
    if (Number(r.total || 0) <= 0) errs.push("مبلغ کل باید بزرگتر از صفر باشد");
    return errs;
  };

  const setRow = (id: string, patch: Partial<RowItem>) => {
    setItems((prev) => {
      const updated = prev.map((r) =>
        r.id === id ? recalcRow({ ...r, ...patch }) : r
      );
      const target = updated.find((u) => u.id === id)!;
      const errs = validateRow(target);
      setRowErrors((prevErr) => ({ ...prevErr, [id]: errs }));
      return updated;
    });
  };

  const addRow = (initial?: Partial<RowItem>) =>
    setItems((prev) => [
      ...prev,
      recalcRow({
        id: `${Date.now()}-${Math.random()}`,
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
        taxPercent: 0,
        itemName: "",
        sku: "",
        unit: "",
        description: "",
        ...initial,
      }),
    ]);
  const removeRow = (id: string) => {
    setItems((prev) => prev.filter((r) => r.id !== id));
    setRowErrors((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
  };

  const calculateSubtotal = () =>
    items.reduce((s, it) => s + Number(it.total || 0), 0);
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = taxPercent > 0 ? (taxPercent / 100) * subtotal : tax;
    const discountAmount =
      discountPercent > 0 ? (discountPercent / 100) * subtotal : discount;
    return Math.round((subtotal + taxAmount - discountAmount) * 100) / 100;
  };

  /* ---------- picker open helpers ---------- */
  const openPicker = (rowId: string | null, mode: "products" | "actuals") => {
    setPickerTargetRow(rowId);
    setPickerMode(mode);
    setPickerOpen(true);
  };

  const handlePickerSelect = (picked: any) => {
    // اگر pickerTargetRow خالی باشد => افزودن سطر جدید، در غیر این صورت پر کردن همان ردیف
    if (!picked) return;
    if (!pickerTargetRow) {
      // add as new row
      if (pickerMode === "products") {
        addRow({
          itemName: picked.name,
          description: picked.description || picked.name,
          sku: picked.sku || "",
          unit: picked.unit || "",
          unitPrice: picked.price ?? 0,
          productId: picked.id,
        });
      } else {
        addRow({
          itemName: picked.name,
          description: picked.description || picked.name,
          sku: picked.sku || "",
          unit: picked.unit || "",
          unitPrice: picked.price ?? 0,
          actualServiceId: picked.id,
        });
      }
    } else {
      // fill existing row
      if (pickerMode === "products") {
        setRow(pickerTargetRow, {
          itemName: picked.name,
          description: picked.description || picked.name,
          sku: picked.sku || "",
          unit: picked.unit || "",
          unitPrice: picked.price ?? 0,
          productId: picked.id,
        });
      } else {
        setRow(pickerTargetRow, {
          itemName: picked.name,
          description: picked.description || picked.name,
          sku: picked.sku || "",
          unit: picked.unit || "",
          unitPrice: picked.price ?? 0,
          actualServiceId: picked.id,
        });
      }
    }
    setPickerTargetRow(null);
  };

  /* ---------- request/user handlers ---------- */
  const onSetRequest = (selectedItem: any) => {
    if (!selectedItem) return;
    setReq(selectedItem);
    setUser(selectedItem.workspaceUser || selectedItem.user || user);

    if (
      selectedItem.actualServices &&
      Array.isArray(selectedItem.actualServices)
    ) {
      const newItems = selectedItem.actualServices
        .map((entry: any, i: number) => {
          const details = entry.actualService || entry.service;
          if (!details) return null;
          const quantity = entry.quantity || 1;
          return recalcRow({
            id: `${Date.now()}-${i}`,
            itemName: details.name,
            description: details.description || details.name,
            sku: details.sku || "",
            unit: details.unit || "",
            quantity,
            unitPrice: details.price ?? 0,
            discountPercent: entry.discountPercent ?? 0,
            taxPercent: entry.taxPercent ?? 0,
          });
        })
        .filter(Boolean);
      if (newItems.length) setItems((prev) => [...prev, ...newItems]);
    }
  };

  const onSetUser = (selectedItem: any) => setUser(selectedItem);

  /* ---------- reference invoice (using your SelectInvoice component) ---------- */
  const onSelectReferenceInvoice = (inv: any) => {
    if (!inv) return;
    setReferenceInvoice(inv);
    setUser(inv.workspaceUser || user);
    setReq(inv.request || req);

    const mapped = (inv.items || []).map((it: any, i: number) =>
      recalcRow({
        id: `${Date.now()}-${i}`,
        itemName: it.itemName || it.description || "",
        description: it.description || it.itemName || "",
        sku: it.sku || "",
        unit: it.unit || "",
        quantity: it.quantity ?? 1,
        unitPrice: it.unitPrice ?? it.price ?? 0,
        discountPercent: it.discountPercent ?? 0,
        taxPercent: it.taxPercent ?? 0,
      })
    );
    setItems(mapped);
  };

  /* ---------- submit ---------- */
  const handleSubmit = () => {
    try {
      setError(null);
      setRowErrors({});

      const nonEmpty = items.filter((it) => {
        const hasName = !!(it.itemName && String(it.itemName).trim());
        const hasPriceOrTotal = Number(it.unitPrice || it.total || 0) !== 0;
        const hasQty = Number(it.quantity || 0) !== 0;
        return hasName || hasPriceOrTotal || hasQty;
      });

      if (nonEmpty.length === 0) {
        setError("حداقل یک آیتم معتبر باید اضافه شود.");
        return;
      }

      const perRowErrors: Record<string, string[]> = {};
      const normalizedItems = nonEmpty.map((it) => {
        const unitPrice = Number(it.unitPrice ?? 0);
        const quantity = Number(it.quantity ?? 1) || 1;
        const total =
          Number(it.total ?? Math.round(unitPrice * quantity * 100) / 100) || 0;
        const description =
          it.description && String(it.description).trim() !== ""
            ? it.description
            : it.itemName || "";

        const item: any = {
          itemName: it.itemName || "",
          description,
          quantity,
          unitPrice,
          discountPercent: Number(it.discountPercent || 0),
          taxPercent: Number(it.taxPercent || 0),
          total,
        };

        const errs: string[] = [];
        if (!item.description || String(item.description).trim() === "")
          errs.push("شرح آیتم الزامی است");
        if (!item.itemName || String(item.itemName).trim() === "")
          errs.push("نام آیتم الزامی است");
        if (Number(item.unitPrice) < 1000)
          errs.push("قیمت باید حداقل 1000 تومان باشد");
        if (Number(item.total) < 1000)
          errs.push("مبلغ کل باید حداقل 1000 تومان باشد");
        if (errs.length) perRowErrors[it.id] = errs;
        return item;
      });

      if (Object.keys(perRowErrors).length > 0) {
        setRowErrors(perRowErrors);
        setError(
          "برخی آیتم‌ها خطا دارند — لطفاً ردیف‌های مشخص شده را اصلاح کنید."
        );
        return;
      }

      const finalItems = normalizedItems.map((it) => ({
        itemName: it.itemName,
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discountPercent: it.discountPercent,
        taxPercent: it.taxPercent,
        total: it.total,
      }));

      const data: any = {
        workspaceUser: { id: user?.id },
        items: finalItems,
        tax,
        taxPercent,
        discount,
        discountPercent,
        subtotal: calculateSubtotal(),
        total: calculateTotal(),
        type,
        referenceInvoiceId: referenceInvoice?.id,
        issueDate,
        dueDate,
      };
      if (req) data.requestId = req.id;
      data.name = `فاکتور ${user?.displayName || ""} ${calculateTotal()}`;

      const validation = invoiceSchema.safeParse(data);
      if (!validation.success) {
        console.error("validation errors", validation.error.flatten());
        setError("فرم دارای مقادیر نامعتبر است — لطفاً فیلدها را بررسی کنید.");
        return;
      }

      onSubmit(validation.data);
    } catch (e) {
      console.error(e);
      setError("خطا در ثبت فاکتور");
    }
  };

  /* ---------- loading guard ---------- */
  if (loadingProduct || loadingService || loadingActualService)
    return <Loading />;

  /* ---------- render ---------- */
  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* header: type (single row), customer+ref, dates. mode toggles top-right */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start">
        <div className="flex-1 space-y-3">
          <div>
            <label className="label">
              <span className="label-text font-medium">نوع فاکتور</span>
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-2 rounded-md border text-sm ${
                  type === "SALES" ? "bg-primary text-white" : "bg-white"
                }`}
                onClick={() => setType("SALES")}
              >
                فروش
              </button>
              <button
                className={`px-4 py-2 rounded-md border text-sm ${
                  type === "PURCHASE" ? "bg-primary text-white" : "bg-white"
                }`}
                onClick={() => setType("PURCHASE")}
              >
                خرید
              </button>
              <button
                className={`px-4 py-2 rounded-md border text-sm ${
                  type === "PROFORMA" ? "bg-primary text-white" : "bg-white"
                }`}
                onClick={() => setType("PROFORMA")}
              >
                پیش‌فاکتور
              </button>
              <button
                className={`px-4 py-2 rounded-md border text-sm ${
                  type === "RETURN_SALES" ? "bg-primary text-white" : "bg-white"
                }`}
                onClick={() => setType("RETURN_SALES")}
              >
                برگشت از فروش
              </button>
              <button
                className={`px-4 py-2 rounded-md border text-sm ${
                  type === "RETURN_PURCHASE"
                    ? "bg-primary text-white"
                    : "bg-white"
                }`}
                onClick={() => setType("RETURN_PURCHASE")}
              >
                برگشت از خرید
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            <div>
              <label className="label">
                <span className="label-text font-medium">مشتری</span>
              </label>
              <div className="p-3 border rounded-lg bg-base-200/50 min-h-[70px]">
                {req ? (
                  <div className="flex items-center justify-between">
                    {listItemRenderUser(req)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setReq(null);
                        setUser(null);
                      }}
                    >
                      حذف
                    </Button>
                  </div>
                ) : user ? (
                  <div className="flex items-center justify-between">
                    {listItemRender(user)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUser(null)}
                    >
                      حذف
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <SelectRequest2 onSelect={(s) => onSetRequest(s)} />
                    <SelectUser2 onSelect={(u) => onSetUser(u)} />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">فاکتور مرجع</span>
              </label>
              <div className="p-3 border rounded-lg bg-base-200/50">
                <div className="flex gap-2 items-center">
                  <SelectInvoice
                    onSelect={(inv) => onSelectReferenceInvoice(inv)}
                    buttonProps={{ className: "w-fit" }}
                  />
                  {referenceInvoice && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReferenceInvoice(null)}
                    >
                      حذف مرجع
                    </Button>
                  )}
                </div>
                {referenceInvoice && (
                  <div className="mt-2 text-sm">
                    مرجع: {referenceInvoice.name || referenceInvoice.id}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">تاریخ‌ها</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                <StandaloneDatePicker
                  name="issueDate"
                  label="تاریخ صدور"
                  value={issueDate}
                  onChange={(p: any) => setIssueDate(p ? p.iso : null)}
                />
                <StandaloneDatePicker
                  name="dueDate"
                  label="تاریخ سررسید"
                  value={dueDate}
                  onChange={(p: any) => setDueDate(p ? p.iso : null)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* mode toggles (square buttons) on the right */}
        <div className="w-full lg:w-auto flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <Button
              size="sm"
              className="w-10 h-10 flex items-center justify-center"
              variant={mode === "table" ? "primary" : "ghost"}
              onClick={() => setMode("table")}
              title="نمایش جدولی"
            >
              <DIcon icon="fa-list" cdi={false} />
            </Button>
            <Button
              size="sm"
              className="w-10 h-10 flex items-center justify-center"
              variant={mode === "card" ? "primary" : "ghost"}
              onClick={() => setMode("card")}
              title="نمایش کارتی"
            >
              <DIcon icon="fa-th-large" cdi={false} />
            </Button>
          </div>
          <div className="text-right text-sm text-base-content/60 w-full">
            جمع نهایی:{" "}
            <span className="font-bold">
              {calculateTotal().toLocaleString()} تومان
            </span>
          </div>
        </div>
      </div>

      {/* items */}
      <div className="card bg-base-100 shadow-md border rounded-lg overflow-hidden">
        <div className="card-body p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-title text-lg">آیتم‌های فاکتور</h3>
            <div className="flex gap-2 items-center">
              {/* در حالت کارت: فقط آیکن، در حالت جدول: متن + آیکن */}
              {mode === "card" ? (
                <>
                  <Button
                    size="sm"
                    className="w-10 h-10"
                    onClick={() => {
                      setPickerTargetRow(null);
                      setPickerMode("products");
                      setPickerOpen(true);
                    }}
                    icon={<DIcon icon="fa-box" cdi={false} />}
                  />
                  <Button
                    size="sm"
                    className="w-10 h-10"
                    onClick={() => {
                      setPickerTargetRow(null);
                      setPickerMode("actuals");
                      setPickerOpen(true);
                    }}
                    icon={<DIcon icon="fa-cogs" cdi={false} />}
                  />
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    onClick={() => {
                      setPickerTargetRow(null);
                      setPickerMode("products");
                      setPickerOpen(true);
                    }}
                    icon={<DIcon icon="fa-box" cdi={false} />}
                  >
                    افزودن محصول
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setPickerTargetRow(null);
                      setPickerMode("actuals");
                      setPickerOpen(true);
                    }}
                    icon={<DIcon icon="fa-cogs" cdi={false} />}
                  >
                    افزودن زیرخدمت
                  </Button>
                </>
              )}

              <Button
                size="sm"
                onClick={() => addRow()}
                icon={<DIcon icon="fa-plus" cdi={false} />}
              >
                سطر دستی
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setItems([]);
                  setRowErrors({});
                }}
                icon={<DIcon icon="fa-trash" cdi={false} />}
              >
                پاک کردن همه
              </Button>
            </div>
          </div>

          {/* جدول */}
          {mode === "table" ? (
            <div className="overflow-x-auto rounded-md border">
              <table className="min-w-[920px] w-full text-sm">
                <thead>
                  <tr className="bg-base-200 text-left sticky top-0">
                    <th className="p-3 w-10">#</th>
                    <th className="p-3 w-72">شرح</th>
                    <th className="p-3 w-48">نام</th>
                    <th className="p-3 w-32">SKU</th>
                    <th className="p-3 w-24">واحد</th>
                    <th className="p-3 w-24">تعداد</th>
                    <th className="p-3 w-32">قیمت واحد</th>
                    <th className="p-3 w-24">تخفیف %</th>
                    <th className="p-3 w-24">مالیات %</th>
                    <th className="p-3 w-36">مبلغ</th>
                    <th className="p-3 w-48">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r, i) => (
                    <tr
                      key={r.id}
                      className="border-t align-top hover:bg-base-100"
                    >
                      <td className="p-2 align-top">{i + 1}</td>

                      {/* متن شرح را در سطر جداگانه قرار می‌دهیم: input شرح در یک cell و بالای آن label-like */}
                      <td className="p-2">
                        <input
                          name={`description-${r.id}`}
                          className="w-full p-2 border rounded-md bg-white"
                          value={r.description || ""}
                          onChange={(e: any) =>
                            setRow(r.id, { description: e.target.value })
                          }
                          placeholder="شرح آیتم (الزامی)"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          name={`itemName-${r.id}`}
                          className="w-full p-2 border rounded-md"
                          value={r.itemName || ""}
                          onChange={(e: any) =>
                            setRow(r.id, { itemName: e.target.value })
                          }
                          placeholder="نام آیتم"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          name={`sku-${r.id}`}
                          className="w-full p-2 border rounded-md"
                          value={r.sku || ""}
                          onChange={(e: any) =>
                            setRow(r.id, { sku: e.target.value })
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          name={`unit-${r.id}`}
                          className="w-full p-2 border rounded-md"
                          value={r.unit || ""}
                          onChange={(e: any) =>
                            setRow(r.id, { unit: e.target.value })
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          name={`quantity-${r.id}`}
                          type="number"
                          className="w-20 p-2 border rounded-md"
                          value={r.quantity}
                          onChange={(e: any) =>
                            setRow(r.id, {
                              quantity: Number(e.target.value) || 0,
                            })
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          name={`unitPrice-${r.id}`}
                          type="number"
                          className="w-28 p-2 border rounded-md"
                          value={r.unitPrice}
                          onChange={(e: any) =>
                            setRow(r.id, {
                              unitPrice: Number(e.target.value) || 0,
                            })
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          name={`discountPercent-${r.id}`}
                          type="number"
                          className="w-20 p-2 border rounded-md"
                          value={r.discountPercent || 0}
                          onChange={(e: any) =>
                            setRow(r.id, {
                              discountPercent: Number(e.target.value) || 0,
                            })
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          name={`taxPercent-${r.id}`}
                          type="number"
                          className="w-20 p-2 border rounded-md"
                          value={r.taxPercent || 0}
                          onChange={(e: any) =>
                            setRow(r.id, {
                              taxPercent: Number(e.target.value) || 0,
                            })
                          }
                        />
                      </td>
                      <td className="p-2 font-medium">
                        {Number(r.total || 0).toLocaleString()} تومان
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            //              variant="outline"
                            onClick={() => openPicker(r.id, "products")}
                            icon={<DIcon icon="fa-box" cdi={false} />}
                          >
                            محصول
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openPicker(r.id, "actuals")}
                            icon={<DIcon icon="fa-cogs" cdi={false} />}
                          >
                            زیرخدمت
                          </Button>
                          <Button
                            size="sm"
                            //                 variant="destructive"
                            onClick={() => removeRow(r.id)}
                            icon={<DIcon icon="fa-trash" cdi={false} />}
                          >
                            حذف
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td
                        colSpan={11}
                        className="text-center py-8 text-base-content/60"
                      >
                        هنوز آیتمی اضافه نشده است.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((r, idx) => (
                <div
                  key={r.id}
                  className="p-4 border rounded-lg shadow-sm bg-white"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="text-sm text-base-content/60">ردیف</div>
                      <div className="font-medium">{idx + 1}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="w-10 h-10"
                        onClick={() => openPicker(r.id, "products")}
                        icon={<DIcon icon="fa-box" cdi={false} />}
                      />
                      <Button
                        size="sm"
                        className="w-10 h-10"
                        onClick={() => openPicker(r.id, "actuals")}
                        icon={<DIcon icon="fa-cogs" cdi={false} />}
                      />
                      <Button
                        size="sm"
                        //           variant="destructive"
                        onClick={() => removeRow(r.id)}
                        icon={<DIcon icon="fa-trash" cdi={false} />}
                      />
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2">
                    <Input
                      name={`desc-${r.id}`}
                      label="شرح (الزامی)"
                      value={r.description || ""}
                      onChange={(e: any) =>
                        setRow(r.id, { description: e.target.value })
                      }
                    />
                    <Input
                      name={`iname-${r.id}`}
                      label="نام آیتم"
                      value={r.itemName || ""}
                      onChange={(e: any) =>
                        setRow(r.id, { itemName: e.target.value })
                      }
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        name={`sku-${r.id}`}
                        label="SKU"
                        value={r.sku || ""}
                        onChange={(e: any) =>
                          setRow(r.id, { sku: e.target.value })
                        }
                      />
                      <Input
                        name={`unit-${r.id}`}
                        label="واحد"
                        value={r.unit || ""}
                        onChange={(e: any) =>
                          setRow(r.id, { unit: e.target.value })
                        }
                      />
                      <Input
                        name={`qty-${r.id}`}
                        label="تعداد"
                        type="number"
                        value={r.quantity}
                        onChange={(e: any) =>
                          setRow(r.id, {
                            quantity: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        name={`up-${r.id}`}
                        label="قیمت واحد"
                        type="number"
                        value={r.unitPrice}
                        onChange={(e: any) =>
                          setRow(r.id, {
                            unitPrice: Number(e.target.value) || 0,
                          })
                        }
                      />
                      <Input
                        name={`disc-${r.id}`}
                        label="تخفیف %"
                        type="number"
                        value={r.discountPercent || 0}
                        onChange={(e: any) =>
                          setRow(r.id, {
                            discountPercent: Number(e.target.value) || 0,
                          })
                        }
                      />
                      <Input
                        name={`taxp-${r.id}`}
                        label="مالیات %"
                        type="number"
                        value={r.taxPercent || 0}
                        onChange={(e: any) =>
                          setRow(r.id, {
                            taxPercent: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="text-sm">مبلغ سطر:</div>
                      <div className="font-semibold">
                        {Number(r.total || 0).toLocaleString()} تومان
                      </div>
                    </div>

                    {rowErrors[r.id] && (
                      <div className="text-sm text-red-600 mt-2">
                        {rowErrors[r.id].map((m: string, k: number) => (
                          <div key={k}>• {m}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* calculations (درست بعد از درصدها نمایش داده شود) */}
      <div className="card bg-base-100 shadow-md border rounded-lg">
        <div className="card-body p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <Input
              name="taxPercent"
              label="درصد مالیات"
              type="number"
              value={taxPercent}
              onChange={(e: any) => {
                const p = Number(e.target.value) || 0;
                setTaxPercent(p);
                setTax((calculateSubtotal() * p) / 100);
              }}
            />
            <Input
              name="discountPercent"
              label="درصد تخفیف"
              type="number"
              value={discountPercent}
              onChange={(e: any) => {
                const p = Number(e.target.value) || 0;
                setDiscountPercent(p);
                setDiscount((calculateSubtotal() * p) / 100);
              }}
            />
          </div>

          <div className="divider my-4" />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>جمع کل آیتم‌ها:</span>
              <span>{calculateSubtotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>تخفیف ({discountPercent}%):</span>
              <span className="text-error">-{discount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>مالیات ({taxPercent}%):</span>
              <span className="text-success">+{tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>مبلغ نهایی:</span>
              <span>{calculateTotal().toLocaleString()} تومان</span>
            </div>
            <div className="text-sm text-base-content/60">
              تعداد آیتم‌ها: {items.length}
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={items.length === 0 || loading || !user}
              icon={<DIcon icon="fa-check" cdi={false} />}
            >
              {loading ? "در حال ثبت..." : "ثبت فاکتور"}
            </Button>
          </div>
        </div>
      </div>

      {/* Item picker modal (products / actuals) */}
      <ItemPicker
        isOpen={pickerOpen}
        mode={pickerMode}
        items={pickerMode === "products" ? products : actualServices}
        onClose={() => {
          setPickerOpen(false);
          setPickerTargetRow(null);
        }}
        onSelect={handlePickerSelect}
      />
    </div>
  );
}
