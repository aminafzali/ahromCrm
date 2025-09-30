"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Modal from "@/@Client/Components/ui/Modal";
import { Button, Input } from "ndui-ahrom";
import { useState } from "react";

/* ---------- types ---------- */
export type RowItem = {
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

interface InvoiceItemsProps {
  items: RowItem[];
  rowErrors: Record<string, string[]>;
  mode: "table" | "card";
  setMode: (m: "table" | "card") => void;
  setRow: (id: string, patch: Partial<RowItem>) => void;
  openPicker: (rowId: string | null, mode: "products" | "actuals") => void;
  removeRow: (id: string) => void;
  addRow: (initial?: Partial<RowItem>) => void;
  calculateTotal: () => number;
}

export default function InvoiceItems({
  items,
  rowErrors,
  mode,
  setMode,
  setRow,
  openPicker,
  removeRow,
  addRow,
  calculateTotal,
}: InvoiceItemsProps) {
  const [addModalOpen, setAddModalOpen] = useState(false);

  return (
    <div className="card bg-white shadow-md border rounded-lg overflow-hidden">
      <div className="card-body p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="card-title text-lg">آیتم‌های فاکتور</h3>
          <div className="flex gap-2">
            <Button
              size="md"
              className="w-15 h-15 flex items-center justify-center"
              variant={mode === "table" ? "primary" : "ghost"}
              onClick={() => setMode("table")}
              title="نمایش جدولی"
            >
              <DIcon icon="fa-list" cdi={false} classCustom="!-mx-0 !text-lg" />
            </Button>
            <Button
              size="md"
              className="w-15 h-15 flex items-center justify-center"
              variant={mode === "card" ? "primary" : "ghost"}
              onClick={() => setMode("card")}
              title="نمایش کارتی"
            >
              <DIcon
                icon="fa-table"
                cdi={false}
                classCustom="!-mx-0 !text-lg"
              />
            </Button>
          </div>
        </div>

        {mode === "table" ? (
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-[920px] w-full text-sm">
              <thead>
                <tr className="bg-base-200 text-right sticky top-0">
                  <th className="p-3 w-10">#</th>
                  <th className="p-3 w-50">شرح</th>
                  <th className="p-3 w-40">نام</th>
                  <th className="p-3 w-32">SKU</th>
                  <th className="p-3 w-24">واحد</th>
                  <th className="p-3 w-24">تعداد</th>
                  <th className="p-3 w-32">قیمت واحد</th>
                  <th className="p-3 w-24">تخفیف %</th>
                  <th className="p-3 w-24">مالیات %</th>
                  <th className="p-3 w-36">مبلغ</th>
                  <th className="p-3 w-48 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r, i) => (
                  <tr
                    key={r.id}
                    className="border-t align-top hover:bg-base-100"
                  >
                    <td className="p-2 align-top pt-4">{i + 1}</td>
                    <td className="p-2">
                      <input
                        name={`description-${r.id}`}
                        className="w-50 p-2 border rounded-md bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
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
                        className="w-40 p-2 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
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
                        className="w-32 p-2 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                        value={r.sku || ""}
                        onChange={(e: any) =>
                          setRow(r.id, { sku: e.target.value })
                        }
                      />
                    </td>
                    <td className="p-2">
                      <input
                        name={`unit-${r.id}`}
                        className="w-24 p-2 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
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
                        className="w-20 p-2 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
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
                        className="w-28 p-2 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
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
                        className="w-20 p-2 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
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
                        className="w-20 p-2 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                        value={r.taxPercent || 0}
                        onChange={(e: any) =>
                          setRow(r.id, {
                            taxPercent: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </td>
                    <td className="p-2 font-medium pt-4">
                      {Number(r.total || 0).toLocaleString()}
                    </td>
                    <td className="p-2 font-medium pt-4">
                      <div className="flex gap-4 justify-center items-center h-full">
                        <button
                          title="انتخاب محصول"
                          onClick={() => openPicker(r.id, "products")}
                          className="text-teal-700 hover:text-teal-500 transition-colors"
                        >
                          <DIcon icon="fa-box" cdi={false} />
                        </button>
                        <button
                          title="انتخاب زیرخدمت"
                          onClick={() => openPicker(r.id, "actuals")}
                          className="text-teal-700 hover:text-teal-500 transition-colors"
                        >
                          <DIcon icon="fa-cogs" cdi={false} />
                        </button>
                        <button
                          title="حذف سطر"
                          onClick={() => removeRow(r.id)}
                          className="text-red-700 hover:text-red-500 transition-colors"
                        >
                          <DIcon icon="fa-trash" cdi={false} />
                        </button>
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
                      <div className="flex flex-col items-center gap-2">
                        <DIcon
                          icon="fa-folder-open"
                          cdi={false}
                          classCustom="text-3xl text-base-content/30"
                        />
                        <span>هنوز آیتمی اضافه نشده است.</span>
                      </div>
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
                className={`p-4 border rounded-lg shadow-sm bg-white ${
                  rowErrors[r.id] ? "border-red-300" : ""
                }`}
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
                      variant="ghost"
                      className="w-10 h-10 hover:bg-red-100 hover:text-red-600"
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
                        setRow(r.id, { quantity: Number(e.target.value) || 0 })
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
                        setRow(r.id, { unitPrice: Number(e.target.value) || 0 })
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

        <div className="border-t mt-4 pt-4 flex justify-between items-center">
          <Button
            variant="primary"
            onClick={() => setAddModalOpen(true)}
            icon={<DIcon icon="fa-plus" cdi={false} />}
          >
            افزودن سطر
          </Button>
          <div className="text-right text-base text-base-content/80">
            جمع نهایی آیتم‌ها:{" "}
            <span className="font-bold text-lg text-base-content">
              {calculateTotal().toLocaleString()} تومان
            </span>
          </div>
        </div>
      </div>

      {/* Add Item Modal inside component */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)}>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">افزودن آیتم جدید</h3>
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={() => {
                addRow();
                setAddModalOpen(false);
              }}
              icon={<DIcon icon="fa-plus" cdi={false} />}
              className="justify-start"
            >
              افزودن سطر دستی
            </Button>
            <Button
              onClick={() => {
                setAddModalOpen(false);
                openPicker(null, "products");
              }}
              icon={<DIcon icon="fa-box" cdi={false} />}
              className="justify-start"
            >
              افزودن محصول از لیست
            </Button>
            <Button
              onClick={() => {
                setAddModalOpen(false);
                openPicker(null, "actuals");
              }}
              icon={<DIcon icon="fa-cogs" cdi={false} />}
              className="justify-start"
            >
              افزودن زیرخدمت از لیست
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// "use client";
// import DIcon from "@/@Client/Components/common/DIcon";
// import Input2 from "@/@Client/Components/ui/Input2";
// import { Button } from "ndui-ahrom";

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

// interface InvoiceItemsProps {
//   items: RowItem[];
//   rowErrors: Record<string, string[]>;
//   mode: "table" | "card";
//   onAddRow: () => void;
//   onRemoveRow: (id: string) => void;
//   onSetRow: (id: string, patch: Partial<RowItem>) => void;
//   onOpenPicker: (rowId: string | null, mode: "products" | "actuals") => void;
// }

// export default function InvoiceItems({
//   items,
//   rowErrors,
//   mode,
//   onAddRow,
//   onRemoveRow,
//   onSetRow,
//   onOpenPicker,
// }: InvoiceItemsProps) {
//   return (
//     <div className="card bg-white shadow-md border rounded-lg overflow-hidden">
//       <div className="card-body p-4">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="card-title text-lg">آیتم‌های فاکتور</h3>
//           <div className="flex gap-2">
//             <Button size="sm" onClick={() => onAddRow()}>
//               + افزودن دستی
//             </Button>
//             <Button size="sm" onClick={() => onOpenPicker(null, "products")}>
//               انتخاب محصول
//             </Button>
//             <Button size="sm" onClick={() => onOpenPicker(null, "actuals")}>
//               انتخاب خدمت
//             </Button>
//           </div>
//         </div>

//         {mode === "table" ? (
//           <div className="overflow-x-auto">
//             <table className="min-w-full text-sm border">
//               <thead>
//                 <tr className="bg-base-200">
//                   <th className="p-2">نام آیتم</th>
//                   <th className="p-2">شرح</th>
//                   <th className="p-2">تعداد</th>
//                   <th className="p-2">قیمت واحد</th>
//                   <th className="p-2">تخفیف%</th>
//                   <th className="p-2">مالیات%</th>
//                   <th className="p-2">مبلغ کل</th>
//                   <th className="p-2">عملیات</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {items.map((r) => (
//                   <tr key={r.id} className="border-t">
//                     <td className="p-2">
//                       <Input2
//                         value={r.itemName || ""}
//                         onChange={(e) =>
//                           onSetRow(r.id, { itemName: e.target.value })
//                         }
//                       />
//                     </td>
//                     <td className="p-2">
//                       <Input2
//                         value={r.description || ""}
//                         onChange={(e) =>
//                           onSetRow(r.id, { description: e.target.value })
//                         }
//                       />
//                     </td>
//                     <td className="p-2">
//                       <Input2
//                         type="number"
//                         value={r.quantity ?? 1}
//                         onChange={(e) =>
//                           onSetRow(r.id, { quantity: Number(e.target.value) })
//                         }
//                       />
//                     </td>
//                     <td className="p-2">
//                       <Input2
//                         type="number"
//                         value={r.unitPrice ?? 0}
//                         onChange={(e) =>
//                           onSetRow(r.id, { unitPrice: Number(e.target.value) })
//                         }
//                       />
//                     </td>
//                     <td className="p-2">
//                       <Input2
//                         type="number"
//                         value={r.discountPercent ?? 0}
//                         onChange={(e) =>
//                           onSetRow(r.id, {
//                             discountPercent: Number(e.target.value),
//                           })
//                         }
//                       />
//                     </td>
//                     <td className="p-2">
//                       <Input2
//                         type="number"
//                         value={r.taxPercent ?? 0}
//                         onChange={(e) =>
//                           onSetRow(r.id, { taxPercent: Number(e.target.value) })
//                         }
//                       />
//                     </td>
//                     <td className="p-2">{r.total?.toLocaleString()}</td>
//                     <td className="p-2">
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => onRemoveRow(r.id)}
//                       >
//                         <DIcon icon="fa-trash" cdi={false} />
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <div className="grid md:grid-cols-2 gap-4">
//             {items.map((r) => (
//               <div
//                 key={r.id}
//                 className="border rounded-lg p-3 shadow-sm relative"
//               >
//                 <div className="absolute top-2 left-2">
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => onRemoveRow(r.id)}
//                   >
//                     <DIcon icon="fa-times" cdi={false} />
//                   </Button>
//                 </div>
//                 <div className="space-y-2">
//                   <Input2
//                     placeholder="نام آیتم"
//                     value={r.itemName || ""}
//                     onChange={(e) =>
//                       onSetRow(r.id, { itemName: e.target.value })
//                     }
//                   />
//                   <Input2
//                     placeholder="شرح"
//                     value={r.description || ""}
//                     onChange={(e) =>
//                       onSetRow(r.id, { description: e.target.value })
//                     }
//                   />
//                   <div className="flex gap-2">
//                     <Input2
//                       type="number"
//                       placeholder="تعداد"
//                       value={r.quantity ?? 1}
//                       onChange={(e) =>
//                         onSetRow(r.id, { quantity: Number(e.target.value) })
//                       }
//                     />
//                     <Input2
//                       type="number"
//                       placeholder="قیمت واحد"
//                       value={r.unitPrice ?? 0}
//                       onChange={(e) =>
//                         onSetRow(r.id, { unitPrice: Number(e.target.value) })
//                       }
//                     />
//                   </div>
//                   <div className="flex gap-2">
//                     <Input2
//                       type="number"
//                       placeholder="تخفیف%"
//                       value={r.discountPercent ?? 0}
//                       onChange={(e) =>
//                         onSetRow(r.id, {
//                           discountPercent: Number(e.target.value),
//                         })
//                       }
//                     />
//                     <Input2
//                       type="number"
//                       placeholder="مالیات%"
//                       value={r.taxPercent ?? 0}
//                       onChange={(e) =>
//                         onSetRow(r.id, { taxPercent: Number(e.target.value) })
//                       }
//                     />
//                   </div>
//                   <div className="font-medium">
//                     مبلغ کل: {r.total?.toLocaleString()}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* خطاها */}
//         {Object.keys(rowErrors).length > 0 && (
//           <div className="mt-4 text-red-600 text-sm space-y-2">
//             {Object.entries(rowErrors).map(([id, errs]) => (
//               <div key={id}>
//                 <span className="font-semibold">خطا در ردیف:</span>{" "}
//                 {errs.join("، ")}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
