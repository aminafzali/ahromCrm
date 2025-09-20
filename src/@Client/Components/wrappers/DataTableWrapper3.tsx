"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import {
  ListIcon,
  TableIcon,
} from "@/@Client/Components/common/table/iconView";
import {
  FilterOption,
  FullQueryParams,
  PaginationResult,
} from "@/@Client/types";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Form, Input, Table } from "ndui-ahrom";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import MultiSelectFilter from "../ui/MultiSelectFilter";
import StandaloneDatePicker2 from "../ui/StandaloneDatePicker2";

const searchSchema = z.object({
  search: z.string(),
});

export interface KanbanColumnSource {
  id: string | number;
  title: string;
  [key: string]: any;
}

interface KanbanOptions<T> {
  enabled: boolean;
  groupByField: keyof T;
  columns: KanbanColumnSource[];
  cardRender: (item: T) => React.ReactNode;
  onCardDrop?: (
    itemId: string | number,
    newColumnId: string | number,
    oldColumnId: string | number
  ) => void;
}

interface DateFilterField {
  name: string;
  label: string;
}

interface DataTableWrapperProps<T> {
  columns: Column[];
  loading?: boolean;
  showIconViews?: boolean;
  error?: string | null;
  emptyMessage?: string;
  loadingMessage?: string;
  listClassName?: string;
  fetcher: (params: FullQueryParams) => Promise<PaginationResult<T>>;
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  dateFilterFields?: DateFilterField[];
  createUrl?: string;
  defaultViewMode?: "table" | "list" | "kanban";
  className?: string;
  cardClassName?: string;
  title?: string;
  extraFilter?: Record<string, any>;
  listItemRender?: (row: any) => React.ReactNode;
  kanbanOptions?: KanbanOptions<T>;
}

const KanbanCard = <T,>({
  item,
  options,
}: {
  item: T & { id: string | number };
  options: KanbanOptions<T>;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {options.cardRender(item)}
    </div>
  );
};

const KanbanColumn = <T,>({
  column,
  items,
  options,
}: {
  column: KanbanColumnSource;
  items: (T & { id: string | number })[];
  options: KanbanOptions<T>;
}) => {
  return (
    <div className="w-72 md:w-80 flex-shrink-0 bg-gray-100 dark:bg-slate-800 rounded-lg shadow-md">
      <h3 className="p-3 text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-slate-700">
        {column.title}{" "}
        <span className="text-sm text-gray-500">({items.length})</span>
      </h3>
      <div className="p-2 min-h-[400px] max-h-[70vh] overflow-y-auto">
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <KanbanCard key={item.id} item={item} options={options} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

const KanbanView = <T extends { id: number | string }>({
  data,
  options,
}: {
  data: T[];
  options: KanbanOptions<T>;
}) => {
  const [groupedData, setGroupedData] = useState<Record<string, T[]>>({});

  useEffect(() => {
    const groups = options.columns.reduce((acc, col) => {
      acc[col.id] = data.filter(
        (item) => String(item[options.groupByField]) === String(col.id)
      );
      return acc;
    }, {} as Record<string, T[]>);
    setGroupedData(groups);
  }, [data, options.columns, options.groupByField]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainerId = active.data.current?.sortable.containerId;
    const overContainerId =
      Object.keys(groupedData).find((key) => key === String(over.id)) ||
      over.data.current?.sortable.containerId;

    if (!activeContainerId || !overContainerId || active.id === over.id) {
      return;
    }
    if (activeContainerId === overContainerId) return;

    options.onCardDrop?.(active.id, overContainerId, activeContainerId);

    setGroupedData((prev) => {
      const activeItems = prev[activeContainerId];
      const overItems = prev[overContainerId];
      const activeIndex = activeItems.findIndex((i) => i.id === active.id);
      const [movedItem] = activeItems.splice(activeIndex, 1);
      overItems.push(movedItem);
      return {
        ...prev,
        [activeContainerId]: [...activeItems],
        [overContainerId]: [...overItems],
      };
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="flex space-x-4 overflow-x-auto p-2">
        {options.columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            items={groupedData[column.id] || []}
            options={options}
          />
        ))}
      </div>
    </DndContext>
  );
};

const DataTableWrapper3 = <T extends { id: number | string }>({
  columns,
  loading = false,
  showIconViews = true,
  error = null,
  emptyMessage = "هیچ داده‌ای یافت نشد",
  loadingMessage = "در حال بارگذاری",
  fetcher,
  searchPlaceholder = "جستجو...",
  filterOptions = [],
  dateFilterFields = [],
  createUrl,
  defaultViewMode = "list",
  className = "",
  listClassName = "",
  extraFilter,
  listItemRender,
  kanbanOptions = { enabled: false } as KanbanOptions<T>,
}: DataTableWrapperProps<T>) => {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersValue, setFilterValue] = useState(new Map<string, any>());
  const [viewMode, setViewMode] = useState(defaultViewMode);

  useEffect(() => {
    const limit = viewMode === "kanban" ? 1000 : pagination.limit;
    get(pagination.page, limit);
  }, [searchTerm, filtersValue, extraFilter, viewMode]);

  const get = async (page = 1, limit = pagination.limit) => {
    try {
      const params: any = { page, limit };
      if (searchTerm) params.search = searchTerm;
      filtersValue.forEach((value, key) => {
        if (value && (!Array.isArray(value) || value.length > 0)) {
          params[key] = Array.isArray(value) ? value.join(",") : value;
        }
      });
      if (extraFilter && Object.keys(extraFilter).length > 0) {
        const filteredExtraFilter = Object.fromEntries(
          Object.entries(extraFilter).filter(
            ([, value]) => value !== null && value !== undefined
          )
        );
        Object.assign(params, filteredExtraFilter);
      }
      const result = await fetcher(params);
      setData(result.data);
      if (viewMode !== "kanban") {
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handlePageChange = (page: number) => {
    get(page);
  };

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

  const hasActiveTags = Array.from(filtersValue.values()).some(
    (v) => Array.isArray(v) && v.length > 0
  );

  const handleSearch = (data: { search: string }) => {
    setSearchTerm(data.search);
  };

  const clear = () => {
    setFilterValue(new Map<string, any>());
  };

  const actionButton = createUrl ? (
    <Link href={createUrl}>
      <Button icon={<DIcon icon="fa-plus" cdi={false} classCustom="!mx-0" />}>
        ایجاد
      </Button>
    </Link>
  ) : undefined;

  const renderContent = () => {
    if (loading)
      return <div className="p-10 text-center">{loadingMessage}...</div>;
    if (error)
      return (
        <div className="p-4 text-red-700 bg-red-100 border border-red-400 rounded-lg">
          {error}
        </div>
      );
    if (!data || data.length === 0)
      return <div className="p-10 text-center">{emptyMessage}</div>;

    if (viewMode === "kanban" && kanbanOptions?.enabled) {
      return <KanbanView data={data} options={kanbanOptions} />;
    }

    return (
      <Table
        iconViewMode={{ table: TableIcon(), list: ListIcon() }}
        listClassName={listClassName}
        loading={loading}
        loadingMessage={loadingMessage}
        noDataMessage={emptyMessage}
        columns={columns}
        data={data}
        pagination={pagination}
        paginationUI={{
          next: <DIcon icon="fa-angle-left" />,
          prev: <DIcon icon="fa-angle-right" />,
          last: <DIcon icon="fa-angles-left" />,
          first: <DIcon icon="fa-angles-right" />,
          className:
            "!bg-white dark:!bg-slate-800 border-[1px] border-gray-400",
        }}
        onPageChange={handlePageChange}
        defaultViewMode={viewMode === "kanban" ? "list" : viewMode}
        listItemRender={listItemRender}
        showIconViews={false}
      />
    );
  };

  const KanbanIcon = () => (
    <svg
      className="w-4 h-4"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2 3a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm8 0a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1h-4a1 1 0 01-1-1V3z"></path>
    </svg>
  );

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-1">
        <div className="flex items-center gap-4">
          <Form schema={searchSchema} onSubmit={handleSearch} className="grow">
            <div className="flex items-center">
              <Input
                name="search"
                variant="primary"
                className="bg-white max-md:w-40 lg:w-64"
                placeholder={searchPlaceholder}
              />
              <Button
                variant="ghost"
                type="submit"
                size="xs"
                className="h-full"
                icon={<DIcon icon="fa-search" />}
              />
            </div>
          </Form>

          {showIconViews && (
            <div className="flex items-center p-1 bg-gray-200 dark:bg-slate-700 rounded-lg">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md ${
                  viewMode === "table"
                    ? "bg-white dark:bg-slate-600 shadow"
                    : ""
                }`}
              >
                <TableIcon />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md ${
                  viewMode === "list" ? "bg-white dark:bg-slate-600 shadow" : ""
                }`}
              >
                <ListIcon />
              </button>
              {kanbanOptions?.enabled && (
                <button
                  onClick={() => setViewMode("kanban")}
                  className={`p-1.5 rounded-md ${
                    viewMode === "kanban"
                      ? "bg-white dark:bg-slate-600 shadow"
                      : ""
                  }`}
                >
                  <KanbanIcon />
                </button>
              )}
            </div>
          )}
        </div>
        {actionButton}
      </div>

      {(filterOptions.length > 0 || dateFilterFields.length > 0) && (
        <div className="collapse collapse-arrow bg-white dark:bg-slate-800 mb-4 relative z-30">
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
                    <StandaloneDatePicker2
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
                    <StandaloneDatePicker2
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

      <div className="mt-4">{renderContent()}</div>
    </div>
  );
};

export default DataTableWrapper3;

// "use client";

// import DIcon from "@/@Client/Components/common/DIcon";
// import {
//   CardIcon,
//   ListIcon,
//   TableIcon,
// } from "@/@Client/Components/common/table/iconView";
// import {
//   FilterOption,
//   FullQueryParams,
//   PaginationResult,
// } from "@/@Client/types";
// import {
//   DndContext,
//   DragEndEvent,
//   KeyboardSensor,
//   PointerSensor,
//   closestCorners,
//   useSensor,
//   useSensors,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   arrayMove,
//   sortableKeyboardCoordinates,
//   useSortable,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Button, Form, Input, Table } from "ndui-ahrom";
// import { Column } from "ndui-ahrom/dist/components/Table/Table";
// import Link from "next/link";
// import React, { useEffect, useMemo, useState } from "react";
// import { z } from "zod";
// import MultiSelectFilter from "../ui/MultiSelectFilter";
// import StandaloneDatePicker2 from "../ui/StandaloneDatePicker2";

// const searchSchema = z.object({
//   search: z.string(),
// });

// interface DateFilterField {
//   name: string;
//   label: string;
// }

// // ===== شروع بخش ۱: افزودن پراپ‌های کانبان به اینترفیس اصلی =====
// export interface KanbanColumnSource {
//   id: string | number;
//   title: string;
//   [key: string]: any;
// }

// interface KanbanOptions<T> {
//   enabled: boolean;
//   groupByField: keyof T;
//   columns: KanbanColumnSource[];
//   cardRender: (item: T) => React.ReactNode;
//   onCardDrop?: (
//     itemId: string | number,
//     newColumnId: string | number,
//     oldColumnId: string | number
//   ) => void;
// }

// interface DataTableWrapperProps<T> {
//   columns: Column[];
//   loading?: boolean;
//   showIconViews?: boolean;
//   error?: string | null;
//   emptyMessage?: string;
//   loadingMessage?: string;
//   listClassName?: string;
//   onPageChange?: (page: number) => void;
//   onClear?: () => void;
//   onSearch?: boolean;
//   fetcher: (params: FullQueryParams) => Promise<PaginationResult<T>>;
//   searchPlaceholder?: string;
//   filterOptions?: FilterOption[];
//   dateFilterFields?: DateFilterField[];
//   extraFilter?: Record<string, any>;
//   onFilterChange?: (name: string, value: string) => void;
//   createUrl?: string;
//   defaultViewMode?: "table" | "list" | "kanban"; // "kanban" اضافه شد
//   className?: string;
//   cardClassName?: string;
//   title?: string;
//   listItemRender?: (row: any) => React.ReactNode;
//   kanbanOptions?: KanbanOptions<T>; // پراپ جدید برای تنظیمات کانبان
// }
// // ===== پایان بخش ۱ =====

// // ===== شروع بخش ۲: کامپوننت‌های داخلی برای نمایش کانبان با @dnd-kit =====
// const KanbanCard = <T,>({
//   item,
//   options,
// }: {
//   item: T & { id: string | number };
//   options: KanbanOptions<T>;
// }) => {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id: item.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     zIndex: isDragging ? 10 : 1,
//     opacity: isDragging ? 0.8 : 1,
//   };

//   return (
//     <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
//       {options.cardRender(item)}
//     </div>
//   );
// };

// const KanbanColumn = <T,>({
//   column,
//   items,
//   options,
// }: {
//   column: KanbanColumnSource;
//   items: (T & { id: string | number })[];
//   options: KanbanOptions<T>;
// }) => {
//   return (
//     <div className="w-72 md:w-80 flex-shrink-0 bg-gray-100 dark:bg-slate-800 rounded-lg shadow-md">
//       <h3 className="p-3 text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-slate-700">
//         {column.title}{" "}
//         <span className="text-sm text-gray-500">({items.length})</span>
//       </h3>
//       <div className="p-2 min-h-[400px] max-h-[70vh] overflow-y-auto">
//         <SortableContext
//           items={items.map((i) => i.id)}
//           strategy={verticalListSortingStrategy}
//         >
//           <div className="flex flex-col gap-3">
//             {items.map((item) => (
//               <KanbanCard key={item.id} item={item} options={options} />
//             ))}
//           </div>
//         </SortableContext>
//       </div>
//     </div>
//   );
// };

// const KanbanView = <T extends { id: number | string }>({
//   data,
//   options,
// }: {
//   data: T[];
//   options: KanbanOptions<T>;
// }) => {
//   const [groupedData, setGroupedData] = useState<Record<string, T[]>>({});

//   useEffect(() => {
//     const groups = options.columns.reduce((acc, col) => {
//       acc[col.id] = data.filter(
//         (item) => String(item[options.groupByField]) === String(col.id)
//       );
//       return acc;
//     }, {} as Record<string, T[]>);
//     setGroupedData(groups);
//   }, [data, options.columns, options.groupByField]);

//   const sensors = useSensors(
//     useSensor(PointerSensor),
//     useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
//   );

//   const handleDragEnd = (event: DragEndEvent) => {
//     const { active, over } = event;
//     if (!over) return;

//     const activeContainerId = active.data.current?.sortable.containerId;
//     const overContainerId =
//       Object.keys(groupedData).find((key) => key === String(over.id)) ||
//       over.data.current?.sortable.containerId;

//     if (!activeContainerId || !overContainerId || active.id === over.id) return;
//     if (activeContainerId === overContainerId) return; // فعلا جابجایی در یک ستون را مدیریت نمی‌کنیم

//     options.onCardDrop?.(active.id, overContainerId, activeContainerId);

//     setGroupedData((prev) => {
//         const activeItems = prev[activeContainerId];
//         const overItems = prev[overContainerId];
//         const activeIndex = activeItems.findIndex((i) => i.id === active.id);
//         const [movedItem] = activeItems.splice(activeIndex, 1);
//         overItems.push(movedItem);
//         return {
//             ...prev,
//             [activeContainerId]: [...activeItems],
//             [overContainerId]: [...overItems],
//         };
//     });
//   };

//   return (
//     <DndContext
//       sensors={sensors}
//       collisionDetection={closestCorners}
//       onDragEnd={handleDragEnd}
//     >
//       <div className="flex space-x-4 overflow-x-auto p-2">
//         {options.columns.map((column) => (
//           <KanbanColumn
//             key={column.id}
//             column={column}
//             items={groupedData[column.id] || []}
//             options={options}
//           />
//         ))}
//       </div>
//     </DndContext>
//   );
// };
// // ===== پایان بخش ۲ =====

// const DataTableWrapper3 = <T extends { id: number | string }>({
//   columns,
//   loading = false,
//   showIconViews = true,
//   error = null,
//   emptyMessage = "هیچ داده‌ای یافت نشد",
//   loadingMessage = "در حال بارگذاری",
//   fetcher,
//   onSearch = true,
//   searchPlaceholder = "جستجو...",
//   filterOptions = [],
//   dateFilterFields = [],
//   createUrl,
//   defaultViewMode = "list",
//   className = "",
//   cardClassName = "",
//   listClassName = "",
//   title = "",
//   extraFilter,
//   onClear,
//   listItemRender,
//   kanbanOptions = { enabled: false } as KanbanOptions<T>,
// }: DataTableWrapperProps<T>) => {
//   const [data, setData] = useState<T[]>([]);
//   const [pagination, setPagination] = useState({
//     total: 0,
//     pages: 1,
//     page: 1,
//     limit: 10,
//   });
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filtersValue, setFilterValue] = useState(new Map<string, any>());
//   const [viewMode, setViewMode] = useState(defaultViewMode);

//   useEffect(() => {
//     const limit = viewMode === "kanban" ? 1000 : pagination.limit;
//     get(pagination.page, limit);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [searchTerm, filtersValue, extraFilter, viewMode]);

//   const get = async (page = 1, limit = pagination.limit) => {
//     try {
//       const params: any = { page, limit };
//       if (searchTerm) params.search = searchTerm;
//       filtersValue.forEach((value, key) => {
//         if (value && (!Array.isArray(value) || value.length > 0)) {
//           params[key] = Array.isArray(value) ? value.join(",") : value;
//         }
//       });
//       if (extraFilter && Object.keys(extraFilter).length > 0) {
//         const filteredExtraFilter = Object.fromEntries(
//           Object.entries(extraFilter).filter(
//             ([, value]) => value !== null && value !== undefined
//           )
//         );
//         Object.assign(params, filteredExtraFilter);
//       }
//       const result = await fetcher(params);
//       setData(result.data);
//       if (viewMode !== 'kanban') {
//         setPagination(result.pagination);
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   const handlePageChange = (page: number) => {
//     get(page);
//   };

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

//   const hasActiveTags = Array.from(filtersValue.values()).some(
//     (v) => Array.isArray(v) && v.length > 0
//   );

//   const handleSearch = (data: { search: string }) => {
//     setSearchTerm(data.search);
//   };

//   const clear = () => {
//     setFilterValue(new Map<string, any>());
//     onClear?.();
//   };

//   const actionButton = createUrl ? (
//     <Link href={createUrl}>
//       <Button icon={<DIcon icon="fa-plus" cdi={false} classCustom="!mx-0" />}>
//         ایجاد
//       </Button>
//     </Link>
//   ) : undefined;

//   // ===== شروع بخش ۳: منطق رندر شرطی محتوا (جدول، لیست یا کانبان) =====
//   const renderContent = () => {
//     if (loading) return <div className="p-10 text-center">{loadingMessage}...</div>;
//     if (error) return <div className="p-4 text-red-700 bg-red-100 border border-red-400 rounded-lg">{error}</div>;
//     if (!data || data.length === 0) return <div className="p-10 text-center">{emptyMessage}</div>;

//     if (viewMode === "kanban" && kanbanOptions?.enabled) {
//       return <KanbanView data={data} options={kanbanOptions} />;
//     }

//     // استفاده از کامپوننت Table اصلی شما برای نماهای دیگر
//     return (
//       <Table
//         iconViewMode={{ table: TableIcon(), card: CardIcon(), list: ListIcon() }}
//         listClassName={listClassName}
//         loading={loading}
//         loadingMessage={loadingMessage}
//         noDataMessage={emptyMessage}
//         columns={columns}
//         data={data}
//         pagination={pagination}
//         paginationUI={{
//           next: <DIcon icon="fa-angle-left" />,
//           prev: <DIcon icon="fa-angle-right" />,
//           last: <DIcon icon="fa-angles-left" />,
//           first: <DIcon icon="fa-angles-right" />,
//           className: "!bg-white dark:!bg-slate-800 border-[1px] border-gray-400",
//         }}
//         onPageChange={handlePageChange}
//         defaultViewMode={defaultViewMode === 'kanban' ? 'list' : defaultViewMode}
//         listItemRender={listItemRender}
//         showIconViews={false} // دکمه‌های تغییر نما را خودمان مدیریت می‌کنیم
//       />
//     );
//   };

//   const KanbanIcon = () => (
//     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//       <path d="M2 3a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm8 0a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1h-4a1 1 0 01-1-1V3z"></path>
//     </svg>
//   );
//   // ===== پایان بخش ۳ =====

//   return (
//     <div className={className}>
//       <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-1">
//         <div className="flex items-center gap-4">
//           {onSearch && (
//             <Form schema={searchSchema} onSubmit={handleSearch} className="grow">
//               <div className="flex items-center">
//                 <Input
//                   name="search"
//                   variant="primary"
//                   className="bg-white max-md:w-40 lg:w-64"
//                   placeholder={searchPlaceholder}
//                 />
//                 <Button variant="ghost" type="submit" size="xs" className="h-full" icon={<DIcon icon="fa-search" />} />
//               </div>
//             </Form>
//           )}

//           {/* ===== شروع بخش ۴: مدیریت دکمه‌های تغییر نما ===== */}
//           {showIconViews && (
//             <div className="flex items-center p-1 bg-gray-200 dark:bg-slate-700 rounded-lg">
//               <button onClick={() => setViewMode("table")} className={`p-2 rounded-md ${viewMode === "table" ? "bg-white dark:bg-slate-600 shadow" : ""}`}>
//                 <TableIcon />
//               </button>
//               <button onClick={() => setViewMode("list")} className={`p-2 rounded-md ${viewMode === "list" ? "bg-white dark:bg-slate-600 shadow" : ""}`}>
//                 <ListIcon />
//               </button>
//               {kanbanOptions?.enabled && (
//                 <button onClick={() => setViewMode("kanban")} className={`p-2 rounded-md ${viewMode === "kanban" ? "bg-white dark:bg-slate-600 shadow" : ""}`}>
//                   <KanbanIcon />
//                 </button>
//               )}
//             </div>
//           )}
//           {/* ===== پایان بخش ۴ ===== */}
//         </div>
//         {actionButton}
//       </div>

//       {(filterOptions.length > 0 || dateFilterFields.length > 0) && (
//         <div className="collapse collapse-arrow bg-white dark:bg-slate-800 mb-4 relative z-30">
//           <input type="checkbox" name="my-accordion-2" />
//           <div className="collapse-title text-slate-800 dark:text-slate-200">
//             <DIcon icon="fa-filter" /> فیلترها
//           </div>
//           <div className="collapse-content overflow-visible">
//             <div className="flex flex-wrap items-center gap-3">
//               {filterOptions.map((filter) => (
//                 <div key={filter.name} className="w-full sm:w-auto md:w-52">
//                   <MultiSelectFilter
//                     label={filter.label}
//                     options={filter.options}
//                     selectedValues={filtersValue.get(filter.name) || []}
//                     onChange={(values) => handleFilterChange(filter.name, values)}
//                   />
//                 </div>
//               ))}
//               <div className="ml-auto">
//                 <Button variant="ghost" onClick={clear} className="!text-error">
//                   پاک کردن همه
//                 </Button>
//               </div>
//             </div>
//             {hasActiveTags && (
//               <div className="flex flex-wrap items-center gap-2 pt-3">
//                 {Array.from(filtersValue.entries()).map(([key, values]) =>
//                   Array.isArray(values) && values.map((value) => (
//                     <div key={`${key}-${value}`} className="group flex items-center bg-teal-50 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-sm font-medium pl-3 pr-1.5 py-1 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-slate-700">
//                       <span>{optionsMap.get(`${key}-${value}`) || value}</span>
//                       <button onClick={() => handleRemoveFilterTag(key, value)} className="flex-shrink-0 ml-1.5 h-5 w-5 rounded-full inline-flex items-center justify-center">
//                         <DIcon icon="fa-times" classCustom="text-teal-500 dark:text-teal-400 group-hover:text-teal-700 text-xs" />
//                       </button>
//                     </div>
//                   ))
//                 )}
//               </div>
//             )}
//             {dateFilterFields.length > 0 && (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
//                 {dateFilterFields.map((field) => (
//                   <React.Fragment key={field.name}>
//                     <StandaloneDatePicker2
//                       name={`${field.name}_gte`}
//                       label={`${field.label} (از)`}
//                       value={filtersValue.get(`${field.name}_gte`) || null}
//                       timeOfDay="start"
//                       onChange={(payload) => handleFilterChange(`${field.name}_gte`, payload ? payload.iso : null)}
//                     />
//                     <StandaloneDatePicker2
//                       name={`${field.name}_lte`}
//                       label={`${field.label} (تا)`}
//                       value={filtersValue.get(`${field.name}_lte`) || null}
//                       timeOfDay="end"
//                       onChange={(payload) => handleFilterChange(`${field.name}_lte`, payload ? payload.iso : null)}
//                     />
//                   </React.Fragment>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       <div className="mt-4">{renderContent()}</div>
//     </div>
//   );
// };

// export default DataTableWrapper3;
