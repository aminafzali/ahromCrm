"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { columnsForSelect as productColumns } from "@/modules/products/data/table";
import { ProductWithRelations } from "@/modules/products/types";
import { columns as serviceTypeColumns } from "@/modules/service-types/data/table";
import { ServiceType } from "@/modules/service-types/types";
import { Button, ButtonSelectWithTable, Input } from "ndui-ahrom";
import { useState } from "react";

interface InvoiceItemsProps {
  items: any[];
  onUpdateRow: (id: string, patch: Partial<any>) => void;
  onRemoveRow: (id: string) => void;
  addEmptyRow: () => void;
  products: ProductWithRelations[];
  services: ServiceType[];
}

export default function InvoiceItems({
  items,
  onUpdateRow,
  onRemoveRow,
  addEmptyRow,
  products,
  services,
}: InvoiceItemsProps) {
  const [activeSelector, setActiveSelector] = useState<{
    rowId: string;
    type: "PRODUCT" | "SERVICE";
  } | null>(null);

  const handleSelect = (
    rowId: string,
    item: any,
    type: "PRODUCT" | "SERVICE"
  ) => {
    const patch = {
      itemName: item.name,
      unitPrice: type === "PRODUCT" ? item.price : item.basePrice,
      productId: type === "PRODUCT" ? item.id : undefined,
      serviceTypeId: type === "SERVICE" ? item.id : undefined,
    };
    onUpdateRow(rowId, patch);
    setActiveSelector(null); // Close selector after selection
  };

  if (!items || items.length === 0) {
    return (
      <div className="bg-blue-50 border-2 border-dashed rounded-lg p-8 text-center text-gray-500">
        <p className="font-semibold">هیچ آیتمی به فاکتور اضافه نشده است.</p>
        <Button variant="ghost" onClick={addEmptyRow} className="mt-4">
          <DIcon icon="fa-plus" cdi={false} classCustom="ml-2" />
          افزودن اولین سطر
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead className="bg-base-200">
          <tr>
            <th>#</th>
            <th style={{ width: "30%" }}>شرح</th>
            <th>تعداد</th>
            <th>قیمت واحد</th>
            <th>تخفیف(%)</th>
            <th>مبلغ کل</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id} className="hover">
              <th>{index + 1}</th>
              <td>
                <Input
                  value={item.itemName || ""}
                  onChange={(e) =>
                    onUpdateRow(item.id, { itemName: e.target.value })
                  }
                  placeholder="نام محصول یا خدمت"
                  name={""}
                />
                <div className="flex gap-1 mt-1">
                  <ButtonSelectWithTable
                    name={`product_selector_${item.id}`}
                    //  label={<DIcon icon="fa-box" cdi={false} />}
                    columns={productColumns}
                    data={products}
                    onSelect={(p) => handleSelect(item.id, p, "PRODUCT")}
                    selectionMode="single"
                    //     isIcon
                  />
                  <ButtonSelectWithTable
                    name={`service_selector_${item.id}`}
                    //  label={<DIcon icon="fa-cogs" cdi={false} />}
                    columns={serviceTypeColumns}
                    data={services}
                    onSelect={(s) => handleSelect(item.id, s, "SERVICE")}
                    selectionMode="single"
                    //    isIcon
                  />
                </div>
              </td>
              <td>
                <Input
                  type="number"
                  name={""}
                  value={item.quantity || 1}
                  onChange={(e) =>
                    onUpdateRow(item.id, { quantity: e.target.value })
                  }
                  className="w-24 text-center"
                />
              </td>
              <td>
                <Input
                  type="number"
                  name={""}
                  value={item.unitPrice || 0}
                  onChange={(e) =>
                    onUpdateRow(item.id, { unitPrice: e.target.value })
                  }
                  className="w-32 text-center"
                />
              </td>
              <td>
                <Input
                  type="number"
                  name={""}
                  value={item.discountPercent || 0}
                  onChange={(e) =>
                    onUpdateRow(item.id, { discountPercent: e.target.value })
                  }
                  className="w-24 text-center"
                />
              </td>
              <td className="text-center font-medium">
                {(item.total || 0).toLocaleString()}
              </td>
              <td>
                <Button
                  variant="ghost"
                  size="sm"
                  className="btn-circle text-error"
                  onClick={() => onRemoveRow(item.id)}
                >
                  <DIcon icon="fa-trash" cdi={false} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4">
        <Button variant="ghost" onClick={addEmptyRow}>
          <DIcon icon="fa-plus" cdi={false} classCustom="ml-2" />
          افزودن سطر جدید
        </Button>
      </div>
    </div>
  );
}

// "use client";

// import DIcon from "@/@Client/Components/common/DIcon";
// import { Button } from "ndui-ahrom";

// interface InvoiceItemsProps {
//   items: any[];
//   onRemove: (index: number) => void;
// }

// export default function InvoiceItems({ items, onRemove }: InvoiceItemsProps) {
//   if (!items || items.length === 0) {
//     return (
//       <div className="bg-blue-50 border-2 border-dashed rounded-lg p-8 text-center text-gray-500">
//         <p className="font-semibold">هیچ آیتمی به فاکتور اضافه نشده است.</p>
//         <p className="text-sm mt-2">
//           برای شروع، از بخش افزودن آیتم‌های فاکتور یک مورد جدید اضافه کنید.
//         </p>
//       </div>
//     );
//   }

//   const getItemTypeLabel = (type: string) => {
//     switch (type) {
//       case "PRODUCT":
//         return "محصول";
//       case "SERVICE":
//         return "خدمت";
//       case "ACTUALSERVICE":
//         return "زیر خدمت";
//       default:
//         return "متفرقه";
//     }
//   };

//   return (
//     <div className="card bg-base-100 shadow-md border">
//       <div className="card-body">
//         <h3 className="card-title text-lg font-semibold">لیست آیتم‌ها</h3>
//         <div className="overflow-x-auto mt-4">
//           <table className="table w-full">
//             <thead className="bg-base-200">
//               <tr>
//                 <th className="text-right">#</th>
//                 <th className="text-right">نوع</th>
//                 <th className="text-right">شرح</th>
//                 <th className="text-center">تعداد</th>
//                 <th className="text-center">قیمت واحد</th>
//                 <th className="text-center">مبلغ کل</th>
//                 <th></th>
//               </tr>
//             </thead>
//             <tbody>
//               {items.map((item, index) => (
//                 <tr key={index} className="hover">
//                   <th>{index + 1}</th>
//                   <td>
//                     <span className="badge badge-ghost badge-sm">
//                       {getItemTypeLabel(item.itemType)}
//                     </span>
//                   </td>
//                   <td>{item.itemName || item.description}</td>
//                   <td className="text-center">{item.quantity}</td>
//                   <td className="text-center">
//                     {(item.price || 0).toLocaleString()}
//                   </td>
//                   <td className="text-center font-medium">
//                     {(
//                       (item.price || 0) * (item.quantity || 0)
//                     ).toLocaleString()}{" "}
//                     تومان
//                   </td>
//                   <td>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       className="btn-circle text-error"
//                       onClick={() => onRemove(index)}
//                     >
//                       <DIcon icon="fa-trash" cdi={false} />
//                     </Button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }
