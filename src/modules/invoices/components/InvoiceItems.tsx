"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { Button } from "ndui-ahrom";

interface InvoiceItemsProps {
  items: any[];
  onRemove: (index: number) => void;
}

export default function InvoiceItems({ items, onRemove }: InvoiceItemsProps) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-blue-50 border-2 border-dashed rounded-lg p-8 text-center text-gray-500">
        <p className="font-semibold">هیچ آیتمی به فاکتور اضافه نشده است.</p>
        <p className="text-sm mt-2">
          برای شروع، از بخش افزودن آیتم‌های فاکتور یک مورد جدید اضافه کنید.
        </p>
      </div>
    );
  }

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case "PRODUCT":
        return "محصول";
      case "SERVICE":
        return "خدمت";
      case "ACTUALSERVICE":
        return "زیر خدمت";
      default:
        return "متفرقه";
    }
  };

  return (
    <div className="card bg-base-100 shadow-md border">
      <div className="card-body">
        <h3 className="card-title text-lg font-semibold">لیست آیتم‌ها</h3>
        <div className="overflow-x-auto mt-4">
          <table className="table w-full">
            <thead className="bg-base-200">
              <tr>
                <th className="text-right">#</th>
                <th className="text-right">نوع</th>
                <th className="text-right">شرح</th>
                <th className="text-center">تعداد</th>
                <th className="text-center">قیمت واحد</th>
                <th className="text-center">مبلغ کل</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="hover">
                  <th>{index + 1}</th>
                  <td>
                    <span className="badge badge-ghost badge-sm">
                      {getItemTypeLabel(item.itemType)}
                    </span>
                  </td>
                  <td>{item.itemName || item.description}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-center">
                    {(item.price || 0).toLocaleString()}
                  </td>
                  <td className="text-center font-medium">
                    {(
                      (item.price || 0) * (item.quantity || 0)
                    ).toLocaleString()}{" "}
                    تومان
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="btn-circle text-error"
                      onClick={() => onRemove(index)}
                    >
                      <DIcon icon="fa-trash" cdi={false} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// import DIcon from "@/@Client/Components/common/DIcon";
// import { Button } from "ndui-ahrom";

// interface InvoiceItemsProps {
//   items: any[];
//   onRemove: (index: number) => void;
// }

// export default function InvoiceItems({ items, onRemove }: InvoiceItemsProps) {
//   if (items.length === 0) {
//     return (
//       <div className="bg-teal-50 border-2 border-dashed rounded-lg p-8 text-center text-gray-500">
//         هیچ آیتمی به فاکتور اضافه نشده است
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
//         return "متن آزاد";
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg border">
//       <div className="overflow-x-auto">
//         <table className="w-full text-sm">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-4 py-2 text-right">#</th>
//               <th className="px-4 py-2 text-right">نوع</th>
//               <th className="px-4 py-2 text-right">شرح</th>
//               <th className="px-4 py-2 text-right">تعداد</th>
//               <th className="px-4 py-2 text-right">قیمت واحد (تومان)</th>
//               <th className="px-4 py-2 text-right">جمع (تومان)</th>
//               <th className="px-4 py-2"></th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.map((item, index) => (
//               <tr key={index} className="border-t">
//                 <td className="px-4 py-2">{index + 1}</td>
//                 <td className="px-4 py-2">{getItemTypeLabel(item.itemType)}</td>
//                 <td className="px-4 py-2">{item.description}</td>
//                 <td className="px-4 py-2">{item.quantity}</td>
//                 <td className="px-4 py-2">{item.price.toLocaleString()}</td>

//                 <td className="px-4 py-2">
//                   {(item.price * item.quantity).toLocaleString()}
//                 </td>
//                 <td className="px-4 py-2">
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => onRemove(index)}
//                     className="text-error"
//                     icon={<DIcon icon="fa-trash" cdi={false} />}
//                   />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
