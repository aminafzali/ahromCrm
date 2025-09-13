"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { InvoiceItem } from "@prisma/client";
import { Button } from "ndui-ahrom";
import { useState } from "react";

interface InvoiceItemsViewProps {
  items: InvoiceItem[];
}

export default function InvoiceItemsView({ items }: InvoiceItemsViewProps) {
  const [mode, setMode] = useState<"table" | "card">("table");

  if (!items || items.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        هیچ آیتمی برای این فاکتور ثبت نشده است.
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="card-title text-lg">آیتم‌های فاکتور</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === "table" ? "primary" : "ghost"}
            onClick={() => setMode("table")}
            title="نمایش جدولی"
            className="hidden md:inline-flex" // فقط در دسکتاپ
          >
            <DIcon icon="fa-list" cdi={false} />
          </Button>
          <Button
            size="sm"
            variant={mode === "card" ? "primary" : "ghost"}
            onClick={() => setMode("card")}
            title="نمایش کارتی"
            className="hidden md:inline-flex" // فقط در دسکتاپ
          >
            <DIcon icon="fa-th-large" cdi={false} />
          </Button>
        </div>
      </div>

      {/* --- نمایش جدولی برای دسکتاپ --- */}
      <div className="overflow-x-auto rounded-md border hidden md:block">
        <table className="min-w-full w-full text-sm">
          <thead className="bg-base-200 text-right sticky top-0">
            <tr>
              <th className="p-3 w-10">#</th>
              <th className="p-3 w-40">نام</th>
              <th className="p-3">شرح</th>
              <th className="p-3 w-24 text-center">تعداد</th>
              <th className="p-3 w-32 text-center">قیمت واحد</th>
              <th className="p-3 w-36 text-left">مبلغ کل</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r, i) => (
              <tr key={r.id} className="border-t align-top hover:bg-base-100">
                <td className="p-3">{i + 1}</td>
                <td className="p-3 font-medium">{r.itemName}</td>
                <td className="p-3 text-gray-600">{r.description}</td>
                <td className="p-3 text-center">{r.quantity}</td>
                <td className="p-3 text-center">
                  {r.unitPrice.toLocaleString()}
                </td>
                <td className="p-3 font-semibold text-left">
                  {r.total.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- نمایش کارتی برای موبایل --- */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {items.map((r, idx) => (
          <div key={r.id} className="p-4 border rounded-lg shadow-sm bg-white">
            <div className="flex justify-between items-start gap-2">
              <div>
                <div className="font-bold">{r.itemName}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {r.description}
                </div>
              </div>
              <div className="font-semibold text-lg text-primary">
                {r.total.toLocaleString()}
              </div>
            </div>
            <div className="border-t mt-3 pt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">تعداد: </span>
                <span className="font-medium">{r.quantity}</span>
              </div>
              <div>
                <span className="text-gray-500">قیمت واحد: </span>
                <span className="font-medium">
                  {r.unitPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// "use client";

// import DIcon from "@/@Client/Components/common/DIcon";
// import { InvoiceItem } from "@prisma/client";
// import { Button } from "ndui-ahrom";
// import { useState } from "react";

// interface InvoiceItemsViewProps {
//   items: InvoiceItem[];
// }

// export default function InvoiceItemsView({ items }: InvoiceItemsViewProps) {
//   const [mode, setMode] = useState<"table" | "card">("table");

//   return (
//     <div className="card-body p-4">
//       <div className="flex justify-between items-center mb-4">
//         <h3 className="card-title text-lg">آیتم‌های فاکتور</h3>
//         <div className="flex gap-2">
//           <Button
//             size="sm"
//             variant={mode === "table" ? "primary" : "ghost"}
//             onClick={() => setMode("table")}
//             title="نمایش جدولی"
//           >
//             <DIcon icon="fa-list" cdi={false} />
//           </Button>
//           <Button
//             size="sm"
//             variant={mode === "card" ? "primary" : "ghost"}
//             onClick={() => setMode("card")}
//             title="نمایش کارتی"
//           >
//             <DIcon icon="fa-th-large" cdi={false} />
//           </Button>
//         </div>
//       </div>

//       {/* --- نمایش جدولی برای دسکتاپ --- */}
//       {mode === "table" ? (
//         <div className="overflow-x-auto rounded-md border hidden md:block">
//           <table className="min-w-full w-full text-sm">
//             <thead className="bg-base-200 text-right sticky top-0">
//               <tr>
//                 <th className="p-3 w-10">#</th>
//                 <th className="p-3 w-40">نام</th>
//                 <th className="p-3">شرح</th>
//                 <th className="p-3 w-24 text-center">تعداد</th>
//                 <th className="p-3 w-32 text-center">قیمت واحد</th>
//                 <th className="p-3 w-36 text-left">مبلغ کل</th>
//               </tr>
//             </thead>
//             <tbody>
//               {items.map((r, i) => (
//                 <tr key={r.id} className="border-t align-top hover:bg-base-100">
//                   <td className="p-3">{i + 1}</td>
//                   <td className="p-3 font-medium">{r.itemName}</td>
//                   <td className="p-3 text-gray-600">{r.description}</td>
//                   <td className="p-3 text-center">{r.quantity}</td>
//                   <td className="p-3 text-center">
//                     {r.unitPrice.toLocaleString()}
//                   </td>
//                   <td className="p-3 font-semibold text-left">
//                     {r.total.toLocaleString()}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : null}

//       {/* --- نمایش کارتی برای موبایل --- */}
//       {mode === "card" || (mode === "table" && "md:hidden") ? (
//         <div
//           className={`grid grid-cols-1 gap-4 ${
//             mode === "table" ? "md:hidden" : ""
//           }`}
//         >
//           {items.map((r, idx) => (
//             <div
//               key={r.id}
//               className="p-4 border rounded-lg shadow-sm bg-white"
//             >
//               <div className="flex justify-between items-start gap-2">
//                 <div>
//                   <div className="font-bold">{r.itemName}</div>
//                   <div className="text-xs text-gray-500 mt-1">
//                     {r.description}
//                   </div>
//                 </div>
//                 <div className="font-semibold text-lg text-primary">
//                   {r.total.toLocaleString()}
//                 </div>
//               </div>
//               <div className="border-t mt-3 pt-3 grid grid-cols-2 gap-2 text-sm">
//                 <div>
//                   <span className="text-gray-500">تعداد: </span>
//                   <span className="font-medium">{r.quantity}</span>
//                 </div>
//                 <div>
//                   <span className="text-gray-500">قیمت واحد: </span>
//                   <span className="font-medium">
//                     {r.unitPrice.toLocaleString()}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : null}
//     </div>
//   );
// }
