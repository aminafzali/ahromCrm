// // src/modules/invoices/components/InvoiceForm.tsx
// "use client";

// import DIcon from "@/@Client/Components/common/DIcon";
// import Loading from "@/@Client/Components/common/Loading";
// import { useActualService } from "@/modules/actual-services/hooks/useActualService";
// import { ActualService } from "@/modules/actual-services/types";
// import SelectInvoice from "@/modules/payments/components/SelectInvoice";
// import { useProduct } from "@/modules/products/hooks/useProduct";
// import { ProductWithRelations } from "@/modules/products/types";
// import { useServiceType } from "@/modules/service-types/hooks/useServiceType";
// import { ServiceType } from "@/modules/service-types/types";
// import { listItemRender } from "@/modules/workspace-users/data/table";
// import { Button, Input, Modal } from "ndui-ahrom";
// import { useEffect, useId, useState } from "react";
// import { z } from "zod";
// import SelectRequest2 from "./SelectRequest2";
// import SelectUser2 from "./SelectUser2";
// import StandaloneDatePicker from "./StandaloneDatePicker";

// /* ---------- schema (Logic Unchanged) ---------- */
// const invoiceSchema = z.object({
//   items: z.array(z.any()).min(1).optional(),
//   tax: z.number().min(0),
//   taxPercent: z.number().min(0),
//   discount: z.number().min(0),
//   discountPercent: z.number().min(0),
//   subtotal: z.number(),
//   total: z.number(),
//   type: z.enum([
//     "SALES",
//     "PURCHASE",
//     "PROFORMA",
//     "RETURN_SALES",
//     "RETURN_PURCHASE",
//   ]),
//   name: z.string().optional(),
//   requestId: z.number().optional(),
//   referenceInvoiceId: z.number().optional(),
//   workspaceUser: z.object({ id: z.number() }),
//   issueDate: z.string().optional().nullable(),
//   dueDate: z.string().optional().nullable(),
// });

// /* ---------- types (Logic Unchanged + TS Fix) ---------- */
// type InvoiceType = z.infer<typeof invoiceSchema>["type"];

// type RowItem = {
//   id: string;
//   itemName?: string;
//   description?: string;
//   sku?: string;
//   unit?: string;
//   quantity?: number;
//   unitPrice?: number;
//   discountPercent?: number;
//   taxPercent?: number;
//   total?: number;
//   productId?: number;
//   actualServiceId?: number;
// };

// /* ---------- ItemPicker Modal (UI Polished) ---------- */
// interface ItemPickerProps {
//   isOpen: boolean;
//   mode: "products" | "actuals";
//   items: any[];
//   onClose: () => void;
//   onSelect: (item: any) => void;
//   title?: string;
// }
// function ItemPicker({
//   isOpen,
//   mode,
//   items,
//   onClose,
//   onSelect,
//   title,
// }: ItemPickerProps) {
//   const [q, setQ] = useState("");
//   useEffect(() => {
//     if (!isOpen) setQ("");
//   }, [isOpen]);

//   const list = (items || []).filter((it) => {
//     if (!q) return true;
//     const s = `${it.name || ""} ${it.sku || ""}`.toLowerCase();
//     return s.includes(q.trim().toLowerCase());
//   });

//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onClose}
//       //size="3xl"
//     >
//       <div className="p-4">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="card-title text-lg flex items-center gap-2">
//             <DIcon
//               icon={mode === "products" ? "fa-box-open" : "fa-cogs"}
//               cdi={false}
//             />
//             {title || (mode === "products" ? "انتخاب محصول" : "انتخاب خدمت")}
//           </h3>
//           <Button variant="ghost" onClick={onClose}>
//             <DIcon icon="fa-times" cdi={false} />
//           </Button>
//         </div>
//         <Input
//           name="itempicker-search"
//           placeholder="جستجو بر اساس نام یا کد..."
//           value={q}
//           onChange={(e: any) => setQ(e.target.value)}
//         />
//         <div className="max-h-[50vh] overflow-y-auto mt-4 rounded-lg border">
//           <table className="table table-zebra table-sm w-full">
//             <thead className="sticky top-0 bg-base-200 z-10">
//               <tr>
//                 <th>#</th>
//                 <th>نام</th>
//                 <th>قیمت</th>
//                 <th>کد</th>
//                 <th className="text-center">عملیات</th>
//               </tr>
//             </thead>
//             <tbody>
//               {list.map((it, i) => (
//                 <tr key={it.id ?? i} className="hover">
//                   <th>{i + 1}</th>
//                   <td>{it.name}</td>
//                   <td>
//                     {Number(it.price ?? it.basePrice ?? 0).toLocaleString()}
//                   </td>
//                   <td>{it.sku || "-"}</td>
//                   <td className="text-center">
//                     <Button
//                       size="xs"
//                       onClick={() => {
//                         onSelect(it);
//                         onClose();
//                       }}
//                       icon={<DIcon icon="fa-check" cdi={false} />}
//                     >
//                       انتخاب
//                     </Button>
//                   </td>
//                 </tr>
//               ))}
//               {list.length === 0 && (
//                 <tr>
//                   <td
//                     colSpan={5}
//                     className="text-center p-8 text-base-content/60"
//                   >
//                     موردی یافت نشد
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </Modal>
//   );
// }

// /* ---------- InvoiceForm (Main Component) ---------- */
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
//   const rootId = useId();

//   /* ---------- hooks (Your original logic is preserved) ---------- */
//   const [items, setItems] = useState<RowItem[]>(
//     (defaultValues?.items || []).map((it: any, i: number) => ({
//       id: `${Date.now()}-${i}`,
//       ...it,
//     }))
//   );
//   const [req, setReq] = useState<any | null>(defaultValues?.request || null);
//   const [user, setUser] = useState<any | null>(
//     defaultValues?.workspaceUser ||
//       defaultValues?.request?.workspaceUser ||
//       null
//   );
//   const [tax, setTax] = useState<number>(defaultValues?.tax || 0);
//   const [taxPercent, setTaxPercent] = useState<number>(
//     defaultValues?.taxPercent || 0
//   );
//   const [discount, setDiscount] = useState<number>(
//     defaultValues?.discount || 0
//   );
//   const [discountPercent, setDiscountPercent] = useState<number>(
//     defaultValues?.discountPercent || 0
//   );
//   const [issueDate, setIssueDate] = useState<string | null>(
//     defaultValues?.issueDate || null
//   );
//   const [dueDate, setDueDate] = useState<string | null>(
//     defaultValues?.dueDate || null
//   );
//   const [error, setError] = useState<string | null>(null);
//   const [rowErrors, setRowErrors] = useState<Record<string, string[]>>({});
//   const [mode, setMode] = useState<"table" | "card">("table");
//   const [type, setType] = useState<InvoiceType>(defaultValues?.type || "SALES");
//   const [referenceInvoice, setReferenceInvoice] = useState<any | null>(
//     defaultValues?.referenceInvoice || null
//   );
//   const { getAll: getAllProducts, loading: loadingProduct } = useProduct();
//   const { getAll: getAllServices, loading: loadingService } = useServiceType();
//   const { getAll: getAllActualServices, loading: loadingActualService } =
//     useActualService();
//   const [products, setProducts] = useState<ProductWithRelations[]>([]);
//   const [services, setServices] = useState<ServiceType[]>([]);
//   const [actualServices, setActualServices] = useState<ActualService[]>([]);
//   const [pickerOpen, setPickerOpen] = useState(false);
//   const [pickerMode, setPickerMode] = useState<"products" | "actuals">(
//     "products"
//   );
//   const [pickerTargetRow, setPickerTargetRow] = useState<string | null>(null);

//   /* ---------- load data once (Your original logic) ---------- */
//   useEffect(() => {
//     const load = async () => {
//       try {
//         const p = await getAllProducts();
//         setProducts(p.data || []);
//       } catch (e) {
//         console.error("getAllProducts failed", e);
//       }
//       try {
//         const s = await getAllServices();
//         setServices(s.data || []);
//       } catch (e) {
//         console.error("getAllServices failed", e);
//       }
//       try {
//         const a = await getAllActualServices();
//         setActualServices(a.data || []);
//       } catch (e) {
//         console.error("getAllActualServices failed", e);
//       }
//     };
//     load();
//   }, []);

//   /* ---------- helpers (Your original logic) ---------- */
//   const recalcRow = (r: RowItem) => {
//     const q = Number(r.quantity || 0) || 0;
//     const up = Number(r.unitPrice || 0) || 0;
//     const dp = Number(r.discountPercent || 0) / 100;
//     const tp = Number(r.taxPercent || 0) / 100;
//     let base = q * up;
//     const discountAmount = base * dp;
//     base = base - discountAmount;
//     const taxAmount = base * tp;
//     const total = Math.round((base + taxAmount) * 100) / 100;
//     return { ...r, total };
//   };

//   const validateRow = (r: RowItem) => {
//     const errs: string[] = [];
//     if (!r.description || String(r.description).trim() === "")
//       errs.push("شرح آیتم الزامی است");
//     if (!r.itemName || String(r.itemName).trim() === "")
//       errs.push("نام آیتم الزامی است");
//     if (Number(r.unitPrice || 0) <= 0)
//       errs.push("قیمت واحد باید بزرگتر از صفر باشد");
//     if (Number(r.total || 0) <= 0) errs.push("مبلغ کل باید بزرگتر از صفر باشد");
//     return errs;
//   };

//   const setRow = (id: string, patch: Partial<RowItem>) => {
//     setItems((prev) => {
//       const updated = prev.map((r) =>
//         r.id === id ? recalcRow({ ...r, ...patch }) : r
//       );
//       const target = updated.find((u) => u.id === id)!;
//       const errs = validateRow(target);
//       setRowErrors((prevErr) => ({ ...prevErr, [id]: errs }));
//       return updated;
//     });
//   };

//   const addRow = (initial?: Partial<RowItem>) =>
//     setItems((prev) => [
//       ...prev,
//       recalcRow({
//         id: `${Date.now()}-${Math.random()}`,
//         quantity: 1,
//         unitPrice: 0,
//         discountPercent: 0,
//         taxPercent: 0,
//         itemName: "",
//         sku: "",
//         unit: "",
//         description: "",
//         ...initial,
//       }),
//     ]);

//   const removeRow = (id: string) => {
//     setItems((prev) => prev.filter((r) => r.id !== id));
//     setRowErrors((prev) => {
//       const n = { ...prev };
//       delete n[id];
//       return n;
//     });
//   };

//   const calculateSubtotal = () =>
//     items.reduce((s, it) => s + Number(it.total || 0), 0);

//   const calculateTotal = () => {
//     const subtotal = calculateSubtotal();
//     const taxAmount = taxPercent > 0 ? (taxPercent / 100) * subtotal : tax;
//     const discountAmount =
//       discountPercent > 0 ? (discountPercent / 100) * subtotal : discount;
//     return Math.round((subtotal + taxAmount - discountAmount) * 100) / 100;
//   };

//   const openPicker = (rowId: string | null, mode: "products" | "actuals") => {
//     setPickerTargetRow(rowId);
//     setPickerMode(mode);
//     setPickerOpen(true);
//   };

//   const handlePickerSelect = (picked: any) => {
//     if (!picked) return;
//     const newRowData = {
//       itemName: picked.name,
//       description: picked.description || picked.name,
//       sku: picked.sku || "",
//       unit: picked.unit || "",
//       unitPrice: picked.price ?? 0,
//       productId: pickerMode === "products" ? picked.id : undefined,
//       actualServiceId: pickerMode === "actuals" ? picked.id : undefined,
//     };
//     if (!pickerTargetRow) {
//       addRow(newRowData);
//     } else {
//       setRow(pickerTargetRow, newRowData);
//     }
//     setPickerTargetRow(null);
//   };

//   const onSetRequest = (selectedItem: any) => {
//     if (!selectedItem) return;
//     setReq(selectedItem);
//     setUser(selectedItem.workspaceUser || selectedItem.user || user);
//     if (
//       selectedItem.actualServices &&
//       Array.isArray(selectedItem.actualServices)
//     ) {
//       const newItems = selectedItem.actualServices
//         .map((entry: any, i: number) => {
//           const details = entry.actualService || entry.service;
//           if (!details) return null;
//           return recalcRow({
//             id: `${Date.now()}-${i}`,
//             itemName: details.name,
//             description: details.description || details.name,
//             sku: details.sku || "",
//             unit: details.unit || "",
//             quantity: entry.quantity || 1,
//             unitPrice: details.price ?? 0,
//             discountPercent: entry.discountPercent ?? 0,
//             taxPercent: entry.taxPercent ?? 0,
//           });
//         })
//         .filter(Boolean);
//       if (newItems.length) setItems((prev) => [...prev, ...newItems]);
//     }
//   };

//   const onSetUser = (selectedItem: any) => setUser(selectedItem);

//   const onSelectReferenceInvoice = (inv: any) => {
//     if (!inv) return;
//     setReferenceInvoice(inv);
//     setUser(inv.workspaceUser || user);
//     setReq(inv.request || req);
//     const mapped = (inv.items || []).map((it: any, i: number) =>
//       recalcRow({
//         id: `${Date.now()}-${i}`,
//         itemName: it.itemName || it.description || "",
//         description: it.description || it.itemName || "",
//         sku: it.sku || "",
//         unit: it.unit || "",
//         quantity: it.quantity ?? 1,
//         unitPrice: it.unitPrice ?? it.price ?? 0,
//         discountPercent: it.discountPercent ?? 0,
//         taxPercent: it.taxPercent ?? 0,
//       })
//     );
//     setItems(mapped);
//   };

//   const handleSubmit = () => {
//     try {
//       setError(null);
//       setRowErrors({});
//       const nonEmpty = items.filter(
//         (it) =>
//           (it.itemName && String(it.itemName).trim()) ||
//           Number(it.unitPrice || it.total || 0) !== 0 ||
//           Number(it.quantity || 0) !== 0
//       );
//       if (nonEmpty.length === 0) {
//         setError("حداقل یک آیتم معتبر باید اضافه شود.");
//         return;
//       }
//       const perRowErrors: Record<string, string[]> = {};
//       const normalizedItems = nonEmpty.map((it) => {
//         const item: any = { ...it };
//         const errs = validateRow(item);
//         if (errs.length) perRowErrors[it.id] = errs;
//         return item;
//       });
//       if (Object.keys(perRowErrors).length > 0) {
//         setRowErrors(perRowErrors);
//         setError("برخی آیتم‌ها خطا دارند.");
//         return;
//       }
//       const finalItems = normalizedItems.map(({ id, ...rest }) => rest);
//       const data: any = {
//         workspaceUser: { id: user?.id },
//         items: finalItems,
//         tax,
//         taxPercent,
//         discount,
//         discountPercent,
//         subtotal: calculateSubtotal(),
//         total: calculateTotal(),
//         type,
//         referenceInvoiceId: referenceInvoice?.id,
//         issueDate,
//         dueDate,
//       };
//       if (req) data.requestId = req.id;
//       data.name = `فاکتور ${user?.displayName || ""} ${calculateTotal()}`;
//       const validation = invoiceSchema.safeParse(data);
//       if (!validation.success) {
//         console.error("validation errors", validation.error.flatten());
//         setError("فرم دارای مقادیر نامعتبر است.");
//         return;
//       }
//       onSubmit(validation.data);
//     } catch (e) {
//       console.error(e);
//       setError("خطا در ثبت فاکتور");
//     }
//   };

//   if (loadingProduct || loadingService || loadingActualService)
//     return <Loading />;

//   // The array is now strictly typed to match the state, fixing the TypeScript error.
//   const invoiceTypes: { key: InvoiceType; label: string; icon: string }[] = [
//     { key: "SALES", label: "فروش", icon: "fa-tag" },
//     { key: "PURCHASE", label: "خرید", icon: "fa-shopping-cart" },
//     { key: "PROFORMA", label: "پیش‌فاکتور", icon: "fa-file-alt" },
//     { key: "RETURN_SALES", label: "برگشت فروش", icon: "fa-undo" },
//     { key: "RETURN_PURCHASE", label: "برگشت خرید", icon: "fa-undo-alt" },
//   ];

//   return (
//     <div className="space-y-6">
//       {error && (
//         <div className="alert alert-error shadow-lg">
//           <div>
//             <DIcon icon="fa-exclamation-triangle" cdi={false} />
//             <span>{error}</span>
//           </div>
//         </div>
//       )}

//       {/* --- Card 1: Main Info (UI Improved) --- */}
//       <div className="card bg-base-100 shadow-xl border">
//         <div className="card-body">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             <div className="form-control gap-2 lg:col-span-3">
//               <label className="label py-0">
//                 <span className="label-text font-semibold">نوع فاکتور</span>
//               </label>
//               <div className="btn-group flex-wrap">
//                 {invoiceTypes.map((it) => (
//                   <Button
//                     key={it.key}
//                     className="grow"
//                     //    variant={type === it.key ? "primary" : "outline"}
//                     size="sm"
//                     onClick={() => setType(it.key)}
//                     icon={
//                       <DIcon
//                         icon={it.icon}
//                         cdi={false}
//                         classCustom="text-base"
//                       />
//                     }
//                   >
//                     {it.label}
//                   </Button>
//                 ))}
//               </div>
//             </div>
//             <div className="form-control gap-2">
//               <label className="label py-0">
//                 <span className="label-text font-semibold">مشتری</span>
//               </label>
//               <div className="p-2 rounded-lg bg-base-200 min-h-[5rem]">
//                 {user ? (
//                   <div className="flex items-center justify-between">
//                     {listItemRender(user)}
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => setUser(null)}
//                     >
//                       تغییر
//                     </Button>
//                   </div>
//                 ) : (
//                   <div className="flex gap-2">
//                     <SelectRequest2 onSelect={onSetRequest} />
//                     <SelectUser2 onSelect={onSetUser} />
//                   </div>
//                 )}
//               </div>
//             </div>
//             <div className="form-control gap-2">
//               <label className="label py-0">
//                 <span className="label-text font-semibold">فاکتور مرجع</span>
//               </label>
//               <div className="p-3 border rounded-lg bg-base-200/50">
//                 <div className="flex gap-2 items-center">
//                   <SelectInvoice
//                     onSelect={onSelectReferenceInvoice}
//                     buttonProps={{ className: "w-fit" }}
//                   />
//                   {referenceInvoice && (
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => setReferenceInvoice(null)}
//                     >
//                       حذف مرجع
//                     </Button>
//                   )}
//                 </div>
//                 {referenceInvoice && (
//                   <div className="mt-2 text-sm">
//                     مرجع: {referenceInvoice.name || referenceInvoice.id}
//                   </div>
//                 )}
//               </div>
//             </div>
//             <div className="form-control gap-2">
//               <label className="label py-0">
//                 <span className="label-text font-semibold">تاریخ‌ها</span>
//               </label>
//               <div className="grid grid-cols-2 gap-2">
//                 <StandaloneDatePicker
//                   name="issueDate"
//                   label="تاریخ صدور"
//                   value={issueDate}
//                   onChange={(p: any) => setIssueDate(p ? p.iso : null)}
//                 />
//                 <StandaloneDatePicker
//                   name="dueDate"
//                   label="سررسید"
//                   value={dueDate}
//                   onChange={(p: any) => setDueDate(p ? p.iso : null)}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* --- Card 2: Items & Totals (UI and Layout Improved as requested) --- */}
//       <div className="card bg-base-100 shadow-xl border">
//         <div className="card-body">
//           <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
//             <h3 className="card-title text-xl font-bold">آیتم‌های فاکتور</h3>
//             <div className="flex gap-2 items-center flex-wrap">
//               <div className="btn-group">
//                 <Button
//                   size="sm"
//                   variant={mode === "table" ? "primary" : "ghost"}
//                   onClick={() => setMode("table")}
//                   icon={
//                     <DIcon icon="fa-table" cdi={false} classCustom="text-lg" />
//                   }
//                   //      isIcon
//                   title="نمایش جدولی"
//                 />
//                 <Button
//                   size="sm"
//                   variant={mode === "card" ? "primary" : "ghost"}
//                   onClick={() => setMode("card")}
//                   icon={
//                     <DIcon
//                       icon="fa-id-card"
//                       cdi={false}
//                       classCustom="text-lg"
//                     />
//                   }
//                   //        isIcon
//                   title="نمایش کارتی"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Table or Card View */}
//           <div
//             className={`${
//               mode === "table" ? "block" : "hidden"
//             } overflow-x-auto rounded-lg border`}
//           >
//             <table className="table table-sm w-full min-w-[1024px]">
//               <thead className="bg-base-200">
//                 <tr>
//                   <th className="w-10 text-center">#</th>
//                   <th className="w-1/3">شرح</th>
//                   <th>نام</th>
//                   <th>SKU</th>
//                   <th>واحد</th>
//                   <th>تعداد</th>
//                   <th>قیمت واحد</th>
//                   <th>تخفیف%</th>
//                   <th>مالیات%</th>
//                   <th className="text-left">مبلغ کل</th>
//                   <th className="text-center">عملیات</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {items.map((r, i) => (
//                   <tr key={r.id} className="hover">
//                     <th className="text-center">{i + 1}</th>
//                     <td>
//                       <input
//                         name={`description-${r.id}`}
//                         className="input input-xs input-ghost w-full"
//                         value={r.description}
//                         onChange={(e) =>
//                           setRow(r.id, { description: e.target.value })
//                         }
//                       />
//                     </td>
//                     <td>
//                       <input
//                         name={`itemName-${r.id}`}
//                         className="input input-xs input-ghost w-full"
//                         value={r.itemName}
//                         onChange={(e) =>
//                           setRow(r.id, { itemName: e.target.value })
//                         }
//                       />
//                     </td>
//                     <td>
//                       <input
//                         name={`sku-${r.id}`}
//                         className="input input-xs input-ghost w-full"
//                         value={r.sku}
//                         onChange={(e) => setRow(r.id, { sku: e.target.value })}
//                       />
//                     </td>
//                     <td>
//                       <input
//                         name={`unit-${r.id}`}
//                         className="input input-xs input-ghost w-full"
//                         value={r.unit}
//                         onChange={(e) => setRow(r.id, { unit: e.target.value })}
//                       />
//                     </td>
//                     <td>
//                       <input
//                         name={`quantity-${r.id}`}
//                         type="number"
//                         className="input input-xs input-ghost w-20 text-center"
//                         value={r.quantity}
//                         onChange={(e) =>
//                           setRow(r.id, { quantity: Number(e.target.value) })
//                         }
//                       />
//                     </td>
//                     <td>
//                       <input
//                         name={`unitPrice-${r.id}`}
//                         type="number"
//                         className="input input-xs input-ghost w-28"
//                         value={r.unitPrice}
//                         onChange={(e) =>
//                           setRow(r.id, { unitPrice: Number(e.target.value) })
//                         }
//                       />
//                     </td>
//                     <td>
//                       <input
//                         name={`discountPercent-${r.id}`}
//                         type="number"
//                         className="input input-xs input-ghost w-20 text-center"
//                         value={r.discountPercent}
//                         onChange={(e) =>
//                           setRow(r.id, {
//                             discountPercent: Number(e.target.value),
//                           })
//                         }
//                       />
//                     </td>
//                     <td>
//                       <input
//                         name={`taxPercent-${r.id}`}
//                         type="number"
//                         className="input input-xs input-ghost w-20 text-center"
//                         value={r.taxPercent}
//                         onChange={(e) =>
//                           setRow(r.id, { taxPercent: Number(e.target.value) })
//                         }
//                       />
//                     </td>
//                     <td className="font-mono text-left">
//                       {Number(r.total || 0).toLocaleString()}
//                     </td>
//                     <td className="text-center">
//                       <div className="btn-group">
//                         <Button
//                           size="xs"
//                           variant="ghost"
//                           onClick={() => openPicker(r.id, "products")}
//                           title="انتخاب محصول"
//                         >
//                           <DIcon icon="fa-box" />
//                         </Button>
//                         <Button
//                           size="xs"
//                           variant="ghost"
//                           onClick={() => openPicker(r.id, "actuals")}
//                           title="انتخاب خدمت"
//                         >
//                           <DIcon icon="fa-cogs" />
//                         </Button>
//                         <Button
//                           size="xs"
//                           variant="ghost"
//                           className="text-error"
//                           onClick={() => removeRow(r.id)}
//                           title="حذف ردیف"
//                         >
//                           <DIcon icon="fa-trash" />
//                         </Button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//                 {items.length === 0 && (
//                   <tr>
//                     <td
//                       colSpan={11}
//                       className="text-center py-10 text-base-content/60"
//                     >
//                       آیتمی اضافه نشده است.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           <div
//             className={`${
//               mode === "card" ? "grid" : "hidden"
//             } grid-cols-1 sm:grid-cols-2 gap-4`}
//           >
//             {items.map((r, i) => (
//               <div key={r.id} className="card card-compact bg-base-200 shadow">
//                 <div className="card-body gap-3">
//                   <div className="flex justify-between items-start">
//                     <span className="badge badge-neutral font-bold">
//                       ردیف {i + 1}
//                     </span>
//                     <div className="btn-group">
//                       <Button
//                         size="xs"
//                         variant="ghost"
//                         onClick={() => openPicker(r.id, "products")}
//                       >
//                         <DIcon icon="fa-box" />
//                       </Button>
//                       <Button
//                         size="xs"
//                         variant="ghost"
//                         onClick={() => openPicker(r.id, "actuals")}
//                       >
//                         <DIcon icon="fa-cogs" />
//                       </Button>
//                       <Button
//                         size="xs"
//                         //             isIcon
//                         variant="ghost"
//                         className="text-error"
//                         onClick={() => removeRow(r.id)}
//                       >
//                         <DIcon icon="fa-trash" />
//                       </Button>
//                     </div>
//                   </div>
//                   <Input
//                     name={`description_card-${r.id}`}
//                     label="شرح"
//                     value={r.description}
//                     onChange={(e) =>
//                       setRow(r.id, { description: e.target.value })
//                     }
//                     className="input-sm"
//                   />
//                   <div className="grid grid-cols-2 gap-2">
//                     <Input
//                       name={`quantity_card-${r.id}`}
//                       label="تعداد"
//                       type="number"
//                       value={r.quantity}
//                       onChange={(e) =>
//                         setRow(r.id, { quantity: Number(e.target.value) })
//                       }
//                       className="input-sm"
//                     />
//                     <Input
//                       name={`unitPrice_card-${r.id}`}
//                       label="قیمت واحد"
//                       type="number"
//                       value={r.unitPrice}
//                       onChange={(e) =>
//                         setRow(r.id, { unitPrice: Number(e.target.value) })
//                       }
//                       className="input-sm"
//                     />
//                   </div>
//                   <div className="divider my-0"></div>
//                   <div className="flex justify-between items-center text-sm">
//                     <span>مبلغ کل ردیف:</span>
//                     <span className="font-bold font-mono">
//                       {Number(r.total || 0).toLocaleString()} تومان
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="divider mt-6"></div>

//           {/* Totals Section, moved here as requested */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
//             <div className="grid grid-cols-2 gap-4">
//               <Input
//                 name="taxPercent"
//                 label="درصد مالیات کلی"
//                 type="number"
//                 value={taxPercent}
//                 onChange={(e: any) => {
//                   const p = Number(e.target.value) || 0;
//                   setTaxPercent(p);
//                   setTax((calculateSubtotal() * p) / 100);
//                 }}
//               />
//               <Input
//                 name="discountPercent"
//                 label="درصد تخفیف کلی"
//                 type="number"
//                 value={discountPercent}
//                 onChange={(e: any) => {
//                   const p = Number(e.target.value) || 0;
//                   setDiscountPercent(p);
//                   setDiscount((calculateSubtotal() * p) / 100);
//                 }}
//               />
//             </div>
//             <div className="space-y-2">
//               <div className="flex justify-between text-sm">
//                 <span>جمع کل آیتم‌ها:</span>
//                 <span className="font-mono">
//                   {calculateSubtotal().toLocaleString()}
//                 </span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span>تخفیف ({discountPercent}%):</span>
//                 <span className="font-mono text-error">
//                   -{discount.toLocaleString()}
//                 </span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span>مالیات ({taxPercent}%):</span>
//                 <span className="font-mono text-success">
//                   +{tax.toLocaleString()}
//                 </span>
//               </div>
//               <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
//                 <span>مبلغ نهایی:</span>
//                 <span className="font-mono">
//                   {calculateTotal().toLocaleString()} تومان
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* --- Submit Button --- */}
//       <div className="flex justify-end">
//         <Button
//           variant="primary"
//           size="lg"
//           onClick={handleSubmit}
//           disabled={items.length === 0 || loading || !user}
//           loading={loading}
//           icon={<DIcon icon="fa-check" cdi={false} />}
//         >
//           {loading ? "در حال ثبت..." : "ثبت نهایی فاکتور"}
//         </Button>
//       </div>

//       {/* --- Modals (Logic Unchanged) --- */}
//       <ItemPicker
//         isOpen={pickerOpen}
//         mode={pickerMode}
//         items={pickerMode === "products" ? products : services}
//         onClose={() => {
//           setPickerOpen(false);
//           setPickerTargetRow(null);
//         }}
//         onSelect={handlePickerSelect}
//       />
//     </div>
//   );
// }
