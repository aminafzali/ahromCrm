// // مسیر فایل: src/@Client/Components/wrappers/V2/IndexWrapper.tsx
// مسیر فایل: src/@Client/Components/wrappers/V2/IndexWrapper.tsx

import DIcon from "@/@Client/Components/common/DIcon";
import {
  CardIcon,
  ListIcon,
  TableIcon,
} from "@/@Client/Components/common/table/iconView";
import { useCrud } from "@/@Client/hooks/useCrud";
import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { FilterOption } from "@/@Client/types";
import ButtonCreate from "@/components/ButtonCreate/ButtonCreate";
import { Button, Form, Input, Table } from "ndui-ahrom";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import MultiSelectFilter from "../../ui/MultiSelectFilter";
import StandaloneDatePicker from "../../ui/StandaloneDatePicker2";

const searchSchema = z.object({
  search: z.string(),
});

interface DateFilterField {
  name: string;
  label: string;
}

interface IndexWrapperProps<T, R extends BaseRepository<T, number>> {
  columns: Column[];
  showIconViews?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  listClassName?: string;
  onPageChange?: (page: number) => void;
  onClear?: () => void;
  onSearch?: boolean;
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  dateFilterFields?: DateFilterField[];
  extraFilter?: Record<string, any>;
  defaultFilter?: Array<Record<string, any>>;
  createUrl?: boolean;
  quickCreate?: React.ReactNode | ((closeModal: () => void) => React.ReactNode);
  defaultViewMode?: "table" | "list";
  className?: string;
  cardClassName?: string;
  title?: string;
  repo: R;
  listItemRender?: (row: any, columns: Column[]) => React.ReactNode;
  selectionMode?: "multiple" | "single" | "none";
  onSelect?: (selectedItems: T[]) => void;
}

const IndexWrapper = <T, R extends BaseRepository<T, number>>({
  columns,
  showIconViews = true,
  emptyMessage = "هیچ داده‌ای یافت نشد",
  loadingMessage = "در حال بارگذاری",
  onSearch = true,
  searchPlaceholder = "جستجو...",
  filterOptions = [],
  dateFilterFields = [],
  createUrl = true,
  defaultViewMode = "list",
  className = "",
  listClassName = "",
  repo,
  extraFilter,
  defaultFilter,
  onClear,
  quickCreate,
  listItemRender = undefined,
  selectionMode = "none",
  onSelect,
}: IndexWrapperProps<T, R>) => {
  const [selectedItems, setSelctedItems] = useState<T[]>([]);
  const pathname = usePathname();
  const { getAll, loading, error } = useCrud<T>(repo);
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersValue, setFilterValue] = useState(new Map<string, any>());

  useEffect(() => {
    get();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filtersValue, extraFilter]);

  const get = async (page = 1, limit = pagination.limit) => {
    try {
      const params: any = { page, limit };
      if (searchTerm) params.search = searchTerm;
      filtersValue.forEach((value, key) => {
        if (value && (!Array.isArray(value) || value.length > 0)) {
          params[key] = value;
        }
      });
      if (defaultFilter) {
        defaultFilter.forEach((filter) => Object.assign(params, filter));
      }
      if (extraFilter) Object.assign(params, extraFilter);
      const result = await getAll(params);
      setData(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handlePageChange = (page: number) => get(page);
  const handleSearch = (data: { search: string }) => setSearchTerm(data.search);
  const handleFilterChange = (name: string, value: any) => {
    setFilterValue((prev) => {
      const newFilters = new Map(prev);
      if (
        value === "all" ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        newFilters.delete(name);
      } else {
        newFilters.set(name, value);
      }
      return newFilters;
    });
  };
  const optionsMap = useMemo(() => {
    const map = new Map<string, string>();
    filterOptions.forEach((filter) => {
      filter.options.forEach((option) => {
        map.set(`${filter.name}-${option.value}`, option.label);
      });
    });
    return map;
  }, [filterOptions]);
  const handleRemoveFilterTag = (filterName: string, valueToRemove: string) => {
    const currentValues = filtersValue.get(filterName) || [];
    if (!Array.isArray(currentValues)) return;
    const newValues = currentValues.filter((v: string) => v !== valueToRemove);
    handleFilterChange(filterName, newValues);
  };
  const clear = () => {
    setFilterValue(new Map<string, any>());
    onClear?.();
  };
  const handleSelectionChange = (newSelected: T[]) => {
    setSelctedItems(newSelected);
  };
  const actionButton = createUrl ? (
    <Link href={`${pathname}/create`}>
      <Button icon={<DIcon icon="fa-plus" cdi={false} classCustom="!mx-0" />}>
        ایجاد
      </Button>
    </Link>
  ) : undefined;
  const onSelectButton = onSelect ? (
    <Button
      icon={<DIcon icon="fa-check" cdi={false} classCustom="!mx-0" />}
      onClick={() => onSelect?.(selectedItems)}
    >
      انتخاب
    </Button>
  ) : undefined;
  const hasActiveTags = Array.from(filtersValue.values()).some(
    (v) => Array.isArray(v) && v.length > 0
  );

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-6 px-1">
        {onSearch && (
          <Form schema={searchSchema} onSubmit={handleSearch} className="grow">
            <div className="flex justify-start">
              <div className="flex p-2 gap-1 rounded-lg items-center">
                <div className="max-md:w-40 lg:w-64">
                  <Input
                    name="search"
                    variant="primary"
                    className="bg-white"
                    placeholder={searchPlaceholder}
                  />
                </div>
                <Button
                  variant="ghost"
                  type="submit"
                  size="xs"
                  className="h-full"
                  icon={<DIcon icon="fa-search" />}
                ></Button>
              </div>
            </div>
          </Form>
        )}
        {actionButton}
        {onSelectButton}
        {quickCreate && (
          <ButtonCreate
            modalTitle="ایجاد سریع"
            modalContent={quickCreate}
          ></ButtonCreate>
        )}
      </div>

      {(filterOptions.length > 0 || dateFilterFields.length > 0) && (
        // ===== شروع اصلاحیه =====
        <div className="collapse collapse-arrow bg-white mb-4 relative z-30">
          <input type="checkbox" name="my-accordion-2" />
          {/* // ===== پایان اصلاحیه ===== */}
          <input type="checkbox" name="my-accordion-2" />
          <div className="collapse-title text-slate-800 dark:text-slate-200">
            <DIcon icon="fa-filter" /> فیلترها
          </div>
          <div className="collapse-content overflow-visible">
            <div className="flex flex-wrap items-center gap-3">
              {filterOptions.map((filter) => (
                <div key={filter.name} className="w-full sm:w-auto md:w-52">
                  <MultiSelectFilter
                    label={filter.label}
                    options={filter.options}
                    selectedValues={filtersValue.get(filter.name) || []}
                    onChange={(values) =>
                      handleFilterChange(filter.name, values)
                    }
                  />
                </div>
              ))}
              <div className="ml-auto">
                <Button variant="ghost" onClick={clear} className="!text-error">
                  پاک کردن همه
                </Button>
              </div>
            </div>

            {hasActiveTags && (
              <div className="flex flex-wrap items-center gap-2 pt-3">
                {Array.from(filtersValue.entries()).map(
                  ([key, values]) =>
                    Array.isArray(values) &&
                    values.map((value) => (
                      <div
                        key={`${key}-${value}`}
                        className="group flex items-center bg-teal-50 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-sm font-medium pl-3 pr-1.5 py-1 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-slate-700"
                      >
                        <span>
                          {optionsMap.get(`${key}-${value}`) || value}
                        </span>
                        <button
                          onClick={() => handleRemoveFilterTag(key, value)}
                          className="flex-shrink-0 ml-1.5 h-5 w-5 rounded-full inline-flex items-center justify-center"
                        >
                          <DIcon
                            icon="fa-times"
                            classCustom="text-teal-500 dark:text-teal-400 group-hover:text-teal-700 text-xs"
                          />
                        </button>
                      </div>
                    ))
                )}
              </div>
            )}

            {dateFilterFields.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                {dateFilterFields.map((field) => (
                  <React.Fragment key={field.name}>
                    <StandaloneDatePicker
                      name={`${field.name}_gte`}
                      label={`${field.label} (از)`}
                      value={filtersValue.get(`${field.name}_gte`) || null}
                      timeOfDay="start"
                      onChange={(payload) =>
                        handleFilterChange(
                          `${field.name}_gte`,
                          payload ? payload.iso : null
                        )
                      }
                    />
                    <StandaloneDatePicker
                      name={`${field.name}_lte`}
                      label={`${field.label} (تا)`}
                      value={filtersValue.get(`${field.name}_lte`) || null}
                      timeOfDay="end"
                      onChange={(payload) =>
                        handleFilterChange(
                          `${field.name}_lte`,
                          payload ? payload.iso : null
                        )
                      }
                    />
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Table
        iconViewMode={{
          table: TableIcon(),
          card: CardIcon(),
          list: ListIcon(),
        }}
        listClassName={listClassName}
        loading={loading}
        loadingMessage={loadingMessage}
        noDataMessage={emptyMessage}
        columns={columns}
        data={data}
        pagination={pagination}
        onPageChange={handlePageChange}
        defaultViewMode={defaultViewMode}
        listItemRender={listItemRender}
        showIconViews={showIconViews}
        selection={selectionMode}
        defaultSelected={selectedItems}
        onSelectionChange={handleSelectionChange}
        paginationUI={{
          next: <DIcon icon="fa-angle-left" />,
          prev: <DIcon icon="fa-angle-right" />,
          last: <DIcon icon="fa-angles-left" />,
          first: <DIcon icon="fa-angles-right" />,
          className: "!bg-white border-[1px] border-gray-400",
        }}
      />
    </div>
  );
};

export default IndexWrapper;

// import DIcon from "@/@Client/Components/common/DIcon";
// import { useCrud } from "@/@Client/hooks/useCrud";
// import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
// import { FilterOption } from "@/@Client/types";
// import ButtonCreate from "@/components/ButtonCreate/ButtonCreate";
// import { Button, Form, Input, Table } from "ndui-ahrom";
// import { Column } from "ndui-ahrom/dist/components/Table/Table";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import React, { useEffect, useMemo, useState } from "react";
// import { z } from "zod";
// import MultiSelectFilter from "../../ui/MultiSelectFilter";
// import StandaloneDatePicker from "../../ui/StandaloneDatePicker2";

// const searchSchema = z.object({
//   search: z.string(),
// });

// interface DateFilterField {
//   name: string;
//   label: string;
// }

// interface IndexWrapperProps<T, R extends BaseRepository<T, number>> {
//   columns: Column[];
//   showIconViews?: boolean;
//   emptyMessage?: string;
//   loadingMessage?: string;
//   listClassName?: string;
//   onPageChange?: (page: number) => void;
//   onClear?: () => void;
//   onSearch?: boolean;
//   searchPlaceholder?: string;
//   filterOptions?: FilterOption[];
//   dateFilterFields?: DateFilterField[];
//   extraFilter?: Record<string, any>;
//   defaultFilter?: Array<Record<string, any>>;
//   createUrl?: boolean;
//   quickCreate?: React.ReactNode | ((closeModal: () => void) => React.ReactNode);
//   defaultViewMode?: "table" | "list";
//   className?: string;
//   cardClassName?: string;
//   title?: string;
//   repo: R;
//   listItemRender?: (row: any, columns: Column[]) => React.ReactNode;
//   selectionMode?: "multiple" | "single" | "none";
//   onSelect?: (selectedItems: T[]) => void;
// }

// const IndexWrapper = <T, R extends BaseRepository<T, number>>({
//   columns,
//   showIconViews = true,
//   emptyMessage = "هیچ داده‌ای یافت نشد",
//   loadingMessage = "در حال بارگذاری",
//   onSearch = true,
//   searchPlaceholder = "جستجو...",
//   filterOptions = [],
//   dateFilterFields = [],
//   createUrl = true,
//   defaultViewMode = "list",
//   className = "",
//   listClassName = "",
//   repo,
//   extraFilter,
//   defaultFilter,
//   onClear,
//   quickCreate,
//   listItemRender = undefined,
//   selectionMode = "none",
//   onSelect,
// }: IndexWrapperProps<T, R>) => {
//   // ... تمام هوک‌ها و منطق‌های قبلی بدون تغییر باقی می‌مانند ...
//   const [selectedItems, setSelctedItems] = useState<T[]>([]);
//   const pathname = usePathname();
//   const { getAll, loading, error } = useCrud<T>(repo);
//   const [data, setData] = useState<T[]>([]);
//   const [pagination, setPagination] = useState({
//     total: 0,
//     pages: 1,
//     page: 1,
//     limit: 10,
//   });
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filtersValue, setFilterValue] = useState(new Map<string, any>());

//   useEffect(() => {
//     get();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [searchTerm, filtersValue, extraFilter]);

//   const get = async (page = 1, limit = pagination.limit) => {
//     try {
//       const params: any = { page, limit };
//       if (searchTerm) params.search = searchTerm;
//       filtersValue.forEach((value, key) => {
//         if (value && (!Array.isArray(value) || value.length > 0)) {
//           params[key] = value;
//         }
//       });
//       if (defaultFilter) {
//         defaultFilter.forEach((filter) => Object.assign(params, filter));
//       }
//       if (extraFilter) Object.assign(params, extraFilter);
//       const result = await getAll(params);
//       setData(result.data);
//       setPagination(result.pagination);
//     } catch (err) {
//       console.error("Error fetching data:", err);
//     }
//   };

//   const handlePageChange = (page: number) => get(page);
//   const handleSearch = (data: { search: string }) => setSearchTerm(data.search);
//   const handleFilterChange = (name: string, value: any) => {
//     setFilterValue((prev) => {
//       const newFilters = new Map(prev);
//       if (
//         value === "all" ||
//         value === null ||
//         value === "" ||
//         (Array.isArray(value) && value.length === 0)
//       ) {
//         newFilters.delete(name);
//       } else {
//         newFilters.set(name, value);
//       }
//       return newFilters;
//     });
//   };
//   const optionsMap = useMemo(() => {
//     const map = new Map<string, string>();
//     filterOptions.forEach((filter) => {
//       filter.options.forEach((option) => {
//         map.set(`${filter.name}-${option.value}`, option.label);
//       });
//     });
//     return map;
//   }, [filterOptions]);
//   const handleRemoveFilterTag = (filterName: string, valueToRemove: string) => {
//     const currentValues = filtersValue.get(filterName) || [];
//     if (!Array.isArray(currentValues)) return;
//     const newValues = currentValues.filter((v: string) => v !== valueToRemove);
//     handleFilterChange(filterName, newValues);
//   };
//   const clear = () => {
//     setFilterValue(new Map<string, any>());
//     onClear?.();
//   };
//   const handleSelectionChange = (newSelected: T[]) => {
//     setSelctedItems(newSelected);
//   };
//   const actionButton = createUrl ? (
//     <Link href={`${pathname}/create`}>
//       <Button icon={<DIcon icon="fa-plus" cdi={false} classCustom="!mx-0" />}>
//         ایجاد
//       </Button>
//     </Link>
//   ) : undefined;
//   const onSelectButton = onSelect ? (
//     <Button
//       icon={<DIcon icon="fa-check" cdi={false} classCustom="!mx-0" />}
//       onClick={() => onSelect?.(selectedItems)}
//     >
//       انتخاب
//     </Button>
//   ) : undefined;
//   const hasActiveTags = Array.from(filtersValue.values()).some(
//     (v) => Array.isArray(v) && v.length > 0
//   );

//   return (
//     <div className={className}>
//       <div className="flex justify-between items-center mb-6 px-1">
//         {onSearch && (
//           <Form schema={searchSchema} onSubmit={handleSearch} className="grow">
//             <div className="flex justify-start">
//               <div className="flex p-2 gap-1 rounded-lg items-center">
//                 <div className="max-md:w-40 lg:w-64">
//                   <Input
//                     name="search"
//                     variant="primary"
//                     className="bg-white"
//                     placeholder={searchPlaceholder}
//                   />
//                 </div>
//                 <Button
//                   variant="ghost"
//                   type="submit"
//                   size="xs"
//                   className="h-full"
//                   icon={<DIcon icon="fa-search" />}
//                 ></Button>
//               </div>
//             </div>
//           </Form>
//         )}
//         {actionButton}
//         {onSelectButton}
//         {quickCreate && (
//           <ButtonCreate
//             modalTitle="ایجاد سریع"
//             modalContent={quickCreate}
//           ></ButtonCreate>
//         )}
//       </div>

//       {(filterOptions.length > 0 || dateFilterFields.length > 0) && (
//         <div className="collapse collapse-arrow bg-white dark:bg-slate-800 mb-4 relative z-10">
//           <input type="checkbox" name="my-accordion-2" defaultChecked />
//           <div className="collapse-title text-slate-800 dark:text-slate-200">
//             <DIcon icon="fa-filter" /> فیلترها
//           </div>
//           <div className="collapse-content">
//             {/* ===== شروع اصلاحیه چیدمان و ظاهر ===== */}

//             {/* بخش دکمه‌های فیلتر */}
//             <div className="flex flex-wrap items-center gap-3">
//               {filterOptions.map((filter) => (
//                 <div key={filter.name} className="w-full sm:w-auto md:w-52">
//                   <MultiSelectFilter
//                     label={filter.label}
//                     options={filter.options}
//                     selectedValues={filtersValue.get(filter.name) || []}
//                     onChange={(values) =>
//                       handleFilterChange(filter.name, values)
//                     }
//                   />
//                 </div>
//               ))}
//               <div className="ml-auto">
//                 <Button variant="ghost" onClick={clear} className="!text-error">
//                   پاک کردن همه
//                 </Button>
//               </div>
//             </div>

//             {/* بخش تگ‌های انتخاب شده (بالای خط جداکننده) */}
//             {hasActiveTags && (
//               <div className="flex flex-wrap items-center gap-2 pt-3">
//                 {Array.from(filtersValue.entries()).map(
//                   ([key, values]) =>
//                     Array.isArray(values) &&
//                     values.map((value) => (
//                       <div
//                         key={`${key}-${value}`}
//                         className="group flex items-center bg-teal-50 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-sm font-medium pl-3 pr-1.5 py-1 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-slate-700"
//                       >
//                         <span>
//                           {optionsMap.get(`${key}-${value}`) || value}
//                         </span>
//                         <button
//                           onClick={() => handleRemoveFilterTag(key, value)}
//                           className="flex-shrink-0 ml-1.5 h-5 w-5 rounded-full inline-flex items-center justify-center"
//                         >
//                           <DIcon
//                             icon="fa-times"
//                             classCustom="text-teal-500 dark:text-teal-400 group-hover:text-teal-700 text-xs"
//                           />
//                         </button>
//                       </div>
//                     ))
//                 )}
//               </div>
//             )}

//             {/* بخش فیلترهای تاریخ (پایین خط جداکننده) */}
//             {dateFilterFields.length > 0 && (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
//                 {dateFilterFields.map((field) => (
//                   <React.Fragment key={field.name}>
//                     <StandaloneDatePicker
//                       name={`${field.name}_gte`}
//                       label={`${field.label} (از)`}
//                       value={filtersValue.get(`${field.name}_gte`) || null}
//                       timeOfDay="start"
//                       onChange={(payload) =>
//                         handleFilterChange(
//                           `${field.name}_gte`,
//                           payload ? payload.iso : null
//                         )
//                       }
//                     />
//                     <StandaloneDatePicker
//                       name={`${field.name}_lte`}
//                       label={`${field.label} (تا)`}
//                       value={filtersValue.get(`${field.name}_lte`) || null}
//                       timeOfDay="end"
//                       onChange={(payload) =>
//                         handleFilterChange(
//                           `${field.name}_lte`,
//                           payload ? payload.iso : null
//                         )
//                       }
//                     />
//                   </React.Fragment>
//                 ))}
//               </div>
//             )}
//             {/* ===== پایان اصلاحیه چیدمان ===== */}
//           </div>
//         </div>
//       )}

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       <Table
//         // ... بقیه پراپ‌های جدول بدون تغییر
//         listClassName={listClassName}
//         loading={loading}
//         loadingMessage={loadingMessage}
//         noDataMessage={emptyMessage}
//         columns={columns}
//         data={data}
//         pagination={pagination}
//         onPageChange={handlePageChange}
//         defaultViewMode={defaultViewMode}
//         listItemRender={listItemRender}
//         showIconViews={showIconViews}
//         selection={selectionMode}
//         defaultSelected={selectedItems}
//         onSelectionChange={handleSelectionChange}
//         paginationUI={{
//           next: <DIcon icon="fa-angle-left" />,
//           prev: <DIcon icon="fa-angle-right" />,
//           last: <DIcon icon="fa-angles-left" />,
//           first: <DIcon icon="fa-angles-right" />,
//           className: "!bg-white border-[1px] border-gray-400",
//         }}
//       />
//     </div>
//   );
// };

// export default IndexWrapper;

// // مسیر فایل: src/@Client/Components/wrappers/V2/IndexWrapper.tsx

// import DIcon from "@/@Client/Components/common/DIcon";
// import { useCrud } from "@/@Client/hooks/useCrud";
// import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
// import { FilterOption } from "@/@Client/types";
// import ButtonCreate from "@/components/ButtonCreate/ButtonCreate";
// import { Button, Form, Input, Table } from "ndui-ahrom";
// import { Column } from "ndui-ahrom/dist/components/Table/Table";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import React, { useEffect, useMemo, useState } from "react";
// import { z } from "zod";
// import MultiSelectFilter from "../../ui/MultiSelectFilter"; // ایمپورت کامپوننت جدید
// import StandaloneDatePicker from "../../ui/StandaloneDatePicker2"; // اطمینان از مسیر صحیح

// const searchSchema = z.object({
//   search: z.string(),
// });

// interface DateFilterField {
//   name: string;
//   label: string;
// }

// interface IndexWrapperProps<T, R extends BaseRepository<T, number>> {
//   columns: Column[];
//   showIconViews?: boolean;
//   emptyMessage?: string;
//   loadingMessage?: string;
//   listClassName?: string;
//   onPageChange?: (page: number) => void;
//   onClear?: () => void;
//   onSearch?: boolean;
//   searchPlaceholder?: string;
//   filterOptions?: FilterOption[];
//   dateFilterFields?: DateFilterField[];
//   extraFilter?: Record<string, any>;
//   defaultFilter?: Array<Record<string, any>>;
//   createUrl?: boolean;
//   quickCreate?: React.ReactNode | ((closeModal: () => void) => React.ReactNode);
//   defaultViewMode?: "table" | "list";
//   className?: string;
//   cardClassName?: string;
//   title?: string;
//   repo: R;
//   listItemRender?: (row: any, columns: Column[]) => React.ReactNode;
//   selectionMode?: "multiple" | "single" | "none";
//   onSelect?: (selectedItems: T[]) => void;
// }

// const IndexWrapper = <T, R extends BaseRepository<T, number>>({
//   columns,
//   showIconViews = true,
//   emptyMessage = "هیچ داده‌ای یافت نشد",
//   loadingMessage = "در حال بارگذاری",
//   onSearch = true,
//   searchPlaceholder = "جستجو...",
//   filterOptions = [],
//   dateFilterFields = [],
//   createUrl = true,
//   defaultViewMode = "list",
//   className = "",
//   listClassName = "",
//   repo,
//   extraFilter,
//   defaultFilter,
//   onClear,
//   quickCreate,
//   listItemRender = undefined,
//   selectionMode = "none",
//   onSelect,
// }: IndexWrapperProps<T, R>) => {
//   const [selectedItems, setSelctedItems] = useState<T[]>([]);
//   const pathname = usePathname();
//   const { getAll, loading, error } = useCrud<T>(repo);
//   const [data, setData] = useState<T[]>([]);
//   const [pagination, setPagination] = useState({
//     total: 0,
//     pages: 1,
//     page: 1,
//     limit: 10,
//   });
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filtersValue, setFilterValue] = useState(new Map<string, any>());

//   useEffect(() => {
//     get();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [searchTerm, filtersValue, extraFilter]);

//   const get = async (page = 1, limit = pagination.limit) => {
//     try {
//       const params: any = { page, limit };
//       if (searchTerm) params.search = searchTerm;

//       filtersValue.forEach((value, key) => {
//         if (value && (!Array.isArray(value) || value.length > 0)) {
//           params[key] = value;
//         }
//       });

//       if (defaultFilter) {
//         defaultFilter.forEach((filter) => Object.assign(params, filter));
//       }
//       if (extraFilter) Object.assign(params, extraFilter);

//       const result = await getAll(params);
//       setData(result.data);
//       setPagination(result.pagination);
//     } catch (err) {
//       console.error("Error fetching data:", err);
//     }
//   };

//   const handlePageChange = (page: number) => get(page);
//   const handleSearch = (data: { search: string }) => setSearchTerm(data.search);

//   // ===== شروع اصلاحیه =====
//   const handleFilterChange = (name: string, value: any) => {
//     setFilterValue((prev) => {
//       const newFilters = new Map(prev);
//       if (
//         value === "all" ||
//         value === null ||
//         value === "" ||
//         (Array.isArray(value) && value.length === 0)
//       ) {
//         newFilters.delete(name);
//       } else {
//         newFilters.set(name, value);
//       }
//       return newFilters;
//     });
//   };

//   const optionsMap = useMemo(() => {
//     const map = new Map<string, string>();
//     filterOptions.forEach((filter) => {
//       filter.options.forEach((option) => {
//         map.set(`${filter.name}-${option.value}`, option.label);
//       });
//     });
//     return map;
//   }, [filterOptions]);

//   const handleRemoveFilterTag = (filterName: string, valueToRemove: string) => {
//     const currentValues = filtersValue.get(filterName) || [];
//     if (!Array.isArray(currentValues)) return; // فقط برای فیلترهای چندگانه کار می‌کند
//     const newValues = currentValues.filter((v: string) => v !== valueToRemove);
//     handleFilterChange(filterName, newValues);
//   };
//   // ===== پایان اصلاحیه =====

//   const clear = () => {
//     setFilterValue(new Map<string, any>());
//     onClear?.();
//   };

//   const handleSelectionChange = (newSelected: T[]) => {
//     setSelctedItems(newSelected);
//   };

//   const actionButton = createUrl ? (
//     <Link href={`${pathname}/create`}>
//       <Button icon={<DIcon icon="fa-plus" cdi={false} classCustom="!mx-0" />}>
//         ایجاد
//       </Button>
//     </Link>
//   ) : undefined;

//   const onSelectButton = onSelect ? (
//     <Button
//       icon={<DIcon icon="fa-check" cdi={false} classCustom="!mx-0" />}
//       onClick={() => onSelect?.(selectedItems)}
//     >
//       انتخاب
//     </Button>
//   ) : undefined;

//   return (
//     <div className={className}>
//       <div className="flex justify-between items-center mb-6 px-1">
//         {onSearch && (
//           <Form schema={searchSchema} onSubmit={handleSearch} className="grow">
//             <div className="flex justify-start">
//               <div className="flex p-2 gap-1 rounded-lg items-center">
//                 <div className="max-md:w-40 lg:w-64">
//                   <Input
//                     name="search"
//                     variant="primary"
//                     className="bg-white"
//                     placeholder={searchPlaceholder}
//                   />
//                 </div>
//                 <Button
//                   variant="ghost"
//                   type="submit"
//                   size="xs"
//                   className="h-full"
//                   icon={<DIcon icon="fa-search" />}
//                 ></Button>
//               </div>
//             </div>
//           </Form>
//         )}
//         {actionButton}
//         {onSelectButton}
//         {quickCreate && (
//           <ButtonCreate
//             modalTitle="ایجاد سریع"
//             modalContent={quickCreate}
//           ></ButtonCreate>
//         )}
//       </div>

//       {(filterOptions.length > 0 || dateFilterFields.length > 0) && (
//         <div className="collapse collapse-arrow bg-white mb-4 relative z-10">
//           <input type="checkbox" name="my-accordion-2" defaultChecked />
//           <div className="collapse-title">
//             <DIcon icon="fa-filter" /> فیلتر ها ....
//           </div>
//           <div className="collapse-content">
//             <div className="flex flex-col gap-4 p-2">
//               <div className="flex flex-wrap items-center gap-4">
//                 {/* جایگزینی Select22 با MultiSelectFilter */}
//                 {filterOptions.map((filter) => (
//                   <MultiSelectFilter
//                     key={filter.name}
//                     label={filter.label}
//                     options={filter.options}
//                     selectedValues={filtersValue.get(filter.name) || []}
//                     onChange={(values) =>
//                       handleFilterChange(filter.name, values)
//                     }
//                   />
//                 ))}
//                 <Button
//                   variant="ghost"
//                   onClick={clear}
//                   icon={
//                     <DIcon
//                       icon="fa-xmark"
//                       cdi={false}
//                       classCustom="!text-error"
//                     />
//                   }
//                   className="!text-error"
//                 >
//                   حذف فیلترها
//                 </Button>
//               </div>

//               {/* نمایش تگ‌های زیبا برای فیلترهای انتخاب شده */}
//               <div className="flex flex-wrap items-center gap-2 pt-2">
//                 {Array.from(filtersValue.entries()).map(
//                   ([key, values]) =>
//                     Array.isArray(values) &&
//                     values.map((value) => (
//                       <div
//                         key={`${key}-${value}`}
//                         className="m-1 p-2 badge badge-outline border-teal-600 text-teal-600 gap-2"
//                       >
//                         <button
//                           onClick={() => handleRemoveFilterTag(key, value)}
//                         >
//                           <DIcon icon="fa-times" classCustom="text-error" />
//                         </button>
//                         {optionsMap.get(`${key}-${value}`) || value}
//                       </div>
//                     ))
//                 )}
//               </div>

//               {dateFilterFields.length > 0 && (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-gray-200 pt-4">
//                   {dateFilterFields.map((field) => (
//                     <React.Fragment key={field.name}>
//                       <StandaloneDatePicker
//                         name={`${field.name}_gte`}
//                         label={`${field.label} (از)`}
//                         value={filtersValue.get(`${field.name}_gte`) || null}
//                         timeOfDay="start"
//                         onChange={(payload) =>
//                           handleFilterChange(
//                             `${field.name}_gte`,
//                             payload ? payload.iso : null
//                           )
//                         }
//                       />
//                       <StandaloneDatePicker
//                         name={`${field.name}_lte`}
//                         label={`${field.label} (تا)`}
//                         value={filtersValue.get(`${field.name}_lte`) || null}
//                         timeOfDay="end"
//                         onChange={(payload) =>
//                           handleFilterChange(
//                             `${field.name}_lte`,
//                             payload ? payload.iso : null
//                           )
//                         }
//                       />
//                     </React.Fragment>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       <Table
//         listClassName={listClassName}
//         loading={loading}
//         loadingMessage={loadingMessage}
//         noDataMessage={emptyMessage}
//         columns={columns}
//         data={data}
//         pagination={pagination}
//         onPageChange={handlePageChange}
//         defaultViewMode={defaultViewMode}
//         listItemRender={listItemRender}
//         showIconViews={showIconViews}
//         selection={selectionMode}
//         defaultSelected={selectedItems}
//         onSelectionChange={handleSelectionChange}
//         paginationUI={{
//           next: <DIcon icon="fa-angle-left" />,
//           prev: <DIcon icon="fa-angle-right" />,
//           last: <DIcon icon="fa-angles-left" />,
//           first: <DIcon icon="fa-angles-right" />,
//           className: "!bg-white border-[1px] border-gray-400",
//         }}
//       />
//     </div>
//   );
// };

// export default IndexWrapper;

// // // ... (تمام import ها و کدهای بالای کامپوننت مثل قبل)
// // import DIcon from "@/@Client/Components/common/DIcon";
// // import {
// //   CardIcon,
// //   ListIcon,
// //   TableIcon,
// // } from "@/@Client/Components/common/table/iconView";
// // import { useCrud } from "@/@Client/hooks/useCrud";
// // import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
// // import { FilterOption } from "@/@Client/types";
// // import ButtonCreate from "@/components/ButtonCreate/ButtonCreate";
// // import { Button, Form, Input, Table } from "ndui-ahrom";
// // import { Column } from "ndui-ahrom/dist/components/Table/Table";
// // import Link from "next/link";
// // import { usePathname } from "next/navigation";
// // import React, { useEffect, useState } from "react";
// // import { z } from "zod";
// // import StandaloneDatePicker from "../../ui/StandaloneDatePicker2";
// // import Select22 from "../Select22";

// // const searchSchema = z.object({
// //   search: z.string(),
// // });

// // interface DateFilterField {
// //   name: string;
// //   label: string;
// // }

// // interface IndexWrapperProps<T, R extends BaseRepository<T, number>> {
// //   columns: Column[];
// //   showIconViews?: boolean;
// //   emptyMessage?: string;
// //   loadingMessage?: string;
// //   listClassName?: string;
// //   onPageChange?: (page: number) => void;
// //   onClear?: () => void;
// //   onSearch?: boolean;
// //   searchPlaceholder?: string;
// //   filterOptions?: FilterOption[];
// //   dateFilterFields?: DateFilterField[];
// //   extraFilter?: Record<string, any>;
// //   defaultFilter?: Array<Record<string, any>>;
// //   onFilterChange?: (name: string, value: string) => void;
// //   createUrl?: boolean;
// //   quickCreate?: React.ReactNode | ((closeModal: () => void) => React.ReactNode);
// //   defaultViewMode?: "table" | "list";
// //   className?: string;
// //   cardClassName?: string;
// //   title?: string;
// //   totalItems?: number;
// //   totalPages?: number;
// //   currentPage?: number;
// //   repo: R;
// //   listItemRender?: (row: any, columns: Column[]) => React.ReactNode;
// //   selectionMode?: "multiple" | "single" | "none";
// //   onSelect?: (selectedItems: T[]) => void;
// // }

// // const IndexWrapper = <T, R extends BaseRepository<T, number>>({
// //   columns,
// //   showIconViews = true,
// //   emptyMessage = "هیچ داده‌ای یافت نشد",
// //   loadingMessage = "در حال بارگذاری",
// //   onSearch = true,
// //   searchPlaceholder = "جستجو...",
// //   filterOptions = [],
// //   dateFilterFields = [],
// //   createUrl = true,
// //   defaultViewMode = "list",
// //   className = "",
// //   listClassName = "",
// //   title = "",
// //   repo,
// //   extraFilter,
// //   defaultFilter,
// //   onClear,
// //   quickCreate,
// //   listItemRender = undefined,
// //   selectionMode = "none",
// //   onSelect,
// // }: IndexWrapperProps<T, R>) => {
// //   const [selectedItems, setSelctedItems] = useState<T[]>([]);
// //   const pathname = usePathname();
// //   const { getAll, loading, error } = useCrud<T>(repo);
// //   const [data, setData] = useState<T[]>([]);
// //   const [pagination, setPagination] = useState({
// //     total: 0,
// //     pages: 1,
// //     page: 1,
// //     limit: 10,
// //   });
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [filtersValue, setFilterValue] = useState(new Map<string, any>());

// //   useEffect(() => {
// //     get();
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [searchTerm, filtersValue, extraFilter]);

// //   const get = async (page = 1, limit = pagination.limit) => {
// //     try {
// //       const params: any = { page, limit };
// //       if (searchTerm) {
// //         params.search = searchTerm;
// //       }
// //       filtersValue.forEach((value, key) => {
// //         if (value && value !== "all" && value !== "") {
// //           params[key] = value;
// //         }
// //       });
// //       if (defaultFilter && Array.isArray(defaultFilter)) {
// //         defaultFilter.forEach((filter) => {
// //           Object.entries(filter).forEach(([key, value]) => {
// //             if (
// //               value !== null &&
// //               value !== undefined &&
// //               value !== "all" &&
// //               value !== ""
// //             ) {
// //               params[key] = value;
// //             }
// //           });
// //         });
// //       }
// //       if (extraFilter && Object.keys(extraFilter).length > 0) {
// //         const filteredExtraFilter = Object.fromEntries(
// //           Object.entries(extraFilter).filter(
// //             ([, value]) => value !== null && value !== undefined
// //           )
// //         );
// //         Object.assign(params, filteredExtraFilter);
// //       }
// //       const data = await getAll(params);
// //       setData(data.data);
// //       setPagination(data.pagination);
// //     } catch (error) {
// //       console.error("Error fetching data:", error);
// //     }
// //   };

// //   const handlePageChange = (page: number) => {
// //     get(page);
// //   };

// //   const handleFilterChange = (name: string, value: string | number | null) => {
// //     setFilterValue((prev) => {
// //       const newFilters = new Map(prev);
// //       if (value === "all" || value === null || value === "") {
// //         newFilters.delete(name);
// //       } else {
// //         newFilters.set(name, value);
// //       }
// //       return newFilters;
// //     });
// //   };

// //   const handleSearch = (data: { search: string }) => {
// //     setSearchTerm(data.search);
// //   };

// //   const clear = () => {
// //     setFilterValue(new Map<string, any>());
// //     onClear?.();
// //   };

// //   const handleSelectionChange = (newSelected: T[]) => {
// //     setSelctedItems(newSelected);
// //   };

// //   const actionButton = createUrl ? (
// //     <Link href={`${pathname}/create`}>
// //       <Button icon={<DIcon icon="fa-plus" cdi={false} classCustom="!mx-0" />}>
// //         ایجاد
// //       </Button>
// //     </Link>
// //   ) : undefined;

// //   const onSelectButton = onSelect ? (
// //     <Button
// //       icon={<DIcon icon="fa-check" cdi={false} classCustom="!mx-0" />}
// //       onClick={() => {
// //         onSelect?.(selectedItems);
// //       }}
// //     >
// //       انتخاب
// //     </Button>
// //   ) : undefined;

// //   return (
// //     <div className={className}>
// //       <div className="flex justify-between items-center mb-6 px-1">
// //         {onSearch && (
// //           <Form schema={searchSchema} onSubmit={handleSearch} className="grow">
// //             <div className="flex justify-start">
// //               <div className="flex p-2 gap-1 rounded-lg items-center">
// //                 <div className="max-md:w-40 lg:w-64">
// //                   <Input
// //                     name="search"
// //                     variant="primary"
// //                     className="bg-white"
// //                     placeholder={searchPlaceholder}
// //                   />
// //                 </div>
// //                 <Button
// //                   variant="ghost"
// //                   type="submit"
// //                   size="xs"
// //                   className="h-full"
// //                   icon={<DIcon icon="fa-search" />}
// //                 ></Button>
// //               </div>
// //             </div>
// //           </Form>
// //         )}
// //         {actionButton}
// //         {onSelectButton}
// //         {quickCreate && (
// //           <ButtonCreate
// //             modalTitle="ایجاد سریع"
// //             modalContent={quickCreate}
// //           ></ButtonCreate>
// //         )}
// //       </div>

// //       {(filterOptions.length > 0 || dateFilterFields.length > 0) && (
// //         <div className="collapse collapse-arrow bg-white mb-4 relative z-10">
// //           <input type="checkbox" name="my-accordion-2" defaultChecked />
// //           <div className="collapse-title">
// //             <DIcon icon="fa-filter" />
// //             فیلتر ها ....
// //           </div>
// //           <div className="collapse-content">
// //             <div className="flex flex-col gap-4 p-2">
// //               <div className="flex flex-wrap items-center gap-4">
// //                 {filterOptions.map((filter) => (
// //                   <div
// //                     key={filter.name}
// //                     className="w-full md:w-auto grow md:grow-0"
// //                   >
// //                     <Select22
// //                       name={filter.name}
// //                       options={filter.options}
// //                       value={filtersValue.get(filter.name) || "all"}
// //                       onChange={(e) =>
// //                         handleFilterChange(filter.name, e.target.value)
// //                       }
// //                       placeholder={filter.label}
// //                     />
// //                   </div>
// //                 ))}
// //                 <Button
// //                   variant="ghost"
// //                   onClick={clear}
// //                   icon={
// //                     <DIcon
// //                       icon="fa-xmark"
// //                       cdi={false}
// //                       classCustom="!text-error"
// //                     />
// //                   }
// //                   className="!text-error"
// //                 >
// //                   حذف فیلترها
// //                 </Button>
// //               </div>

// //               {dateFilterFields.length > 0 && (
// //                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-gray-200 pt-4">
// //                   {dateFilterFields.map((field) => (
// //                     <React.Fragment key={field.name}>
// //                       <StandaloneDatePicker
// //                         name={`${field.name}_gte`}
// //                         label={`${field.label} (از)`}
// //                         value={filtersValue.get(`${field.name}_gte`) || null}
// //                         timeOfDay="start" // <--- **اضافه کردن این پراپ**
// //                         onChange={(payload) =>
// //                           handleFilterChange(
// //                             `${field.name}_gte`,
// //                             payload ? payload.iso : null
// //                           )
// //                         }
// //                       />
// //                       <StandaloneDatePicker
// //                         name={`${field.name}_lte`}
// //                         label={`${field.label} (تا)`}
// //                         value={filtersValue.get(`${field.name}_lte`) || null}
// //                         timeOfDay="end" // <--- **اضافه کردن این پراپ**
// //                         onChange={(payload) =>
// //                           handleFilterChange(
// //                             `${field.name}_lte`,
// //                             payload ? payload.iso : null
// //                           )
// //                         }
// //                       />
// //                     </React.Fragment>
// //                   ))}
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {error && (
// //         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
// //           {error}
// //         </div>
// //       )}

// //       <Table
// //         iconViewMode={{
// //           table: TableIcon(),
// //           card: CardIcon(),
// //           list: ListIcon(),
// //         }}
// //         listClassName={listClassName}
// //         loading={loading}
// //         loadingMessage={loadingMessage}
// //         noDataMessage={emptyMessage}
// //         columns={columns}
// //         data={data}
// //         pagination={pagination}
// //         paginationUI={{
// //           next: <DIcon icon="fa-angle-left" />,
// //           prev: <DIcon icon="fa-angle-right" />,
// //           last: <DIcon icon="fa-angles-left" />,
// //           first: <DIcon icon="fa-angles-right" />,
// //           className: "!bg-white border-[1px] border-gray-400",
// //         }}
// //         onPageChange={handlePageChange}
// //         defaultViewMode={defaultViewMode}
// //         listItemRender={listItemRender}
// //         showIconViews={showIconViews}
// //         selection={selectionMode}
// //         defaultSelected={selectedItems}
// //         onSelectionChange={handleSelectionChange}
// //       />
// //     </div>
// //   );
// // };

// // export default IndexWrapper;
