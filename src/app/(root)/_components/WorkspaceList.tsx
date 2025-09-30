// // src/app/(root)/_components/WorkspaceList.tsx

// src/app/(root)/_components/WorkspaceList.tsx
import DIcon from "@/@Client/Components/common/DIcon";
import type { Workspace } from "@prisma/client";
import Link from "next/link";

interface WorkspaceListProps {
  workspaces: Partial<Workspace>[];
}

export default function WorkspaceList({ workspaces }: WorkspaceListProps) {
  if (!workspaces || workspaces.length === 0) return null;

  return (
    <section className="py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold">فضای کاری مشتریان ما</h2>
        <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
          نمونه‌هایی از فضای کاری ساخته شده با پنل اهرم — طراحی حرفه‌ای و تجربه
          کاربری روان.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((ws) => (
          // className و ساختار را مستقیماً روی Link می‌گذاریم — دیگر <a> داخلی نداریم
          <Link
            key={ws.id}
            href={`/${ws.slug ?? "#"}`}
            className="group block no-underline"
          >
            <div className="relative rounded-xl overflow-hidden bg-white border p-4 shadow-sm hover:shadow-lg transition">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-teal-100 to-white flex items-center justify-center text-2xl">
                  <span className="font-bold text-teal-700">
                    {(ws.name || "—")
                      .toString()
                      .split(" ")
                      .map((s) => s[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {ws.name}
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-3">
                    {ws.description || "برای مشاهده جزئیات بیشتر کلیک کنید."}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      نمایش فضای کاری
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-teal-600 font-medium text-sm">
                        بازدید
                      </span>
                      <DIcon
                        icon="fa-arrow-left"
                        cdi={false}
                        classCustom="text-teal-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-teal-100 to-transparent opacity-0 group-hover:opacity-100 transition" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// import DIcon from "@/@Client/Components/common/DIcon";
// import type { Workspace } from "@prisma/client";
// import Link from "next/link";

// interface WorkspaceListProps {
//   workspaces: Partial<Workspace>[];
// }

// export default function WorkspaceList({ workspaces }: WorkspaceListProps) {
//   if (!workspaces || workspaces.length === 0) return null;

//   return (
//     <section className="py-12">
//       <div className="text-center mb-10">
//         <h2 className="text-3xl font-extrabold">وب‌سایت مشتریان ما</h2>
//         <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
//           نمونه‌هایی از وب‌سایت‌های ساخته شده با پنل اهرم — طراحی حرفه‌ای و
//           تجربه کاربری روان.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {workspaces.map((ws) => (
//           <Link key={ws.id} href={`/${ws.slug ?? "#"}`}>
//             <a className="group block">
//               <div className="relative rounded-xl overflow-hidden bg-white border p-4 shadow-sm hover:shadow-lg transition">
//                 <div className="flex items-start gap-4">
//                   <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-teal-100 to-white flex items-center justify-center text-2xl">
//                     {/* initials fallback */}
//                     <span className="font-bold text-teal-700">
//                       {(ws.name || "—")
//                         .toString()
//                         .split(" ")
//                         .map((s) => s[0])
//                         .slice(0, 2)
//                         .join("")}
//                     </span>
//                   </div>

//                   <div className="flex-1">
//                     <h3 className="text-lg font-semibold text-slate-900">
//                       {ws.name}
//                     </h3>
//                     <p className="text-sm text-slate-600 mt-2 line-clamp-3">
//                       {ws.description || "برای مشاهده جزئیات بیشتر کلیک کنید."}
//                     </p>

//                     <div className="mt-4 flex items-center justify-between">
//                       <div className="text-xs text-slate-500">
//                         نمایش وب‌سایت
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <span className="text-teal-600 font-medium text-sm">
//                           بازدید
//                         </span>
//                         <DIcon
//                           icon="fa-arrow-left"
//                           cdi={false}
//                           classCustom="text-teal-500"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-teal-100 to-transparent opacity-0 group-hover:opacity-100 transition" />
//               </div>
//             </a>
//           </Link>
//         ))}
//       </div>
//     </section>
//   );
// }

// // import DIcon from "@/@Client/Components/common/DIcon";
// // import type { Workspace } from "@prisma/client"; // تایپ Workspace را از Prisma وارد کنید
// // import Link from "next/link";

// // interface WorkspaceListProps {
// //   workspaces: Partial<Workspace>[]; // ما فقط به بخشی از فیلدها نیاز داریم
// // }

// // export default function WorkspaceList({ workspaces }: WorkspaceListProps) {
// //   if (workspaces.length === 0) {
// //     return null; // اگر ورک‌اسپیسی وجود نداشت، این بخش را نمایش نده
// //   }

// //   return (
// //     <section className="py-20 px-3">
// //       <div className="text-center mb-12">
// //         <h2 className="text-3xl font-bold">وب‌سایت مشتریان ما</h2>
// //         <p className="text-base-content/70 mt-2">
// //           نمونه‌ای از وب‌سایت‌های ایجاد شده با پنل اهرم را مشاهده کنید.
// //         </p>
// //       </div>
// //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// //         {workspaces.map((ws) => (
// //           <Link key={ws.id} href={`/${ws.slug}`}>
// //             <div className="card bg-white border h-full hover:border-primary transition-colors">
// //               <div className="card-body">
// //                 <h3 className="card-title">{ws.name}</h3>
// //                 <p className="flex-grow">
// //                   {ws.description || "برای مشاهده جزئیات بیشتر کلیک کنید."}
// //                 </p>
// //                 <div className="card-actions justify-end mt-4">
// //                   <span className="btn btn-sm btn-ghost text-primary">
// //                     مشاهده وب‌سایت
// //                     <DIcon
// //                       icon="fa-arrow-left"
// //                       cdi={false}
// //                       classCustom="mr-2"
// //                     />
// //                   </span>
// //                 </div>
// //               </div>
// //             </div>
// //           </Link>
// //         ))}
// //       </div>
// //     </section>
// //   );
// // }
