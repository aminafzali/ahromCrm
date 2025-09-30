// src/app/workspaces/page.tsx
// src/app/workspaces/page.tsx
"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { Button } from "ndui-ahrom";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function WorkspacesHubPage() {
  const {
    workspaces = [],
    setActiveWorkspace,
    refetchWorkspaces,
  } = useWorkspace();

  const router = useRouter();
  const { status } = useSession();

  // پرچم برای جلوگیری از چندبار refetch/refresh
  const didAttemptRefetch = useRef(false);

  // 1) وقتی کاربر لاگین شد و لیست خالی است، فقط یک‌بار و بدون بلاک‌کردن UI refetch کن
  useEffect(() => {
    if (
      status === "authenticated" &&
      Array.isArray(workspaces) &&
      workspaces.length === 0 &&
      !didAttemptRefetch.current
    ) {
      didAttemptRefetch.current = true;
      refetchWorkspaces().catch((e) =>
        console.error("refetchWorkspaces on auth failed:", e)
      );
    }
  }, [status, workspaces, refetchWorkspaces]);

  // فقط زمانی که سشن هنوز در حال بارگذاری است، لودینگ نشان بده
  if (status === "loading") return <Loading />;

  const handleSelect = (ws: any) => {
    try {
      setActiveWorkspace?.(ws);
    } catch (e) {
      console.error("setActiveWorkspace error:", e);
    }

    const roleName = ws?.role?.name ?? ws?.roleName;
    if (roleName === "Admin") {
      router.push("/dashboard");
    } else {
      router.push("/panel");
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
            انتخاب فضای کاری
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            برای ادامه، وارد یکی از فضاهای کاری خود شوید یا یک فضای جدید بسازید.
          </p>
        </div>

        {Array.isArray(workspaces) && workspaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((ws: any, idx: number) => (
              <button
                key={ws.workspaceId ?? ws.id ?? idx}
                type="button"
                className="group bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 text-right flex flex-col"
                onClick={() => handleSelect(ws)}
              >
                <div className="flex-grow">
                  <div className="p-3 bg-teal-100 dark:bg-teal-900/50 rounded-lg w-fit mb-4">
                    <DIcon
                      icon="fa-building"
                      cdi={false}
                      classCustom="text-2xl text-teal-600 dark:text-teal-400"
                    />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                    {ws?.workspace?.name ?? ws?.name ?? "-"}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    نقش شما:{" "}
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {(ws?.role?.name ?? ws?.roleName) === "Admin"
                        ? "مدیر"
                        : "کاربر عادی"}
                    </span>
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-end text-teal-600 dark:text-teal-400 font-semibold">
                  <span>ورود به فضای کاری</span>
                  <DIcon
                    icon="fa-arrow-left"
                    cdi={false}
                    classCustom="mr-2 transform transition-transform duration-300 group-hover:-translate-x-1"
                  />
                </div>
              </button>
            ))}

            <button
              type="button"
              className="group border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-300 p-6 flex flex-col items-center justify-center text-slate-500"
              onClick={() => router.push("/workspaces/create")}
            >
              <DIcon
                icon="fa-plus"
                cdi={false}
                classCustom="text-3xl mb-2 transition-transform duration-300 group-hover:scale-110"
              />
              <span className="font-semibold">ساخت فضای کاری جدید</span>
            </button>
          </div>
        ) : (
          <div className="text-center bg-white dark:bg-slate-800 rounded-xl shadow-md p-10">
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              شما هنوز هیچ ورک‌اسپیسی نساخته‌اید یا به آن دعوت نشده‌اید.
            </p>
            <Button
              className="btn btn-primary btn-lg"
              onClick={() => router.push("/workspaces/create")}
            >
              <DIcon icon="fa-plus" cdi={false} classCustom="me-2" />
              ساخت اولین ورک‌اسپیس
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// "use client";

// import DIcon from "@/@Client/Components/common/DIcon";
// import Loading from "@/@Client/Components/common/Loading";
// import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
// import { Button } from "ndui-ahrom";
// import { useRouter } from "next/navigation";
// import { useEffect, useRef } from "react";

// export default function WorkspacesHubPage() {
//   const {
//     workspaces = [],
//     setActiveWorkspace,
//     isLoading,
//     refetchWorkspaces,
//   } = useWorkspace();
//   const router = useRouter();

//   // جلوگیری از تلاش‌های مکرر refetch
//   const didAttemptRefetch = useRef(false);

//   // اگر بعد از لاگین یا ناوبری workspaces هنوز خالیه، یکبار تلاش کن refetch کنی
//   useEffect(() => {
//     if (
//       !isLoading &&
//       Array.isArray(workspaces) &&
//       workspaces.length === 0 &&
//       !didAttemptRefetch.current
//     ) {
//       didAttemptRefetch.current = true;
//       (async () => {
//         try {
//           await refetchWorkspaces();
//         } catch (e) {
//           console.error("refetchWorkspaces on mount failed:", e);
//         }
//       })();
//     }
//   }, [isLoading, workspaces, refetchWorkspaces]);

//   if (isLoading) {
//     return <Loading />;
//   }

//   const handleSelect = (ws: any) => {
//     try {
//       setActiveWorkspace?.(ws);
//     } catch (e) {
//       console.error("setActiveWorkspace error:", e);
//     }

//     const roleName = ws?.role?.name ?? ws?.roleName;
//     if (roleName === "Admin") {
//       router.push("/dashboard");
//     } else {
//       router.push("/panel");
//     }
//   };

//   return (
//     <div className="bg-slate-50 dark:bg-slate-900 min-h-screen flex items-center justify-center p-4">
//       <div className="w-full max-w-4xl">
//         <div className="text-center mb-8">
//           <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
//             انتخاب فضای کاری
//           </h2>
//           <p className="text-slate-500 dark:text-slate-400 mt-2">
//             برای ادامه، وارد یکی از فضاهای کاری خود شوید یا یک فضای جدید بسازید.
//           </p>
//         </div>

//         {Array.isArray(workspaces) && workspaces.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {workspaces.map((ws: any, idx: number) => (
//               <button
//                 key={ws.workspaceId ?? ws.id ?? idx}
//                 type="button"
//                 className="group bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 text-right flex flex-col"
//                 onClick={() => handleSelect(ws)}
//               >
//                 <div className="flex-grow">
//                   <div className="p-3 bg-teal-100 dark:bg-teal-900/50 rounded-lg w-fit mb-4">
//                     <DIcon
//                       icon="fa-building"
//                       cdi={false}
//                       classCustom="text-2xl text-teal-600 dark:text-teal-400"
//                     />
//                   </div>
//                   <h3 className="font-bold text-lg text-slate-800 dark:text-white">
//                     {ws?.workspace?.name ?? ws?.name ?? "-"}
//                   </h3>
//                   <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
//                     نقش شما:{" "}
//                     <span className="font-semibold text-slate-600 dark:text-slate-300">
//                       {(ws?.role?.name ?? ws?.roleName) === "Admin"
//                         ? "مدیر"
//                         : "کاربر عادی"}
//                     </span>
//                   </p>
//                 </div>
//                 <div className="mt-6 flex items-center justify-end text-teal-600 dark:text-teal-400 font-semibold">
//                   <span>ورود به فضای کاری</span>
//                   <DIcon
//                     icon="fa-arrow-left"
//                     cdi={false}
//                     classCustom="mr-2 transform transition-transform duration-300 group-hover:-translate-x-1"
//                   />
//                 </div>
//               </button>
//             ))}

//             <button
//               type="button"
//               className="group border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-300 p-6 flex flex-col items-center justify-center text-slate-500"
//               onClick={() => router.push("/workspaces/create")}
//             >
//               <DIcon
//                 icon="fa-plus"
//                 cdi={false}
//                 classCustom="text-3xl mb-2 transition-transform duration-300 group-hover:scale-110"
//               />
//               <span className="font-semibold">ساخت فضای کاری جدید</span>
//             </button>
//           </div>
//         ) : (
//           <div className="text-center bg-white dark:bg-slate-800 rounded-xl shadow-md p-10">
//             <p className="text-slate-500 dark:text-slate-400 mb-6">
//               شما هنوز هیچ ورک‌اسپیسی نساخته‌اید یا به آن دعوت نشده‌اید.
//             </p>
//             <Button
//               className="btn btn-primary btn-lg"
//               onClick={() => router.push("/workspaces/create")}
//             >
//               <DIcon icon="fa-plus" cdi={false} classCustom="me-2" />
//               ساخت اولین ورک‌اسپیس
//             </Button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // src/app/workspaces/page.tsx

// "use client";

// import DIcon from "@/@Client/Components/common/DIcon";
// import Loading from "@/@Client/Components/common/Loading";
// import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
// import { Button } from "ndui-ahrom";
// import { useRouter } from "next/navigation";

// export default function WorkspacesHubPage() {
//   // مقدار پیش‌فرض برای workspaces تا از undefined جلوگیری شود
//   const { workspaces = [], setActiveWorkspace, isLoading } = useWorkspace();
//   const router = useRouter();

//   if (isLoading) {
//     return <Loading />;
//   }

//   const handleSelect = (ws: any) => {
//     // محافظت در برابر خطاهای احتمالی توابع provider
//     try {
//       setActiveWorkspace?.(ws);
//     } catch (e) {
//       console.error("setActiveWorkspace error:", e);
//     }

//     // دسترسی ایمن به نقش
//     const roleName = ws?.role?.name;
//     if (roleName === "Admin") {
//       router.push("/dashboard");
//     } else {
//       router.push("/panel");
//     }
//   };

//   return (
//     <div className="bg-slate-50 dark:bg-slate-900 min-h-screen flex items-center justify-center p-4">
//       <div className="w-full max-w-4xl">
//         <div className="text-center mb-8">
//           <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
//             انتخاب فضای کاری
//           </h2>
//           <p className="text-slate-500 dark:text-slate-400 mt-2">
//             برای ادامه، وارد یکی از فضاهای کاری خود شوید یا یک فضای جدید بسازید.
//           </p>
//         </div>

//         {Array.isArray(workspaces) && workspaces.length > 0 ? (
//           // چیدمان گرید برای نمایش کارت‌ها
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {workspaces.map((ws: any, idx: number) => (
//               <button
//                 key={ws.workspaceId ?? ws.id ?? idx}
//                 type="button"
//                 className="group bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 text-right flex flex-col"
//                 onClick={() => handleSelect(ws)}
//               >
//                 <div className="flex-grow">
//                   {/* آیکون ساختمان برای زیبایی بیشتر */}
//                   <div className="p-3 bg-teal-100 dark:bg-teal-900/50 rounded-lg w-fit mb-4">
//                     <DIcon
//                       icon="fa-building"
//                       cdi={false}
//                       classCustom="text-2xl text-teal-600 dark:text-teal-400"
//                     />
//                   </div>
//                   <h3 className="font-bold text-lg text-slate-800 dark:text-white">
//                     {/* دسترسی ایمن به نام ورک‌اسپیس */}
//                     {ws?.workspace?.name ?? ws?.name ?? "-"}
//                   </h3>
//                   <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
//                     نقش شما:{" "}
//                     <span className="font-semibold text-slate-600 dark:text-slate-300">
//                       {ws?.role?.name === "Admin" ? "مدیر" : "کاربر عادی"}
//                     </span>
//                   </p>
//                 </div>
//                 <div className="mt-6 flex items-center justify-end text-teal-600 dark:text-teal-400 font-semibold">
//                   <span>ورود به فضای کاری</span>
//                   <DIcon
//                     icon="fa-arrow-left"
//                     cdi={false}
//                     classCustom="mr-2 transform transition-transform duration-300 group-hover:-translate-x-1"
//                   />
//                 </div>
//               </button>
//             ))}

//             {/* کارت مخصوص ساخت ورک‌اسپیس جدید */}
//             <button
//               type="button"
//               className="group border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-300 p-6 flex flex-col items-center justify-center text-slate-500"
//               onClick={() => router.push("/workspaces/create")}
//             >
//               <DIcon
//                 icon="fa-plus"
//                 cdi={false}
//                 classCustom="text-3xl mb-2 transition-transform duration-300 group-hover:scale-110"
//               />
//               <span className="font-semibold">ساخت فضای کاری جدید</span>
//             </button>
//           </div>
//         ) : (
//           // حالت زمانی که هیچ ورک‌اسپیسی وجود ندارد
//           <div className="text-center bg-white dark:bg-slate-800 rounded-xl shadow-md p-10">
//             <p className="text-slate-500 dark:text-slate-400 mb-6">
//               شما هنوز هیچ ورک‌اسپیسی نساخته‌اید یا به آن دعوت نشده‌اید.
//             </p>
//             <Button
//               className="btn btn-primary btn-lg"
//               onClick={() => router.push("/workspaces/create")}
//             >
//               <DIcon icon="fa-plus" cdi={false} classCustom="me-2" />
//               ساخت اولین ورک‌اسپیس
//             </Button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // // مسیر فایل: src/app/workspaces/page.tsx

// // //"use client";

// // import DIcon from "@/@Client/Components/common/DIcon";
// // import Loading from "@/@Client/Components/common/Loading";
// // import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
// // import { Button } from "ndui-ahrom";
// // import { useRouter } from "next/navigation";

// // export default function WorkspacesHubPage() {
// //   const { workspaces, setActiveWorkspace, isLoading } = useWorkspace();
// //   const router = useRouter();

// //   if (isLoading) {
// //     return <Loading />;
// //   }

// //   const handleSelect = (ws: any) => {
// //     setActiveWorkspace(ws);
// //     if (ws.role.name === "Admin") {
// //       router.push("/dashboard");
// //     } else {
// //       router.push("/panel");
// //     }
// //   };

// //   return (
// //     <div className="bg-slate-50 dark:bg-slate-900 min-h-screen flex items-center justify-center p-4">
// //       <div className="w-full max-w-4xl">
// //         <div className="text-center mb-8">
// //           <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
// //             انتخاب فضای کاری
// //           </h2>
// //           <p className="text-slate-500 dark:text-slate-400 mt-2">
// //             برای ادامه، وارد یکی از فضاهای کاری خود شوید یا یک فضای جدید بسازید.
// //           </p>
// //         </div>

// //         {workspaces.length > 0 ? (
// //           // چیدمان گرید برای نمایش کارت‌ها
// //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// //             {workspaces.map((ws) => (
// //               <button
// //                 key={ws.workspaceId}
// //                 type="button"
// //                 className="group bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 text-right flex flex-col"
// //                 onClick={() => handleSelect(ws)}
// //               >
// //                 <div className="flex-grow">
// //                   {/* آیکون ساختمان برای زیبایی بیشتر */}
// //                   <div className="p-3 bg-teal-100 dark:bg-teal-900/50 rounded-lg w-fit mb-4">
// //                     <DIcon
// //                       icon="fa-building"
// //                       cdi={false}
// //                       classCustom="text-2xl text-teal-600 dark:text-teal-400"
// //                     />
// //                   </div>
// //                   <h3 className="font-bold text-lg text-slate-800 dark:text-white">
// //                     {ws.workspace.name}
// //                   </h3>
// //                   <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
// //                     نقش شما:{" "}
// //                     <span className="font-semibold text-slate-600 dark:text-slate-300">
// //                       {ws.role.name === "Admin" ? "مدیر" : "کاربر عادی"}
// //                     </span>
// //                   </p>
// //                 </div>
// //                 <div className="mt-6 flex items-center justify-end text-teal-600 dark:text-teal-400 font-semibold">
// //                   <span>ورود به فضای کاری</span>
// //                   <DIcon
// //                     icon="fa-arrow-left"
// //                     cdi={false}
// //                     classCustom="mr-2 transform transition-transform duration-300 group-hover:-translate-x-1"
// //                   />
// //                 </div>
// //               </button>
// //             ))}

// //             {/* کارت مخصوص ساخت ورک‌اسپیس جدید */}
// //             <button
// //               type="button"
// //               className="group border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-300 p-6 flex flex-col items-center justify-center text-slate-500"
// //               onClick={() => router.push("/workspaces/create")}
// //             >
// //               <DIcon
// //                 icon="fa-plus"
// //                 cdi={false}
// //                 classCustom="text-3xl mb-2 transition-transform duration-300 group-hover:scale-110"
// //               />
// //               <span className="font-semibold">ساخت فضای کاری جدید</span>
// //             </button>
// //           </div>
// //         ) : (
// //           // حالت زمانی که هیچ ورک‌اسپیسی وجود ندارد
// //           <div className="text-center bg-white dark:bg-slate-800 rounded-xl shadow-md p-10">
// //             <p className="text-slate-500 dark:text-slate-400 mb-6">
// //               شما هنوز هیچ ورک‌اسپیسی نساخته‌اید یا به آن دعوت نشده‌اید.
// //             </p>
// //             <Button
// //               className="btn btn-primary btn-lg"
// //               onClick={() => router.push("/workspaces/create")}
// //             >
// //               <DIcon icon="fa-plus" cdi={false} classCustom="me-2" />
// //               ساخت اولین ورک‌اسپیس
// //             </Button>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }
