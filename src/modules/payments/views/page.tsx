// مسیر فایل: src/modules/payments/views/page.tsx

"use client";

import Loading from "@/@Client/Components/common/Loading";
import { TabsWrapper } from "@/@Client/Components/wrappers";
import DataTableWrapper from "@/@Client/Components/wrappers/DataTableWrapper";
import { FilterOption } from "@/@Client/types";
import CategoryTree from "@/modules/payment-categories/components/CategoryTree";
import { usePaymentCategory } from "@/modules/payment-categories/hooks/usePaymentCategory";
import { usePaymentCategoryTree } from "@/modules/payment-categories/hooks/usePaymentCategoryTree";
import { PaymentCategoryWithRelations } from "@/modules/payment-categories/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { columnsForAdmin, listItemRender } from "../data/table";
import { usePayment } from "../hooks/usePayment";
import { PaymentWithRelations } from "../types";

const getDescendantIds = (
  categoryId: number,
  allCategories: PaymentCategoryWithRelations[]
): number[] => {
  const descendantIds: number[] = [categoryId];
  const queue: number[] = [categoryId];
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = allCategories.filter((cat) => cat.parentId === currentId);
    for (const child of children) {
      descendantIds.push(child.id);
      queue.push(child.id);
    }
  }
  return descendantIds;
};

export default function IndexPage({ isAdmin = true, title = "پرداخت‌ها" }) {
  const { getAll, loading, error } = usePayment();
  const { getAll: getAllPaymentCategories, loading: loadingCategories } =
    usePaymentCategory();

  const [categories, setCategories] = useState<PaymentCategoryWithRelations[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { treeData } = usePaymentCategoryTree(categories);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getAllPaymentCategories({
          page: 1,
          limit: 1000,
        });
        setCategories(categoriesData.data);
      } catch (err) {
        console.error("Error fetching payment categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // فیلترهای ثابت (select box)
  const filters: FilterOption[] = useMemo(
    () => [
      {
        name: "status",
        label: "وضعیت",
        options: [
          { value: "all", label: "همه" },
          { value: "PENDING", label: "در انتظار" },
          { value: "SUCCESS", label: "موفق" },
          { value: "FAILED", label: "ناموفق" },
        ],
      },
      {
        name: "method",
        label: "روش پرداخت",
        options: [
          { value: "all", label: "همه" },
          { value: "CASH", label: "نقدی" },
          { value: "CARD", label: "کارت" },
          { value: "TRANSFER", label: "انتقال" },
        ],
      },
    ],
    []
  );

  // ===== ۱. تعریف فیلدهای تاریخ برای ارسال به دیتا تیبل =====
  const dateFilters = useMemo(
    () => [
      { name: "paidAt", label: "تاریخ تراکنش" },
      { name: "createdAt", label: "تاریخ ایجاد" },
    ],
    []
  );

  const handleNodeClick = useCallback((node: any) => {
    setSelectedCategory((prev) => (prev === node.id ? null : node.id));
  }, []);

  // فیلتر دسته‌بندی
  const categoryFilter = useMemo(() => {
    if (!selectedCategory) return {};
    const idsToFilter = getDescendantIds(selectedCategory, categories);
    return { paymentCategoryId_in: idsToFilter };
  }, [selectedCategory, categories]);

  // ساخت extraFilter برای هر تب (فقط شامل نوع و دسته‌بندی)
  const extraFilterReceive = useMemo(
    () => ({ ...categoryFilter, type: "RECEIVE" }),
    [categoryFilter]
  );
  const extraFilterPay = useMemo(
    () => ({ ...categoryFilter, type: "PAY" }),
    [categoryFilter]
  );
  const extraFilterAll = useMemo(() => categoryFilter, [categoryFilter]);

  // محتوای تب‌ها
  const receivedContent = useMemo(
    () => (
      <DataTableWrapper<PaymentWithRelations>
        columns={columnsForAdmin}
        createUrl="/dashboard/payments/create"
        loading={loading}
        error={error}
        title={"دریافتی ها"}
        fetcher={getAll}
        extraFilter={extraFilterReceive}
        filterOptions={filters}
        // ===== ۲. پاس دادن فیلدهای تاریخ به کامپوننت =====
        dateFilterFields={dateFilters}
        listItemRender={listItemRender}
        defaultViewMode="list"
      />
    ),
    [loading, error, getAll, extraFilterReceive, filters, dateFilters]
  );

  const paymentContent = useMemo(
    () => (
      <DataTableWrapper<PaymentWithRelations>
        columns={columnsForAdmin}
        createUrl="/dashboard/payments/create"
        loading={loading}
        error={error}
        title={"پرداختی ها"}
        fetcher={getAll}
        extraFilter={extraFilterPay}
        filterOptions={filters}
        dateFilterFields={dateFilters}
        listItemRender={listItemRender}
        defaultViewMode="list"
      />
    ),
    [loading, error, getAll, extraFilterPay, filters, dateFilters]
  );

  const allContent = useMemo(
    () => (
      <DataTableWrapper<PaymentWithRelations>
        columns={columnsForAdmin}
        createUrl="/dashboard/payments/create"
        loading={loading}
        error={error}
        title={"همه پرداخت ها"}
        fetcher={getAll}
        extraFilter={extraFilterAll}
        filterOptions={filters}
        dateFilterFields={dateFilters}
        listItemRender={listItemRender}
        defaultViewMode="list"
      />
    ),
    [loading, error, getAll, extraFilterAll, filters, dateFilters]
  );

  const tabs = useMemo(
    () => [
      { id: "received", label: "دریافتی ها", content: receivedContent },
      { id: "payment", label: "پرداختی ها", content: paymentContent },
      { id: "all", label: "همه", content: allContent },
    ],
    [receivedContent, paymentContent, allContent]
  );

  return (
    <>
      {loadingCategories ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-sm">
            {/* بخش فیلتر دسته‌بندی */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                دسته‌بندی‌ها
              </h2>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-sm text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                >
                  پاک کردن
                </button>
              )}
            </div>
            <CategoryTree
              data={treeData}
              onNodeClick={handleNodeClick}
              selectedId={selectedCategory}
            />
          </div>

          <div className="lg:col-span-3">
            <TabsWrapper tabs={tabs} />
          </div>
        </div>
      )}
    </>
  );
}
// // مسیر فایل: src/modules/payments/views/admin/IndexPage.tsx

// "use client";

// import Loading from "@/@Client/Components/common/Loading";
// import { TabsWrapper } from "@/@Client/Components/wrappers";
// import DataTableWrapper from "@/@Client/Components/wrappers/DataTableWrapper";
// import { FilterOption } from "@/@Client/types";
// import CategoryTree from "@/modules/payment-categories/components/CategoryTree"; // ایمپورت کامپوننت جدید
// import { usePaymentCategory } from "@/modules/payment-categories/hooks/usePaymentCategory";
// import { usePaymentCategoryTree } from "@/modules/payment-categories/hooks/usePaymentCategoryTree";
// import { PaymentCategoryWithRelations } from "@/modules/payment-categories/types";
// import { useCallback, useEffect, useMemo, useState } from "react";
// import { columnsForAdmin, listItemRender } from "../data/table";
// import { usePayment } from "../hooks/usePayment";
// import { PaymentWithRelations } from "../types";

// // ===== شروع افزودن تابع کمکی =====
// // این تابع تمام شناسه‌های فرزندان یک دسته را پیدا می‌کند
// const getDescendantIds = (
//   categoryId: number,
//   allCategories: PaymentCategoryWithRelations[]
// ): number[] => {
//   const descendantIds: number[] = [categoryId];
//   const queue: number[] = [categoryId];

//   while (queue.length > 0) {
//     const currentId = queue.shift()!;
//     const children = allCategories.filter((cat) => cat.parentId === currentId);
//     for (const child of children) {
//       descendantIds.push(child.id);
//       queue.push(child.id);
//     }
//   }
//   return descendantIds;
// };
// // ===== پایان افزودن تابع کمکی =====

// export default function IndexPage({ isAdmin = true, title = "پرداخت‌ها" }) {
//   // هوک‌ها برای دریافت داده‌ها
//   const { getAll, loading, error } = usePayment();
//   const { getAll: getAllPaymentCategories, loading: loadingCategories } =
//     usePaymentCategory();

//   // State ها برای مدیریت دسته‌بندی‌ها و فیلتر انتخاب شده
//   const [categories, setCategories] = useState<PaymentCategoryWithRelations[]>(
//     []
//   );
//   const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
//   const { treeData } = usePaymentCategoryTree(categories);

//   // دریافت اولیه لیست دسته‌بندی‌ها
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const categoriesData = await getAllPaymentCategories({
//           page: 1,
//           limit: 1000,
//         });
//         setCategories(categoriesData.data);
//       } catch (err) {
//         console.error("Error fetching payment categories:", err);
//       }
//     };
//     fetchCategories();
//   }, []);

//   // تعریف فیلترهای ثابت (وضعیت و روش پرداخت)
//   const filters: FilterOption[] = useMemo(
//     () => [
//       {
//         name: "status",
//         label: "وضعیت",
//         options: [
//           { value: "all", label: "همه" },
//           { value: "PENDING", label: "در انتظار" },
//           { value: "SUCCESS", label: "موفق" },
//           { value: "FAILED", label: "ناموفق" },
//         ],
//       },
//       {
//         name: "method",
//         label: "روش پرداخت",
//         options: [
//           { value: "all", label: "همه" },
//           { value: "CASH", label: "نقدی" },
//           { value: "CARD", label: "کارت" },
//           { value: "TRANSFER", label: "انتقال" },
//         ],
//       },
//     ],
//     []
//   );

//   // تابع برای مدیریت کلیک روی یک دسته‌بندی در درخت
//   const handleNodeClick = useCallback((node: any) => {
//     setSelectedCategory((prev) => (prev === node.id ? null : node.id));
//   }, []);

//   // ===== شروع اصلاحیه منطق فیلترینگ =====
//   const categoryFilter = useMemo(() => {
//     if (!selectedCategory) return {};
//     const idsToFilter = getDescendantIds(selectedCategory, categories);
//     // فرض بر این است که بک‌اند شما می‌تواند فیلتر `_in` را پردازش کند
//     return { paymentCategoryId_in: idsToFilter };
//   }, [selectedCategory, categories]);
//   // ===== پایان اصلاحیه منطق فیلترینگ =====

//   // ساخت extraFilterهای memoized برای هر تب
//   // این فیلترها اکنون به درستی فیلتر دسته‌بندی و فرزندانش را با فیلتر نوع تب ترکیب می‌کنند
//   const extraFilterReceive = useMemo(
//     () => ({ ...categoryFilter, type: "RECEIVE" }),
//     [categoryFilter]
//   );
//   const extraFilterPay = useMemo(
//     () => ({ ...categoryFilter, type: "PAY" }),
//     [categoryFilter]
//   );
//   const extraFilterAll = useMemo(() => categoryFilter, [categoryFilter]);

//   // ===== محتوای تب‌ها با فیلترهای اصلاح شده =====
//   const receivedContent = useMemo(
//     () => (
//       <DataTableWrapper<PaymentWithRelations>
//         columns={columnsForAdmin}
//         createUrl="/dashboard/payments/create"
//         loading={loading}
//         error={error}
//         title={"دریافتی ها"}
//         fetcher={getAll}
//         extraFilter={extraFilterReceive}
//         filterOptions={filters}
//         listItemRender={listItemRender}
//         defaultViewMode="list"
//       />
//     ),
//     [loading, error, getAll, extraFilterReceive, filters]
//   );

//   const paymentContent = useMemo(
//     () => (
//       <DataTableWrapper<PaymentWithRelations>
//         columns={columnsForAdmin}
//         createUrl="/dashboard/payments/create"
//         loading={loading}
//         error={error}
//         title={"پرداختی ها"}
//         fetcher={getAll}
//         extraFilter={extraFilterPay}
//         filterOptions={filters}
//         listItemRender={listItemRender}
//         defaultViewMode="list"
//       />
//     ),
//     [loading, error, getAll, extraFilterPay, filters]
//   );

//   const allContent = useMemo(
//     () => (
//       <DataTableWrapper<PaymentWithRelations>
//         columns={columnsForAdmin}
//         createUrl="/dashboard/payments/create"
//         loading={loading}
//         error={error}
//         title={"همه پرداخت ها"}
//         fetcher={getAll}
//         extraFilter={extraFilterAll}
//         filterOptions={filters}
//         listItemRender={listItemRender}
//         defaultViewMode="list"
//       />
//     ),
//     [loading, error, getAll, extraFilterAll, filters]
//   );

//   const tabs = useMemo(
//     () => [
//       { id: "received", label: "دریافتی ها", content: receivedContent },
//       { id: "payment", label: "پرداختی ها", content: paymentContent },
//       { id: "all", label: "همه", content: allContent },
//     ],
//     [receivedContent, paymentContent, allContent]
//   );
//   return (
//     <>
//       {loadingCategories ? (
//         <Loading />
//       ) : (
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//           <div className="lg:col-span-1 bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-sm">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
//                 دسته‌بندی‌ها
//               </h2>
//               {selectedCategory && (
//                 // ===== شروع تغییر رنگ =====
//                 <button
//                   onClick={() => setSelectedCategory(null)}
//                   className="text-sm text-teal-600 dark:text-teal-400 hover:underline font-semibold"
//                 >
//                   پاک کردن
//                 </button>
//                 // ===== پایان تغییر رنگ =====
//               )}
//             </div>
//             <CategoryTree
//               data={treeData}
//               onNodeClick={handleNodeClick}
//               selectedId={selectedCategory}
//             />
//           </div>
//           <div className="lg:col-span-3">
//             <TabsWrapper tabs={tabs} />
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
