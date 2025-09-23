// مسیر : src/@Client/Components/wrappers/DataTableWrapper4.tsx
"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { ListIcon, TableIcon } from "@/@Client/Components/common/table/iconView";
import { FilterOption, FullQueryParams, PaginationResult } from "@/@Client/types";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Form, Input, Table } from "ndui-ahrom";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { z } from "zod";
import MultiSelectFilter from "../ui/MultiSelectFilter";
import StandaloneDatePicker2 from "../ui/StandaloneDatePicker2";

const searchSchema = z.object({ search: z.string() });

export interface KanbanColumnSource {
  id: string | number;
  title: string;
  [key: string]: any;
}

// داده‌های گروه‌بندی‌شده کانبان
type KanbanGroupedData<T> = Record<string, T[]>;

interface KanbanOptions<T> {
  enabled: boolean;
  cardRender: (item: T) => React.ReactNode;
  onCardDrop?: (active: any, over: any) => void;
  groupedData: KanbanGroupedData<T>;
  columns: KanbanColumnSource[];
}

interface KanbanTouchConfig {
  delay?: number; // ms for TouchSensor activation
  tolerance?: number;
  pointerDistance?: number;
}

interface DateFilterField {
  name: string;
  label: string;
}
export interface CustomFilterItem {
  id: number | string;
  name: string | null;
  type: string;
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
  customFilterComponent?: React.ReactNode;
  customFilterItems?: CustomFilterItem[];
  onCustomFilterItemRemove?: (item: CustomFilterItem) => void;
  kanbanTouchConfig?: KanbanTouchConfig;
}

/** کارت کانبان — هر کارت با id یکتا task-<id> شناخته می‌شود */
const KanbanCard = <T,>({
  item,
  options,
}: {
  item: T & { id: string | number };
  options: KanbanOptions<T>;
}) => {
  // useSortable با id ای که wrapper صفحه تولید می‌کند: `task-<id>`
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `task-${item.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 9999 : "auto",
    touchAction: "none" as const,
    WebkitUserSelect: "none" as const,
    userSelect: "none" as const,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {options.cardRender(item)}
    </div>
  );
};

/**
 * KanbanColumn:
 * - هر ستون خودش را به عنوان droppable ثبت می‌کند با id = `col-<id>`
 * - داخل ستون SortableContext داریم که آیتم‌ها را با id = `task-<id>` مدیریت می‌کند
 * - این ساختار باعث می‌شود حتی ستون‌های خالی نیز قابل شناسایی (over) و قابل دراپ باشند
 */
const KanbanColumn = <T,>({
  id,
  title,
  items,
  options,
}: {
  id: string | number;
  title: string;
  items: (T & { id: string | number })[];
  options: KanbanOptions<T>;
}) => {
  // droppable registration برای ستون (مهم برای ستون‌های خالی)
  const droppableId = `col-${String(id)}`;
  const { isOver, setNodeRef: setDroppableRef } = useDroppable({ id: droppableId });

  return (
    <div
      ref={setDroppableRef}
      className={`w-72 md:w-80 flex-shrink-0 rounded-lg border flex flex-col transition-all duration-150 ${
        isOver ? "bg-teal-700/10 dark:bg-teal-900/20 border-teal-700" : "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
      }`}
      // ensure touch scrolling is smooth
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <h3 className="p-3 text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-slate-700">
        {title} <span className="text-sm text-gray-500">({items.length})</span>
      </h3>

      <SortableContext id={droppableId} items={items.map((i) => `task-${i.id}`)} strategy={verticalListSortingStrategy}>
        <div className="p-2 min-h-[200px] max-h-[70vh] overflow-y-auto flex flex-col gap-3">
          {items.map((item) => (
            <KanbanCard key={`task-${item.id}`} item={item} options={options} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

// ====================================================================================
// KanbanView: کنترل‌شده، پشتیبانی از TouchSensor و over tracking دقیق
// ====================================================================================
const KanbanView = <T extends { id: number | string }>({
  options,
  touchConfig = { delay: 150, tolerance: 5, pointerDistance: 5 },
}: {
  options: KanbanOptions<T>;
  touchConfig?: KanbanTouchConfig;
}) => {
  const [activeItem, setActiveItem] = useState<T | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: touchConfig.pointerDistance ?? 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    useSensor(TouchSensor, { activationConstraint: { delay: touchConfig.delay ?? 150, tolerance: touchConfig.tolerance ?? 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const allItems = Object.values(options.groupedData).flat();
    const rawId = String(active.id);
    const found = allItems.find((i) => `task-${i.id}` === rawId || String(i.id) === rawId);
    setActiveItem(found || null);
  };

  // onDragOver لازم نیست کار خاصی بکنه چون useDroppable روی ستون‌ها باعث میشه DndContext.toOver دقیق‌تر باشه
  const handleDragOver = (_event: DragOverEvent) => {
    // no-op (برای آینده می‌تونیم اینجا UI پیچیده‌تری بذاریم)
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);
    if (over && options.onCardDrop) {
      options.onCardDrop(active, over);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto p-2">
        {options.columns.map((column) => (
          // هر ستون کاملاً مستقل است؛ KanbanColumn خودش droppable را ثبت می‌کند
          <div key={`col-wrapper-${column.id}`} className="flex-shrink-0">
            <KanbanColumn id={String(column.id)} title={column.title} items={options.groupedData[String(column.id)] || []} options={options} />
          </div>
        ))}
      </div>

      {createPortal(
        <DragOverlay>
          {activeItem ? <div className="rounded-lg shadow-xl">{options.cardRender(activeItem)}</div> : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};
// ====================================================================================
// END KanbanView
// ====================================================================================

const DataTableWrapper4 = <T extends { id: number | string }>({
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
  kanbanOptions,
  customFilterComponent,
  customFilterItems = [],
  onCustomFilterItemRemove,
  kanbanTouchConfig,
}: DataTableWrapperProps<T> & { kanbanTouchConfig?: KanbanTouchConfig }) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        const filteredExtraFilter = Object.fromEntries(Object.entries(extraFilter).filter(([, value]) => value !== null && value !== undefined));
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

  const handlePageChange = (page: number) => get(page);
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
    filterOptions.forEach((filter) =>
      filter.options.forEach((option) =>
        map.set(`${filter.name}-${option.value}`, option.label)
      )
    );
    return map;
  }, [filterOptions]);

  const handleRemoveFilterTag = (filterName: string, valueToRemove: string) => {
    const currentValues = filtersValue.get(filterName) || [];
    if (!Array.isArray(currentValues)) return;
    const newValues = currentValues.filter((v: string) => v !== valueToRemove);
    handleFilterChange(filterName, newValues);
  };

  const hasActiveTags = Array.from(filtersValue.values()).some((v) => Array.isArray(v) && v.length > 0);
  const handleSearch = (data: { search: string }) => setSearchTerm(data.search);
  const clear = () => setFilterValue(new Map<string, any>());

  const actionButton = createUrl ? (
    <Link href={createUrl}>
      <Button icon={<DIcon icon="fa-plus" cdi={false} classCustom="!mx-0" />}>ایجاد</Button>
    </Link>
  ) : undefined;

  const renderContent = () => {
    if (loading) return <div className="p-10 text-center">{loadingMessage}...</div>;
    if (error)
      return (
        <div className="p-4 text-red-700 bg-red-100 border border-red-400 rounded-lg">
          {error}
        </div>
      );

    if (viewMode === "kanban" && kanbanOptions?.enabled) {
      return <KanbanView options={kanbanOptions} touchConfig={kanbanTouchConfig} />;
    }

    if (viewMode !== "kanban" && (!data || data.length === 0)) {
      return <div className="p-10 text-center">{emptyMessage}</div>;
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
          className: "!bg-white dark:!bg-slate-800 border-[1px] border-gray-400",
        }}
        onPageChange={handlePageChange}
        defaultViewMode={viewMode === "kanban" ? "list" : viewMode}
        listItemRender={listItemRender}
        showIconViews={false}
      />
    );
  };

  const KanbanIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 3a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm8 0a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1h-4a1 1 0 01-1-1V3z"></path>
    </svg>
  );

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-1">
        <div className="flex items-center gap-4">
          <Form schema={searchSchema} onSubmit={handleSearch} className="grow">
            <div className="flex items-center">
              <Input name="search" variant="primary" className="bg-white max-md:w-40 lg:w-64" placeholder={searchPlaceholder} />
              <Button variant="ghost" type="submit" size="xs" className="h-full" icon={<DIcon icon="fa-search" />} />
            </div>
          </Form>
          {showIconViews && (
            <div className="flex items-center p-1 bg-gray-200 dark:bg-slate-700 rounded-lg">
              <button onClick={() => setViewMode("table")} className={`p-1.5 rounded-md ${viewMode === "table" ? "bg-white dark:bg-slate-600 shadow" : ""}`}>
                <TableIcon />
              </button>
              <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md ${viewMode === "list" ? "bg-white dark:bg-slate-600 shadow" : ""}`}>
                <ListIcon />
              </button>
              {kanbanOptions?.enabled && (
                <button onClick={() => setViewMode("kanban")} className={`p-1.5 rounded-md ${viewMode === "kanban" ? "bg-white dark:bg-slate-600 shadow" : ""}`}>
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
              {customFilterComponent && <div>{customFilterComponent}</div>}
              {filterOptions.map((filter) => (
                <div key={filter.name} className="w-full sm:w-auto md:w-52">
                  <MultiSelectFilter label={filter.label} options={filter.options} selectedValues={filtersValue.get(filter.name) || []} onChange={(values) => handleFilterChange(filter.name, values)} />
                </div>
              ))}
              {(hasActiveTags || dateFilterFields.some((f) => filtersValue.has(`${f.name}_gte`) || filtersValue.has(`${f.name}_lte`))) && (
                <div className="ml-auto self-center">
                  <Button variant="ghost" onClick={clear} className="!text-error">پاک کردن فیلترها</Button>
                </div>
              )}
            </div>

            {hasActiveTags && (
              <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-slate-700">
                {Array.from(filtersValue.entries()).map(
                  ([key, values]) =>
                    Array.isArray(values) &&
                    values.map((value) => (
                      <div key={`${key}-${value}`} className="group flex items-center bg-teal-50 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-sm font-medium pl-3 pr-1.5 py-1 rounded-full">
                        <span>{optionsMap.get(`${key}-${value}`) || value}</span>
                        <button onClick={() => handleRemoveFilterTag(key, value)} className="flex-shrink-0 ml-1.5 h-5 w-5 rounded-full inline-flex items-center justify-center">
                          <DIcon icon="fa-times" classCustom="text-teal-500 dark:text-teal-400 group-hover:text-teal-700 text-xs" />
                        </button>
                      </div>
                    ))
                )}
              </div>
            )}

            {customFilterItems.length > 0 && (
              <div className={`flex flex-wrap items-center gap-2 pt-3 ${hasActiveTags ? "pt-2" : "mt-3 border-t border-gray-200 dark:border-slate-700"}`}>
                {customFilterItems.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="group flex items-center bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 text-sm font-medium pl-3 pr-1.5 py-1 rounded-full">
                    <span>{item.name}</span>
                    <button onClick={() => onCustomFilterItemRemove?.(item)} className="flex-shrink-0 ml-1.5 h-5 w-5 rounded-full inline-flex items-center justify-center">
                      <DIcon icon="fa-times" classCustom="text-orange-500 dark:text-orange-400 group-hover:text-orange-700 text-xs" />
                    </button>
                  </div>
                ))}
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
                      onChange={(payload) => handleFilterChange(`${field.name}_gte`, payload ? payload.iso : null)}
                    />
                    <StandaloneDatePicker2
                      name={`${field.name}_lte`}
                      label={`${field.label} (تا)`}
                      value={filtersValue.get(`${field.name}_lte`) || null}
                      timeOfDay="end"
                      onChange={(payload) => handleFilterChange(`${field.name}_lte`, payload ? payload.iso : null)}
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

export default DataTableWrapper4;


// // // مسیر: src/@Client/Components/wrappers/DataTableWrapper4.tsx
// "use client";

// import DIcon from "@/@Client/Components/common/DIcon";
// import {
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
//   DragMoveEvent,
//   DragOverlay,
//   DragStartEvent,
//   KeyboardSensor,
//   PointerSensor,
//   TouchSensor,
//   closestCenter,
//   useDroppable,
//   useSensor,
//   useSensors,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   sortableKeyboardCoordinates,
//   useSortable,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Button, Form, Input, Table } from "ndui-ahrom";
// import { Column } from "ndui-ahrom/dist/components/Table/Table";
// import Link from "next/link";
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { createPortal } from "react-dom";
// import { z } from "zod";
// import MultiSelectFilter from "../ui/MultiSelectFilter";
// import StandaloneDatePicker2 from "../ui/StandaloneDatePicker2";

// const searchSchema = z.object({ search: z.string() });

// export interface KanbanColumnSource {
//   id: string | number;
//   title: string;
//   [key: string]: any;
// }

// type KanbanGroupedData<T> = Record<string, T[]>;

// interface KanbanOptions<T> {
//   enabled: boolean;
//   cardRender: (item: T) => React.ReactNode;
//   onCardDrop?: (active: any, over: any) => void;
//   groupedData: KanbanGroupedData<T>;
//   columns: KanbanColumnSource[];
// }

// interface KanbanTouchConfig {
//   delay?: number; // ms for TouchSensor activation
//   tolerance?: number;
//   pointerDistance?: number;
//   edgeThreshold?: number; // pixels from left/right edge where autoscroll starts
//   maxScrollSpeed?: number; // px per frame (approx)
// }

// interface DateFilterField {
//   name: string;
//   label: string;
// }
// export interface CustomFilterItem {
//   id: number | string;
//   name: string | null;
//   type: string;
// }

// interface DataTableWrapperProps<T> {
//   columns: Column[];
//   loading?: boolean;
//   showIconViews?: boolean;
//   error?: string | null;
//   emptyMessage?: string;
//   loadingMessage?: string;
//   listClassName?: string;
//   fetcher: (params: FullQueryParams) => Promise<PaginationResult<T>>;
//   searchPlaceholder?: string;
//   filterOptions?: FilterOption[];
//   dateFilterFields?: DateFilterField[];
//   createUrl?: string;
//   defaultViewMode?: "table" | "list" | "kanban";
//   className?: string;
//   cardClassName?: string;
//   title?: string;
//   extraFilter?: Record<string, any>;
//   listItemRender?: (row: any) => React.ReactNode;
//   kanbanOptions?: KanbanOptions<T>;
//   customFilterComponent?: React.ReactNode;
//   customFilterItems?: CustomFilterItem[];
//   onCustomFilterItemRemove?: (item: CustomFilterItem) => void;
//   kanbanTouchConfig?: KanbanTouchConfig;
// }

// /** کارت کانبان — id کارت به شکل `task-<id>` ثبت می‌شود */
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
//   } = useSortable({ id: `task-${item.id}` });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     opacity: isDragging ? 0.5 : 1,
//     zIndex: isDragging ? 9999 : "auto",
//     touchAction: "none" as const,
//     WebkitUserSelect: "none" as const,
//     userSelect: "none" as const,
//   };

//   return (
//     <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
//       {options.cardRender(item)}
//     </div>
//   );
// };

// /**
//  * KanbanColumn:
//  * هر ستون را به‌صورت droppable با id = `col-<id>` ثبت می‌کنیم.
//  * با این کار ستون‌های خالی نیز قابل over و دراپ هستند.
//  */
// const KanbanColumn = <T,>({
//   id,
//   title,
//   items,
//   options,
// }: {
//   id: string | number;
//   title: string;
//   items: (T & { id: string | number })[];
//   options: KanbanOptions<T>;
// }) => {
//   const droppableId = `col-${String(id)}`;
//   const { isOver, setNodeRef: setDroppableRef } = useDroppable({
//     id: droppableId,
//   });

//   return (
//     <div
//       ref={setDroppableRef}
//       className={`w-72 md:w-80 flex-shrink-0 rounded-lg border flex flex-col transition-all duration-150 ${
//         isOver
//           ? "bg-teal-700/10 dark:bg-teal-900/20 border-teal-700"
//           : "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
//       }`}
//       style={{ WebkitOverflowScrolling: "touch" }}
//     >
//       <h3 className="p-3 text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-slate-700">
//         {title} <span className="text-sm text-gray-500">({items.length})</span>
//       </h3>

//       <SortableContext
//         id={droppableId}
//         items={items.map((i) => `task-${i.id}`)}
//         strategy={verticalListSortingStrategy}
//       >
//         <div className="p-2 min-h-[200px] max-h-[70vh] overflow-y-auto flex flex-col gap-3">
//           {items.map((item) => (
//             <KanbanCard key={`task-${item.id}`} item={item} options={options} />
//           ))}
//         </div>
//       </SortableContext>
//     </div>
//   );
// };

// // ====================================================================================
// // KanbanView: کنترل‌شده، پشتیبانی از TouchSensor و autoscroll افقی هنگام درگ
// // ====================================================================================
// const KanbanView = <T extends { id: number | string }>({
//   options,
//   touchConfig = {
//     delay: 150,
//     tolerance: 5,
//     pointerDistance: 6,
//     edgeThreshold: 90,
//     maxScrollSpeed: 18,
//   },
// }: {
//   options: KanbanOptions<T>;
//   touchConfig?: KanbanTouchConfig;
// }) => {
//   const [activeItem, setActiveItem] = useState<T | null>(null);

//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const pointerXRef = useRef<number | null>(null);
//   const rafRef = useRef<number | null>(null);
//   const draggingRef = useRef(false);

//   const sensors = useSensors(
//     useSensor(PointerSensor, {
//       activationConstraint: { distance: touchConfig.pointerDistance ?? 6 },
//     }),
//     useSensor(KeyboardSensor, {
//       coordinateGetter: sortableKeyboardCoordinates,
//     }),
//     useSensor(TouchSensor, {
//       activationConstraint: {
//         delay: touchConfig.delay ?? 150,
//         tolerance: touchConfig.tolerance ?? 5,
//       },
//     })
//   );

//   const onPointerMove = (ev: PointerEvent | TouchEvent) => {
//     let clientX: number | null = null;
//     if ("touches" in ev && ev.touches && ev.touches[0]) {
//       clientX = ev.touches[0].clientX;
//     } else if (
//       "clientX" in ev &&
//       typeof (ev as PointerEvent).clientX === "number"
//     ) {
//       clientX = (ev as PointerEvent).clientX;
//     }
//     pointerXRef.current = clientX;
//   };

//   const startAutoScrollLoop = () => {
//     if (rafRef.current) return;
//     const step = () => {
//       try {
//         const el = containerRef.current;
//         const px = pointerXRef.current;
//         if (!el || px == null || !draggingRef.current) {
//           rafRef.current = requestAnimationFrame(step);
//           return;
//         }
//         const rect = el.getBoundingClientRect();
//         const left = rect.left;
//         const right = rect.right;
//         const threshold = touchConfig.edgeThreshold ?? 90;
//         let delta = 0;

//         if (px < left + threshold) {
//           // نزدیک لبه چپ => اسکرول به چپ
//           const intensity = (threshold - (px - left)) / threshold; // 0..1
//           delta = Math.round(
//             -(touchConfig.maxScrollSpeed ?? 16) * Math.max(0.08, intensity)
//           );
//         } else if (px > right - threshold) {
//           // نزدیک لبه راست => اسکرول به راست
//           const intensity = (px - (right - threshold)) / threshold; // 0..1
//           delta = Math.round(
//             (touchConfig.maxScrollSpeed ?? 16) * Math.max(0.08, intensity)
//           );
//         }

//         if (delta !== 0) {
//           // تغییر گام اسکرول؛ از حداقل/حداکثر جلوگیری می‌کنیم
//           el.scrollLeft = Math.max(0, el.scrollLeft + delta);
//         }
//       } catch (e) {
//         // ignore
//       } finally {
//         rafRef.current = requestAnimationFrame(step);
//       }
//     };
//     rafRef.current = requestAnimationFrame(step);
//   };

//   const stopAutoScrollLoop = () => {
//     if (rafRef.current) {
//       cancelAnimationFrame(rafRef.current);
//       rafRef.current = null;
//     }
//   };

//   const handleDragStart = (event: DragStartEvent) => {
//     const { active } = event;
//     const allItems = Object.values(options.groupedData).flat();
//     const rawId = String(active.id);
//     const found = allItems.find(
//       (i) => `task-${i.id}` === rawId || String(i.id) === rawId
//     );
//     setActiveItem(found || null);

//     // فعال‌سازی اسکرول خودکار: listener مربوطه را اضافه کن
//     draggingRef.current = true;
//     // pointermove (برای ماوس) و touchmove (برای موبایل)
//     window.addEventListener("pointermove", onPointerMove, { passive: true });
//     window.addEventListener("touchmove", onPointerMove, { passive: true });
//     startAutoScrollLoop();
//   };

//   const handleDragMove = (_event: DragMoveEvent) => {
//     // تابع جدا نیست اما می‌توان برای لاگ/دیباگ اینجا استفاده کرد
//   };

//   const handleDragEnd = (event: DragEndEvent) => {
//     const { active, over } = event;
//     setActiveItem(null);

//     // حذف لیسنرها و متوقف کردن لوپ
//     draggingRef.current = false;
//     pointerXRef.current = null;
//     window.removeEventListener("pointermove", onPointerMove);
//     window.removeEventListener("touchmove", onPointerMove);
//     stopAutoScrollLoop();

//     if (over && options.onCardDrop) {
//       options.onCardDrop(active, over);
//     }
//   };

//   useEffect(() => {
//     return () => {
//       // cleanup on unmount
//       window.removeEventListener("pointermove", onPointerMove);
//       window.removeEventListener("touchmove", onPointerMove);
//       stopAutoScrollLoop();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <DndContext
//       sensors={sensors}
//       collisionDetection={closestCenter}
//       onDragStart={handleDragStart}
//       onDragMove={handleDragMove}
//       onDragEnd={handleDragEnd}
//     >
//       <div
//         ref={containerRef}
//         className="flex gap-4 overflow-x-auto p-2 touch-pan-x"
//       >
//         {options.columns.map((column) => (
//           <div key={`col-wrapper-${column.id}`} className="flex-shrink-0">
//             <KanbanColumn
//               id={String(column.id)}
//               title={column.title}
//               items={options.groupedData[String(column.id)] || []}
//               options={options}
//             />
//           </div>
//         ))}
//       </div>

//       {createPortal(
//         <DragOverlay>
//           {activeItem ? (
//             <div className="rounded-lg shadow-xl">
//               {options.cardRender(activeItem)}
//             </div>
//           ) : null}
//         </DragOverlay>,
//         document.body
//       )}
//     </DndContext>
//   );
// };
// // ====================================================================================
// // END KanbanView
// // ====================================================================================

// const DataTableWrapper4 = <T extends { id: number | string }>({
//   columns,
//   loading = false,
//   showIconViews = true,
//   error = null,
//   emptyMessage = "هیچ داده‌ای یافت نشد",
//   loadingMessage = "در حال بارگذاری",
//   fetcher,
//   searchPlaceholder = "جستجو...",
//   filterOptions = [],
//   dateFilterFields = [],
//   createUrl,
//   defaultViewMode = "list",
//   className = "",
//   listClassName = "",
//   extraFilter,
//   listItemRender,
//   kanbanOptions,
//   customFilterComponent,
//   customFilterItems = [],
//   onCustomFilterItemRemove,
//   kanbanTouchConfig,
// }: DataTableWrapperProps<T> & { kanbanTouchConfig?: KanbanTouchConfig }) => {
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
//       if (viewMode !== "kanban") {
//         setPagination(result.pagination);
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   const handlePageChange = (page: number) => get(page);
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
//     filterOptions.forEach((filter) =>
//       filter.options.forEach((option) =>
//         map.set(`${filter.name}-${option.value}`, option.label)
//       )
//     );
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
//   const handleSearch = (data: { search: string }) => setSearchTerm(data.search);
//   const clear = () => setFilterValue(new Map<string, any>());

//   const actionButton = createUrl ? (
//     <Link href={createUrl}>
//       <Button icon={<DIcon icon="fa-plus" cdi={false} classCustom="!mx-0" />}>
//         ایجاد
//       </Button>
//     </Link>
//   ) : undefined;

//   const renderContent = () => {
//     if (loading)
//       return <div className="p-10 text-center">{loadingMessage}...</div>;
//     if (error)
//       return (
//         <div className="p-4 text-red-700 bg-red-100 border border-red-400 rounded-lg">
//           {error}
//         </div>
//       );

//     if (viewMode === "kanban" && kanbanOptions?.enabled) {
//       return (
//         <KanbanView options={kanbanOptions} touchConfig={kanbanTouchConfig} />
//       );
//     }

//     if (viewMode !== "kanban" && (!data || data.length === 0)) {
//       return <div className="p-10 text-center">{emptyMessage}</div>;
//     }

//     return (
//       <Table
//         iconViewMode={{ table: TableIcon(), list: ListIcon() }}
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
//           className:
//             "!bg-white dark:!bg-slate-800 border-[1px] border-gray-400",
//         }}
//         onPageChange={handlePageChange}
//         defaultViewMode={viewMode === "kanban" ? "list" : viewMode}
//         listItemRender={listItemRender}
//         showIconViews={false}
//       />
//     );
//   };

//   const KanbanIcon = () => (
//     <svg
//       className="w-4 h-4"
//       fill="currentColor"
//       viewBox="0 0 20 20"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <path d="M2 3a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm8 0a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1h-4a1 1 0 01-1-1V3z"></path>
//     </svg>
//   );

//   return (
//     <div className={className}>
//       <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-1">
//         <div className="flex items-center gap-4">
//           <Form schema={searchSchema} onSubmit={handleSearch} className="grow">
//             <div className="flex items-center">
//               <Input
//                 name="search"
//                 variant="primary"
//                 className="bg-white max-md:w-40 lg:w-64"
//                 placeholder={searchPlaceholder}
//               />
//               <Button
//                 variant="ghost"
//                 type="submit"
//                 size="xs"
//                 className="h-full"
//                 icon={<DIcon icon="fa-search" />}
//               />
//             </div>
//           </Form>
//           {showIconViews && (
//             <div className="flex items-center p-1 bg-gray-200 dark:bg-slate-700 rounded-lg">
//               <button
//                 onClick={() => setViewMode("table")}
//                 className={`p-1.5 rounded-md ${
//                   viewMode === "table"
//                     ? "bg-white dark:bg-slate-600 shadow"
//                     : ""
//                 }`}
//               >
//                 <TableIcon />
//               </button>
//               <button
//                 onClick={() => setViewMode("list")}
//                 className={`p-1.5 rounded-md ${
//                   viewMode === "list" ? "bg-white dark:bg-slate-600 shadow" : ""
//                 }`}
//               >
//                 <ListIcon />
//               </button>
//               {kanbanOptions?.enabled && (
//                 <button
//                   onClick={() => setViewMode("kanban")}
//                   className={`p-1.5 rounded-md ${
//                     viewMode === "kanban"
//                       ? "bg-white dark:bg-slate-600 shadow"
//                       : ""
//                   }`}
//                 >
//                   <KanbanIcon />
//                 </button>
//               )}
//             </div>
//           )}
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
//               {customFilterComponent && <div>{customFilterComponent}</div>}
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
//               {(hasActiveTags ||
//                 dateFilterFields.some(
//                   (f) =>
//                     filtersValue.has(`${f.name}_gte`) ||
//                     filtersValue.has(`${f.name}_lte`)
//                 )) && (
//                 <div className="ml-auto self-center">
//                   <Button
//                     variant="ghost"
//                     onClick={clear}
//                     className="!text-error"
//                   >
//                     پاک کردن فیلترها
//                   </Button>
//                 </div>
//               )}
//             </div>

//             {hasActiveTags && (
//               <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-slate-700">
//                 {Array.from(filtersValue.entries()).map(
//                   ([key, values]) =>
//                     Array.isArray(values) &&
//                     values.map((value) => (
//                       <div
//                         key={`${key}-${value}`}
//                         className="group flex items-center bg-teal-50 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-sm font-medium pl-3 pr-1.5 py-1 rounded-full"
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

//             {customFilterItems.length > 0 && (
//               <div
//                 className={`flex flex-wrap items-center gap-2 pt-3 ${
//                   hasActiveTags
//                     ? "pt-2"
//                     : "mt-3 border-t border-gray-200 dark:border-slate-700"
//                 }`}
//               >
//                 {customFilterItems.map((item) => (
//                   <div
//                     key={`${item.type}-${item.id}`}
//                     className="group flex items-center bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 text-sm font-medium pl-3 pr-1.5 py-1 rounded-full"
//                   >
//                     <span>{item.name}</span>
//                     <button
//                       onClick={() => onCustomFilterItemRemove?.(item)}
//                       className="flex-shrink-0 ml-1.5 h-5 w-5 rounded-full inline-flex items-center justify-center"
//                     >
//                       <DIcon
//                         icon="fa-times"
//                         classCustom="text-orange-500 dark:text-orange-400 group-hover:text-orange-700 text-xs"
//                       />
//                     </button>
//                   </div>
//                 ))}
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
//                       onChange={(payload) =>
//                         handleFilterChange(
//                           `${field.name}_gte`,
//                           payload ? payload.iso : null
//                         )
//                       }
//                     />
//                     <StandaloneDatePicker2
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
//           </div>
//         </div>
//       )}

//       <div className="mt-4">{renderContent()}</div>
//     </div>
//   );
// };

// export default DataTableWrapper4;

// "use client";

// import DIcon from "@/@Client/Components/common/DIcon";
// import {
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
//   DragOverlay,
//   DragStartEvent,
//   KeyboardSensor,
//   PointerSensor,
//   closestCenter,
//   useDroppable,
//   useSensor,
//   useSensors,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   sortableKeyboardCoordinates,
//   useSortable,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Button, Form, Input, Table } from "ndui-ahrom";
// import { Column } from "ndui-ahrom/dist/components/Table/Table";
// import Link from "next/link";
// import React, { useEffect, useMemo, useState } from "react";
// import { createPortal } from "react-dom";
// import { z } from "zod";
// import MultiSelectFilter from "../ui/MultiSelectFilter";
// import StandaloneDatePicker2 from "../ui/StandaloneDatePicker2";

// const searchSchema = z.object({ search: z.string() });

// export interface KanbanColumnSource {
//   id: string | number;
//   title: string;
//   [key: string]: any;
// }

// type KanbanGroupedData<T> = Record<string, T[]>;

// interface KanbanOptions<T> {
//   enabled: boolean;
//   cardRender: (item: T) => React.ReactNode;
//   onCardDrop?: (active: any, over: any) => void;
//   groupedData: KanbanGroupedData<T>;
//   columns: KanbanColumnSource[];
// }

// interface DateFilterField {
//   name: string;
//   label: string;
// }
// export interface CustomFilterItem {
//   id: number | string;
//   name: string | null;
//   type: string;
// }

// interface DataTableWrapperProps<T> {
//   columns: Column[];
//   loading?: boolean;
//   showIconViews?: boolean;
//   error?: string | null;
//   emptyMessage?: string;
//   loadingMessage?: string;
//   listClassName?: string;
//   fetcher: (params: FullQueryParams) => Promise<PaginationResult<T>>;
//   searchPlaceholder?: string;
//   filterOptions?: FilterOption[];
//   dateFilterFields?: DateFilterField[];
//   createUrl?: string;
//   defaultViewMode?: "table" | "list" | "kanban";
//   className?: string;
//   cardClassName?: string;
//   title?: string;
//   extraFilter?: Record<string, any>;
//   listItemRender?: (row: any) => React.ReactNode;
//   kanbanOptions?: KanbanOptions<T>;
//   customFilterComponent?: React.ReactNode;
//   customFilterItems?: CustomFilterItem[];
//   onCustomFilterItemRemove?: (item: CustomFilterItem) => void;
// }

// /**
//  * KanbanCard: کارت منعطف که از useSortable استفاده می‌کند.
//  * id ای که به useSortable می‌دهیم پیشوند task- دارد.
//  */
// const KanbanCard = <T,>({
//   item,
//   options,
// }: {
//   item: T & { id: string | number };
//   options: KanbanOptions<T>;
// }) => {
//   const sortableId = `task-${item.id}`;
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id: sortableId });
//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     opacity: isDragging ? 0.5 : 1,
//     zIndex: isDragging ? 9999 : "auto",
//   };
//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       {...attributes}
//       {...listeners}
//       key={`task-${item.id}`}
//     >
//       {options.cardRender(item)}
//     </div>
//   );
// };

// /**
//  * KanbanColumn:
//  * - از useDroppable استفاده می‌کنیم تا متغیر isOver بگیریم.
//  * - وقتی isOver === true است، کلاس‌های مخصوص هایلایت اضافه می‌شوند.
//  *
//  * نکته: id ستون با پیشوند col- قرار می‌گیرد تا collision و تشخیص مقصد دقیق باشد.
//  */
// const KanbanColumn = <T,>({
//   id,
//   title,
//   items,
//   options,
// }: {
//   id: string | number;
//   title: string;
//   items: (T & { id: string | number })[];
//   options: KanbanOptions<T>;
// }) => {
//   const droppableId = `col-${id}`;
//   const { setNodeRef: setDroppableRef, isOver } = useDroppable({
//     id: droppableId,
//   });

//   // برای SortableContext باید لیست آیتم‌ها با همان ids که KanbanCard استفاده می‌کند باشد
//   const sortableItemIds = items.map((i) => `task-${i.id}`);

//   // کلاس‌های پایه ستون
//   const baseClass =
//     "w-72 md:w-80 flex-shrink-0 rounded-lg border flex flex-col transition-shadow transition-colors";
//   const normalStyle =
//     "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700";
//   // استایل هایلایت هنگام دراگ اور: رنگ زمینه و مرز و سایه
//   const highlightStyle =
//     "bg-teal-700/10 dark:bg-teal-900/10 border-teal-700 shadow-lg";

//   return (
//     <div className={`${baseClass} ${isOver ? highlightStyle : normalStyle}`}>
//       <h3 className="p-3 text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-slate-700">
//         {title} <span className="text-sm text-gray-500">({items.length})</span>
//       </h3>

//       <div
//         ref={setDroppableRef}
//         className="p-2 min-h-[400px] max-h-[70vh] overflow-y-auto flex flex-col gap-3"
//       >
//         <SortableContext
//           id={droppableId}
//           items={sortableItemIds}
//           strategy={verticalListSortingStrategy}
//         >
//           {items.map((item) => (
//             <KanbanCard key={`task-${item.id}`} item={item} options={options} />
//           ))}
//         </SortableContext>
//       </div>
//     </div>
//   );
// };

// // ====================================================================================
// // KanbanView: استفاده از پیشوندهای task- و col-
// // ====================================================================================
// const KanbanView = <T extends { id: number | string }>({
//   options,
// }: {
//   options: KanbanOptions<T>;
// }) => {
//   const [activeItem, setActiveItem] = useState<T | null>(null);

//   const sensors = useSensors(
//     useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
//     useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
//   );

//   const handleDragStart = (event: DragStartEvent) => {
//     const { active } = event;
//     const allItems = Object.values(options.groupedData).flat();
//     const idStr = String(active.id);
//     if (idStr.startsWith("task-")) {
//       const rawId = idStr.slice(5);
//       const found = allItems.find((i: any) => String(i.id) === rawId);
//       setActiveItem(found || null);
//     } else {
//       setActiveItem(null);
//     }
//   };

//   const handleDragEnd = (event: DragEndEvent) => {
//     const { active, over } = event;
//     setActiveItem(null);
//     if (over && options.onCardDrop) {
//       options.onCardDrop(active, over);
//     }
//   };

//   return (
//     <DndContext
//       sensors={sensors}
//       collisionDetection={closestCenter}
//       onDragStart={handleDragStart}
//       onDragEnd={handleDragEnd}
//     >
//       <div className="flex gap-4 overflow-x-auto p-2">
//         {options.columns.map((column) => (
//           <KanbanColumn
//             key={`col-${column.id}`}
//             id={String(column.id)}
//             title={column.title}
//             items={options.groupedData[String(column.id)] || []}
//             options={options}
//           />
//         ))}
//       </div>

//       {createPortal(
//         <DragOverlay>
//           {activeItem ? (
//             <div className="rounded-lg shadow-xl">
//               {options.cardRender(activeItem)}
//             </div>
//           ) : null}
//         </DragOverlay>,
//         document.body
//       )}
//     </DndContext>
//   );
// };
// // ====================================================================================
// // END KanbanView
// // ====================================================================================

// const DataTableWrapper4 = <T extends { id: number | string }>({
//   columns,
//   loading = false,
//   showIconViews = true,
//   error = null,
//   emptyMessage = "هیچ داده‌ای یافت نشد",
//   loadingMessage = "در حال بارگذاری",
//   fetcher,
//   searchPlaceholder = "جستجو...",
//   filterOptions = [],
//   dateFilterFields = [],
//   createUrl,
//   defaultViewMode = "list",
//   className = "",
//   listClassName = "",
//   extraFilter,
//   listItemRender,
//   kanbanOptions,
//   customFilterComponent,
//   customFilterItems = [],
//   onCustomFilterItemRemove,
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
//       if (viewMode !== "kanban") {
//         setPagination(result.pagination);
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   const handlePageChange = (page: number) => get(page);
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
//     filterOptions.forEach((filter) =>
//       filter.options.forEach((option) =>
//         map.set(`${filter.name}-${option.value}`, option.label)
//       )
//     );
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
//   const handleSearch = (data: { search: string }) => setSearchTerm(data.search);
//   const clear = () => setFilterValue(new Map<string, any>());

//   const actionButton = createUrl ? (
//     <Link href={createUrl}>
//       <Button icon={<DIcon icon="fa-plus" cdi={false} classCustom="!mx-0" />}>
//         ایجاد
//       </Button>
//     </Link>
//   ) : undefined;

//   const renderContent = () => {
//     if (loading)
//       return <div className="p-10 text-center">{loadingMessage}...</div>;
//     if (error)
//       return (
//         <div className="p-4 text-red-700 bg-red-100 border border-red-400 rounded-lg">
//           {error}
//         </div>
//       );
//     if (viewMode !== "kanban" && (!data || data.length === 0)) {
//       return <div className="p-10 text-center">{emptyMessage}</div>;
//     }
//     if (viewMode === "kanban" && kanbanOptions?.enabled) {
//       return <KanbanView options={kanbanOptions} />;
//     }
//     return (
//       <Table
//         iconViewMode={{ table: TableIcon(), list: ListIcon() }}
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
//           className:
//             "!bg-white dark:!bg-slate-800 border-[1px] border-gray-400",
//         }}
//         onPageChange={handlePageChange}
//         defaultViewMode={viewMode === "kanban" ? "list" : viewMode}
//         listItemRender={listItemRender}
//         showIconViews={false}
//       />
//     );
//   };

//   const KanbanIcon = () => (
//     <svg
//       className="w-4 h-4"
//       fill="currentColor"
//       viewBox="0 0 20 20"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <path d="M2 3a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm8 0a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1h-4a1 1 0 01-1-1V3z"></path>
//     </svg>
//   );

//   return (
//     <div className={className}>
//       <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-1">
//         <div className="flex items-center gap-4">
//           <Form schema={searchSchema} onSubmit={handleSearch} className="grow">
//             <div className="flex items-center">
//               <Input
//                 name="search"
//                 variant="primary"
//                 className="bg-white max-md:w-40 lg:w-64"
//                 placeholder={searchPlaceholder}
//               />
//               <Button
//                 variant="ghost"
//                 type="submit"
//                 size="xs"
//                 className="h-full"
//                 icon={<DIcon icon="fa-search" />}
//               />
//             </div>
//           </Form>
//           {showIconViews && (
//             <div className="flex items-center p-1 bg-gray-200 dark:bg-slate-700 rounded-lg">
//               <button
//                 onClick={() => setViewMode("table")}
//                 className={`p-1.5 rounded-md ${
//                   viewMode === "table"
//                     ? "bg-white dark:bg-slate-600 shadow"
//                     : ""
//                 }`}
//               >
//                 <TableIcon />
//               </button>
//               <button
//                 onClick={() => setViewMode("list")}
//                 className={`p-1.5 rounded-md ${
//                   viewMode === "list" ? "bg-white dark:bg-slate-600 shadow" : ""
//                 }`}
//               >
//                 <ListIcon />
//               </button>
//               {kanbanOptions?.enabled && (
//                 <button
//                   onClick={() => setViewMode("kanban")}
//                   className={`p-1.5 rounded-md ${
//                     viewMode === "kanban"
//                       ? "bg-white dark:bg-slate-600 shadow"
//                       : ""
//                   }`}
//                 >
//                   <KanbanIcon />
//                 </button>
//               )}
//             </div>
//           )}
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
//               {customFilterComponent && <div>{customFilterComponent}</div>}
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
//               {(hasActiveTags ||
//                 dateFilterFields.some(
//                   (f) =>
//                     filtersValue.has(`${f.name}_gte`) ||
//                     filtersValue.has(`${f.name}_lte`)
//                 )) && (
//                 <div className="ml-auto self-center">
//                   <Button
//                     variant="ghost"
//                     onClick={clear}
//                     className="!text-error"
//                   >
//                     پاک کردن فیلترها
//                   </Button>
//                 </div>
//               )}
//             </div>
//             {hasActiveTags && (
//               <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-slate-700">
//                 {Array.from(filtersValue.entries()).map(
//                   ([key, values]) =>
//                     Array.isArray(values) &&
//                     values.map((value) => (
//                       <div
//                         key={`${key}-${value}`}
//                         className="group flex items-center bg-teal-50 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-sm font-medium pl-3 pr-1.5 py-1 rounded-full"
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
//             {customFilterItems.length > 0 && (
//               <div
//                 className={`flex flex-wrap items-center gap-2 pt-3 ${
//                   hasActiveTags
//                     ? "pt-2"
//                     : "mt-3 border-t border-gray-200 dark:border-slate-700"
//                 }`}
//               >
//                 {customFilterItems.map((item) => (
//                   <div
//                     key={`${item.type}-${item.id}`}
//                     className="group flex items-center bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 text-sm font-medium pl-3 pr-1.5 py-1 rounded-full"
//                   >
//                     <span>{item.name}</span>
//                     <button
//                       onClick={() => onCustomFilterItemRemove?.(item)}
//                       className="flex-shrink-0 ml-1.5 h-5 w-5 rounded-full inline-flex items-center justify-center"
//                     >
//                       <DIcon
//                         icon="fa-times"
//                         classCustom="text-orange-500 dark:text-orange-400 group-hover:text-orange-700 text-xs"
//                       />
//                     </button>
//                   </div>
//                 ))}
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
//                       onChange={(payload) =>
//                         handleFilterChange(
//                           `${field.name}_gte`,
//                           payload ? payload.iso : null
//                         )
//                       }
//                     />
//                     <StandaloneDatePicker2
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
//           </div>
//         </div>
//       )}
//       <div className="mt-4">{renderContent()}</div>
//     </div>
//   );
// };

// export default DataTableWrapper4;

// // "use client";

// // import DIcon from "@/@Client/Components/common/DIcon";
// // import {
// //   ListIcon,
// //   TableIcon,
// // } from "@/@Client/Components/common/table/iconView";
// // import {
// //   FilterOption,
// //   FullQueryParams,
// //   PaginationResult,
// // } from "@/@Client/types";
// // import {
// //   DndContext,
// //   DragEndEvent,
// //   DragOverlay,
// //   DragStartEvent,
// //   KeyboardSensor,
// //   PointerSensor,
// //   closestCenter,
// //   useDroppable,
// //   useSensor,
// //   useSensors,
// // } from "@dnd-kit/core";
// // import {
// //   SortableContext,
// //   sortableKeyboardCoordinates,
// //   useSortable,
// //   verticalListSortingStrategy,
// // } from "@dnd-kit/sortable";
// // import { CSS } from "@dnd-kit/utilities";
// // import { Button, Form, Input, Table } from "ndui-ahrom";
// // import { Column } from "ndui-ahrom/dist/components/Table/Table";
// // import Link from "next/link";
// // import React, { useEffect, useMemo, useState } from "react";
// // import { createPortal } from "react-dom";
// // import { z } from "zod";
// // import MultiSelectFilter from "../ui/MultiSelectFilter";
// // import StandaloneDatePicker2 from "../ui/StandaloneDatePicker2";

// // const searchSchema = z.object({ search: z.string() });

// // export interface KanbanColumnSource {
// //   id: string | number;
// //   title: string;
// //   [key: string]: any;
// // }

// // // داده گروه‌بندی شده: کلید = statusId به صورت رشته، مقدار = آرایه آیتم‌ها
// // type KanbanGroupedData<T> = Record<string, T[]>;

// // interface KanbanOptions<T> {
// //   enabled: boolean;
// //   cardRender: (item: T) => React.ReactNode;
// //   onCardDrop?: (active: any, over: any) => void;
// //   groupedData: KanbanGroupedData<T>;
// //   columns: KanbanColumnSource[];
// // }

// // interface DateFilterField {
// //   name: string;
// //   label: string;
// // }
// // export interface CustomFilterItem {
// //   id: number | string;
// //   name: string | null;
// //   type: string;
// // }

// // interface DataTableWrapperProps<T> {
// //   columns: Column[];
// //   loading?: boolean;
// //   showIconViews?: boolean;
// //   error?: string | null;
// //   emptyMessage?: string;
// //   loadingMessage?: string;
// //   listClassName?: string;
// //   fetcher: (params: FullQueryParams) => Promise<PaginationResult<T>>;
// //   searchPlaceholder?: string;
// //   filterOptions?: FilterOption[];
// //   dateFilterFields?: DateFilterField[];
// //   createUrl?: string;
// //   defaultViewMode?: "table" | "list" | "kanban";
// //   className?: string;
// //   cardClassName?: string;
// //   title?: string;
// //   extraFilter?: Record<string, any>;
// //   listItemRender?: (row: any) => React.ReactNode;
// //   kanbanOptions?: KanbanOptions<T>;
// //   customFilterComponent?: React.ReactNode;
// //   customFilterItems?: CustomFilterItem[];
// //   onCustomFilterItemRemove?: (item: CustomFilterItem) => void;
// // }

// // const KanbanCard = <T,>({
// //   item,
// //   options,
// // }: {
// //   item: T & { id: string | number };
// //   options: KanbanOptions<T>;
// // }) => {
// //   // useSortable با id پیش‌ونددار task-<id>
// //   const sortableId = `task-${item.id}`;
// //   const {
// //     attributes,
// //     listeners,
// //     setNodeRef,
// //     transform,
// //     transition,
// //     isDragging,
// //   } = useSortable({ id: sortableId });
// //   const style = {
// //     transform: CSS.Transform.toString(transform),
// //     transition,
// //     opacity: isDragging ? 0.5 : 1,
// //     zIndex: isDragging ? 9999 : "auto",
// //   };
// //   return (
// //     <div
// //       ref={setNodeRef}
// //       style={style}
// //       {...attributes}
// //       {...listeners}
// //       key={`task-${item.id}`}
// //     >
// //       {options.cardRender(item)}
// //     </div>
// //   );
// // };

// // const KanbanColumn = <T,>({
// //   id,
// //   title,
// //   items,
// //   options,
// // }: {
// //   id: string | number;
// //   title: string;
// //   items: (T & { id: string | number })[];
// //   options: KanbanOptions<T>;
// // }) => {
// //   // ثبت droppable برای ستون: id با پیشوند col-<id>
// //   const droppableId = `col-${id}`;
// //   const { setNodeRef: setDroppableRef } = useDroppable({ id: droppableId });

// //   // SortableContext items باید همان ids که useSortable استفاده می‌کند را دریافت کند
// //   const sortableItemIds = items.map((i) => `task-${i.id}`);

// //   return (
// //     <div className="w-72 md:w-80 flex-shrink-0 bg-gray-100 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 flex flex-col">
// //       <h3 className="p-3 text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-slate-700">
// //         {title} <span className="text-sm text-gray-500">({items.length})</span>
// //       </h3>

// //       <div
// //         ref={setDroppableRef}
// //         className="p-2 min-h-[400px] max-h-[70vh] overflow-y-auto flex flex-col gap-3"
// //       >
// //         <SortableContext
// //           id={droppableId}
// //           items={sortableItemIds}
// //           strategy={verticalListSortingStrategy}
// //         >
// //           {items.map((item) => (
// //             <KanbanCard key={`task-${item.id}`} item={item} options={options} />
// //           ))}
// //         </SortableContext>
// //       </div>
// //     </div>
// //   );
// // };

// // // ====================================================================================
// // // KanbanView: معماری کنترل‌شده با ids پیش‌ونددار برای ستون‌ها و کارت‌ها
// // // ====================================================================================
// // const KanbanView = <T extends { id: number | string }>({
// //   options,
// // }: {
// //   options: KanbanOptions<T>;
// // }) => {
// //   const [activeItem, setActiveItem] = useState<T | null>(null);

// //   const sensors = useSensors(
// //     useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
// //     useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
// //   );

// //   const handleDragStart = (event: DragStartEvent) => {
// //     const { active } = event;
// //     const allItems = Object.values(options.groupedData).flat();
// //     // active.id به شکل 'task-<id>' خواهد بود — بنابراین باید تطبیق دهیم
// //     const idStr = String(active.id);
// //     if (idStr.startsWith("task-")) {
// //       const rawId = idStr.slice(5);
// //       const found = allItems.find((i: any) => String(i.id) === rawId);
// //       setActiveItem(found || null);
// //     } else {
// //       setActiveItem(null);
// //     }
// //   };

// //   const handleDragEnd = (event: DragEndEvent) => {
// //     const { active, over } = event;
// //     setActiveItem(null);
// //     if (over && options.onCardDrop) {
// //       // active.id و over.id با پیشوندها ارسال می‌شوند ('task-..' یا 'col-..')
// //       options.onCardDrop(active, over);
// //     }
// //   };

// //   return (
// //     <DndContext
// //       sensors={sensors}
// //       collisionDetection={closestCenter}
// //       onDragStart={handleDragStart}
// //       onDragEnd={handleDragEnd}
// //     >
// //       <div className="flex gap-4 overflow-x-auto p-2">
// //         {options.columns.map((column) => (
// //           <KanbanColumn
// //             key={`col-${column.id}`}
// //             id={String(column.id)}
// //             title={column.title}
// //             // groupedData کلیدها را به صورت statusId (string) نگه می‌دارد
// //             items={options.groupedData[String(column.id)] || []}
// //             options={options}
// //           />
// //         ))}
// //       </div>

// //       {createPortal(
// //         <DragOverlay>
// //           {activeItem ? (
// //             <div className="rounded-lg shadow-xl">
// //               {options.cardRender(activeItem)}
// //             </div>
// //           ) : null}
// //         </DragOverlay>,
// //         document.body
// //       )}
// //     </DndContext>
// //   );
// // };
// // // ====================================================================================
// // // END KanbanView
// // // ====================================================================================

// // const DataTableWrapper4 = <T extends { id: number | string }>({
// //   columns,
// //   loading = false,
// //   showIconViews = true,
// //   error = null,
// //   emptyMessage = "هیچ داده‌ای یافت نشد",
// //   loadingMessage = "در حال بارگذاری",
// //   fetcher,
// //   searchPlaceholder = "جستجو...",
// //   filterOptions = [],
// //   dateFilterFields = [],
// //   createUrl,
// //   defaultViewMode = "list",
// //   className = "",
// //   listClassName = "",
// //   extraFilter,
// //   listItemRender,
// //   kanbanOptions,
// //   customFilterComponent,
// //   customFilterItems = [],
// //   onCustomFilterItemRemove,
// // }: DataTableWrapperProps<T>) => {
// //   const [data, setData] = useState<T[]>([]);
// //   const [pagination, setPagination] = useState({
// //     total: 0,
// //     pages: 1,
// //     page: 1,
// //     limit: 10,
// //   });
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [filtersValue, setFilterValue] = useState(new Map<string, any>());
// //   const [viewMode, setViewMode] = useState(defaultViewMode);

// //   useEffect(() => {
// //     const limit = viewMode === "kanban" ? 1000 : pagination.limit;
// //     get(pagination.page, limit);
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [searchTerm, filtersValue, extraFilter, viewMode]);

// //   const get = async (page = 1, limit = pagination.limit) => {
// //     try {
// //       const params: any = { page, limit };
// //       if (searchTerm) params.search = searchTerm;
// //       filtersValue.forEach((value, key) => {
// //         if (value && (!Array.isArray(value) || value.length > 0)) {
// //           params[key] = Array.isArray(value) ? value.join(",") : value;
// //         }
// //       });
// //       if (extraFilter && Object.keys(extraFilter).length > 0) {
// //         const filteredExtraFilter = Object.fromEntries(
// //           Object.entries(extraFilter).filter(
// //             ([, value]) => value !== null && value !== undefined
// //           )
// //         );
// //         Object.assign(params, filteredExtraFilter);
// //       }
// //       const result = await fetcher(params);
// //       setData(result.data);
// //       if (viewMode !== "kanban") {
// //         setPagination(result.pagination);
// //       }
// //     } catch (error) {
// //       console.error("Error fetching data:", error);
// //     }
// //   };

// //   const handlePageChange = (page: number) => get(page);
// //   const handleFilterChange = (name: string, value: any) => {
// //     setFilterValue((prev) => {
// //       const newFilters = new Map(prev);
// //       if (
// //         value === "all" ||
// //         value === null ||
// //         value === "" ||
// //         (Array.isArray(value) && value.length === 0)
// //       ) {
// //         newFilters.delete(name);
// //       } else {
// //         newFilters.set(name, value);
// //       }
// //       return newFilters;
// //     });
// //   };

// //   const optionsMap = useMemo(() => {
// //     const map = new Map<string, string>();
// //     filterOptions.forEach((filter) =>
// //       filter.options.forEach((option) =>
// //         map.set(`${filter.name}-${option.value}`, option.label)
// //       )
// //     );
// //     return map;
// //   }, [filterOptions]);

// //   const handleRemoveFilterTag = (filterName: string, valueToRemove: string) => {
// //     const currentValues = filtersValue.get(filterName) || [];
// //     if (!Array.isArray(currentValues)) return;
// //     const newValues = currentValues.filter((v: string) => v !== valueToRemove);
// //     handleFilterChange(filterName, newValues);
// //   };

// //   const hasActiveTags = Array.from(filtersValue.values()).some(
// //     (v) => Array.isArray(v) && v.length > 0
// //   );
// //   const handleSearch = (data: { search: string }) => setSearchTerm(data.search);
// //   const clear = () => setFilterValue(new Map<string, any>());

// //   const actionButton = createUrl ? (
// //     <Link href={createUrl}>
// //       <Button icon={<DIcon icon="fa-plus" cdi={false} classCustom="!mx-0" />}>
// //         ایجاد
// //       </Button>
// //     </Link>
// //   ) : undefined;

// //   const renderContent = () => {
// //     if (loading)
// //       return <div className="p-10 text-center">{loadingMessage}...</div>;
// //     if (error)
// //       return (
// //         <div className="p-4 text-red-700 bg-red-100 border border-red-400 rounded-lg">
// //           {error}
// //         </div>
// //       );
// //     // برای کانبان، حتی اگر داده خالی باشد، باید ستون‌ها نمایش داده شوند
// //     if (viewMode !== "kanban" && (!data || data.length === 0)) {
// //       return <div className="p-10 text-center">{emptyMessage}</div>;
// //     }
// //     if (viewMode === "kanban" && kanbanOptions?.enabled) {
// //       return <KanbanView options={kanbanOptions} />;
// //     }
// //     return (
// //       <Table
// //         iconViewMode={{ table: TableIcon(), list: ListIcon() }}
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
// //           className:
// //             "!bg-white dark:!bg-slate-800 border-[1px] border-gray-400",
// //         }}
// //         onPageChange={handlePageChange}
// //         defaultViewMode={viewMode === "kanban" ? "list" : viewMode}
// //         listItemRender={listItemRender}
// //         showIconViews={false}
// //       />
// //     );
// //   };

// //   const KanbanIcon = () => (
// //     <svg
// //       className="w-4 h-4"
// //       fill="currentColor"
// //       viewBox="0 0 20 20"
// //       xmlns="http://www.w3.org/2000/svg"
// //     >
// //       <path d="M2 3a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm8 0a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1h-4a1 1 0 01-1-1V3z"></path>
// //     </svg>
// //   );

// //   return (
// //     <div className={className}>
// //       <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-1">
// //         <div className="flex items-center gap-4">
// //           <Form schema={searchSchema} onSubmit={handleSearch} className="grow">
// //             <div className="flex items-center">
// //               <Input
// //                 name="search"
// //                 variant="primary"
// //                 className="bg-white max-md:w-40 lg:w-64"
// //                 placeholder={searchPlaceholder}
// //               />
// //               <Button
// //                 variant="ghost"
// //                 type="submit"
// //                 size="xs"
// //                 className="h-full"
// //                 icon={<DIcon icon="fa-search" />}
// //               />
// //             </div>
// //           </Form>
// //           {showIconViews && (
// //             <div className="flex items-center p-1 bg-gray-200 dark:bg-slate-700 rounded-lg">
// //               <button
// //                 onClick={() => setViewMode("table")}
// //                 className={`p-1.5 rounded-md ${
// //                   viewMode === "table"
// //                     ? "bg-white dark:bg-slate-600 shadow"
// //                     : ""
// //                 }`}
// //               >
// //                 <TableIcon />
// //               </button>
// //               <button
// //                 onClick={() => setViewMode("list")}
// //                 className={`p-1.5 rounded-md ${
// //                   viewMode === "list" ? "bg-white dark:bg-slate-600 shadow" : ""
// //                 }`}
// //               >
// //                 <ListIcon />
// //               </button>
// //               {kanbanOptions?.enabled && (
// //                 <button
// //                   onClick={() => setViewMode("kanban")}
// //                   className={`p-1.5 rounded-md ${
// //                     viewMode === "kanban"
// //                       ? "bg-white dark:bg-slate-600 shadow"
// //                       : ""
// //                   }`}
// //                 >
// //                   <KanbanIcon />
// //                 </button>
// //               )}
// //             </div>
// //           )}
// //         </div>
// //         {actionButton}
// //       </div>
// //       {(filterOptions.length > 0 || dateFilterFields.length > 0) && (
// //         <div className="collapse collapse-arrow bg-white dark:bg-slate-800 mb-4 relative z-30">
// //           <input type="checkbox" name="my-accordion-2" />
// //           <div className="collapse-title text-slate-800 dark:text-slate-200">
// //             <DIcon icon="fa-filter" /> فیلترها
// //           </div>
// //           <div className="collapse-content overflow-visible">
// //             <div className="flex flex-wrap items-center gap-3">
// //               {customFilterComponent && <div>{customFilterComponent}</div>}
// //               {filterOptions.map((filter) => (
// //                 <div key={filter.name} className="w-full sm:w-auto md:w-52">
// //                   <MultiSelectFilter
// //                     label={filter.label}
// //                     options={filter.options}
// //                     selectedValues={filtersValue.get(filter.name) || []}
// //                     onChange={(values) =>
// //                       handleFilterChange(filter.name, values)
// //                     }
// //                   />
// //                 </div>
// //               ))}
// //               {(hasActiveTags ||
// //                 dateFilterFields.some(
// //                   (f) =>
// //                     filtersValue.has(`${f.name}_gte`) ||
// //                     filtersValue.has(`${f.name}_lte`)
// //                 )) && (
// //                 <div className="ml-auto self-center">
// //                   <Button
// //                     variant="ghost"
// //                     onClick={clear}
// //                     className="!text-error"
// //                   >
// //                     پاک کردن فیلترها
// //                   </Button>
// //                 </div>
// //               )}
// //             </div>
// //             {hasActiveTags && (
// //               <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-slate-700">
// //                 {Array.from(filtersValue.entries()).map(
// //                   ([key, values]) =>
// //                     Array.isArray(values) &&
// //                     values.map((value) => (
// //                       <div
// //                         key={`${key}-${value}`}
// //                         className="group flex items-center bg-teal-50 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-sm font-medium pl-3 pr-1.5 py-1 rounded-full"
// //                       >
// //                         <span>
// //                           {optionsMap.get(`${key}-${value}`) || value}
// //                         </span>
// //                         <button
// //                           onClick={() => handleRemoveFilterTag(key, value)}
// //                           className="flex-shrink-0 ml-1.5 h-5 w-5 rounded-full inline-flex items-center justify-center"
// //                         >
// //                           <DIcon
// //                             icon="fa-times"
// //                             classCustom="text-teal-500 dark:text-teal-400 group-hover:text-teal-700 text-xs"
// //                           />
// //                         </button>
// //                       </div>
// //                     ))
// //                 )}
// //               </div>
// //             )}
// //             {customFilterItems.length > 0 && (
// //               <div
// //                 className={`flex flex-wrap items-center gap-2 pt-3 ${
// //                   hasActiveTags
// //                     ? "pt-2"
// //                     : "mt-3 border-t border-gray-200 dark:border-slate-700"
// //                 }`}
// //               >
// //                 {customFilterItems.map((item) => (
// //                   <div
// //                     key={`${item.type}-${item.id}`}
// //                     className="group flex items-center bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 text-sm font-medium pl-3 pr-1.5 py-1 rounded-full"
// //                   >
// //                     <span>{item.name}</span>
// //                     <button
// //                       onClick={() => onCustomFilterItemRemove?.(item)}
// //                       className="flex-shrink-0 ml-1.5 h-5 w-5 rounded-full inline-flex items-center justify-center"
// //                     >
// //                       <DIcon
// //                         icon="fa-times"
// //                         classCustom="text-orange-500 dark:text-orange-400 group-hover:text-orange-700 text-xs"
// //                       />
// //                     </button>
// //                   </div>
// //                 ))}
// //               </div>
// //             )}
// //             {dateFilterFields.length > 0 && (
// //               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
// //                 {dateFilterFields.map((field) => (
// //                   <React.Fragment key={field.name}>
// //                     <StandaloneDatePicker2
// //                       name={`${field.name}_gte`}
// //                       label={`${field.label} (از)`}
// //                       value={filtersValue.get(`${field.name}_gte`) || null}
// //                       timeOfDay="start"
// //                       onChange={(payload) =>
// //                         handleFilterChange(
// //                           `${field.name}_gte`,
// //                           payload ? payload.iso : null
// //                         )
// //                       }
// //                     />
// //                     <StandaloneDatePicker2
// //                       name={`${field.name}_lte`}
// //                       label={`${field.label} (تا)`}
// //                       value={filtersValue.get(`${field.name}_lte`) || null}
// //                       timeOfDay="end"
// //                       onChange={(payload) =>
// //                         handleFilterChange(
// //                           `${field.name}_lte`,
// //                           payload ? payload.iso : null
// //                         )
// //                       }
// //                     />
// //                   </React.Fragment>
// //                 ))}
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       )}
// //       <div className="mt-4">{renderContent()}</div>
// //     </div>
// //   );
// // };

// // export default DataTableWrapper4;

// // // src/@Client/Components/wrappers/DataTableWrapper4.tsx
// // "use client";

// // import DIcon from "@/@Client/Components/common/DIcon";
// // import {
// //   ListIcon,
// //   TableIcon,
// // } from "@/@Client/Components/common/table/iconView";
// // import {
// //   FilterOption,
// //   FullQueryParams,
// //   PaginationResult,
// // } from "@/@Client/types";
// // import {
// //   DndContext,
// //   DragEndEvent,
// //   DragOverlay,
// //   DragStartEvent,
// //   KeyboardSensor,
// //   PointerSensor,
// //   closestCenter,
// //   useSensor,
// //   useSensors,
// // } from "@dnd-kit/core";
// // import {
// //   SortableContext,
// //   sortableKeyboardCoordinates,
// //   useSortable,
// //   verticalListSortingStrategy,
// // } from "@dnd-kit/sortable";
// // import { CSS } from "@dnd-kit/utilities";
// // import { Button, Form, Input, Table } from "ndui-ahrom";
// // import { Column } from "ndui-ahrom/dist/components/Table/Table";
// // import Link from "next/link";
// // import React, { useEffect, useState } from "react";
// // import { createPortal } from "react-dom";
// // import { z } from "zod";

// // const searchSchema = z.object({ search: z.string() });

// // // --- نکته مهم ---
// // // برای جلوگیری از collision بین ids ستون‌ها و کارت‌ها، ما همیشه از prefix استفاده می‌کنیم:
// // // ستون: "col-<statusId>"    کارت: "task-<taskId>"
// // // این باعث می‌شه سیستم dnd-kit همیشه قادر باشه تفاوت نوع المان رو بفهمه.

// // export interface KanbanColumnSource {
// //   id: string | number;
// //   title: string;
// //   [key: string]: any;
// // }

// // type KanbanGroupedData<T> = Record<string, T[]>;

// // interface KanbanOptions<T> {
// //   enabled: boolean;
// //   cardRender: (item: T) => React.ReactNode;
// //   onCardDrop?: (active: any, over: any) => void;
// //   groupedData: KanbanGroupedData<T>;
// //   columns: KanbanColumnSource[];
// // }

// // interface DateFilterField {
// //   name: string;
// //   label: string;
// // }
// // export interface CustomFilterItem {
// //   id: number | string;
// //   name: string | null;
// //   type: string;
// // }

// // interface DataTableWrapperProps<T> {
// //   columns: Column[];
// //   loading?: boolean;
// //   showIconViews?: boolean;
// //   error?: string | null;
// //   emptyMessage?: string;
// //   loadingMessage?: string;
// //   listClassName?: string;
// //   fetcher: (params: FullQueryParams) => Promise<PaginationResult<T>>;
// //   searchPlaceholder?: string;
// //   filterOptions?: FilterOption[];
// //   dateFilterFields?: DateFilterField[];
// //   createUrl?: string;
// //   defaultViewMode?: "table" | "list" | "kanban";
// //   className?: string;
// //   cardClassName?: string;
// //   title?: string;
// //   extraFilter?: Record<string, any>;
// //   listItemRender?: (row: any) => React.ReactNode;
// //   kanbanOptions?: KanbanOptions<T>;
// //   customFilterComponent?: React.ReactNode;
// //   customFilterItems?: CustomFilterItem[];
// //   onCustomFilterItemRemove?: (item: CustomFilterItem) => void;
// // }

// // const KanbanCard = <T,>({
// //   item,
// //   options,
// // }: {
// //   item: T & { id: string | number };
// //   options: KanbanOptions<T>;
// // }) => {
// //   // item.id اینجا باید شکل "task-<id>" باشه (الزامی برای هماهنگی با wrapper)
// //   const {
// //     attributes,
// //     listeners,
// //     setNodeRef,
// //     transform,
// //     transition,
// //     isDragging,
// //   } = useSortable({ id: item.id }); // id در useSortable همان id منحصر به‌فرد کامپوننت است
// //   const style = {
// //     transform: CSS.Transform.toString(transform),
// //     transition,
// //     opacity: isDragging ? 0.5 : 1,
// //     zIndex: isDragging ? 9999 : "auto",
// //   };
// //   return (
// //     <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
// //       {options.cardRender(item)}
// //     </div>
// //   );
// // };

// // const KanbanColumn = <T,>({
// //   id,
// //   title,
// //   items,
// //   options,
// // }: {
// //   id: string | number; // این id باید شکل "col-<statusId>"
// //   title: string;
// //   items: (T & { id: string | number })[];
// //   options: KanbanOptions<T>;
// // }) => {
// //   // SortableContext برای هر ستون با شناسه ستون ساخته می‌شود (که prefixed است)
// //   return (
// //     <div className="w-72 md:w-80 flex-shrink-0 bg-gray-100 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 flex flex-col">
// //       <h3 className="p-3 text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-slate-700">
// //         {title} <span className="text-sm text-gray-500">({items.length})</span>
// //       </h3>
// //       <SortableContext
// //         id={String(id)}
// //         items={items.map((i) => i.id)}
// //         strategy={verticalListSortingStrategy}
// //       >
// //         <div className="p-2 min-h-[400px] max-h-[70vh] overflow-y-auto flex flex-col gap-3">
// //           {items.map((item) => (
// //             <KanbanCard key={String(item.id)} item={item} options={options} />
// //           ))}
// //         </div>
// //       </SortableContext>
// //     </div>
// //   );
// // };

// // // ====================================================================================
// // // KanbanView (نسخه کنترل‌شده با id‌های prefixed)
// // // ====================================================================================
// // const KanbanView = <T extends { id: number | string }>({
// //   options,
// // }: {
// //   options: KanbanOptions<T>;
// // }) => {
// //   const [activeItem, setActiveItem] = useState<T | null>(null);

// //   const sensors = useSensors(
// //     useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
// //     useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
// //   );

// //   const handleDragStart = (event: DragStartEvent) => {
// //     const { active } = event;
// //     // active.id اینجا idِ prefixed است ("task-<id>" یا ...). هدف: پیدا کردن item مربوطه از groupedData
// //     const allItems = Object.values(options.groupedData).flat();
// //     const found = allItems.find(
// //       (i: any) => String(i.prefixedId || `task-${i.id}`) === String(active.id)
// //     );
// //     setActiveItem(found || null);
// //     console.debug("[KanbanView] dragStart", {
// //       activeId: active.id,
// //       foundId: found?.id,
// //     });
// //   };

// //   const handleDragEnd = (event: DragEndEvent) => {
// //     const { active, over } = event;
// //     setActiveItem(null);
// //     console.debug("[KanbanView] dragEnd", {
// //       activeId: active?.id,
// //       overId: over?.id,
// //     });
// //     if (over && options.onCardDrop) {
// //       options.onCardDrop(active, over);
// //     }
// //   };

// //   return (
// //     <DndContext
// //       sensors={sensors}
// //       collisionDetection={closestCenter}
// //       onDragStart={handleDragStart}
// //       onDragEnd={handleDragEnd}
// //     >
// //       <div className="flex gap-4 overflow-x-auto p-2">
// //         {options.columns.map((column) => (
// //           <KanbanColumn
// //             key={`col-${column.id}`}
// //             id={`col-${column.id}`} // مهم: prefix ستون
// //             title={column.title}
// //             items={(options.groupedData[String(column.id)] || []).map(
// //               (it: any) => ({
// //                 ...it,
// //                 prefixedId: `task-${it.id}`,
// //                 id: `task-${it.id}`,
// //               })
// //             )}
// //             options={options}
// //           />
// //         ))}
// //       </div>

// //       {createPortal(
// //         <DragOverlay>
// //           {activeItem ? (
// //             <div className="rounded-lg shadow-xl">
// //               {options.cardRender(activeItem)}
// //             </div>
// //           ) : null}
// //         </DragOverlay>,
// //         document.body
// //       )}
// //     </DndContext>
// //   );
// // };
// // // ====================================================================================

// // const DataTableWrapper4 = <T extends { id: number | string }>({
// //   columns,
// //   loading = false,
// //   showIconViews = true,
// //   error = null,
// //   emptyMessage = "هیچ داده‌ای یافت نشد",
// //   loadingMessage = "در حال بارگذاری",
// //   fetcher,
// //   searchPlaceholder = "جستجو...",
// //   filterOptions = [],
// //   dateFilterFields = [],
// //   createUrl,
// //   defaultViewMode = "list",
// //   className = "",
// //   listClassName = "",
// //   extraFilter,
// //   listItemRender,
// //   kanbanOptions,
// //   customFilterComponent,
// //   customFilterItems = [],
// //   onCustomFilterItemRemove,
// // }: DataTableWrapperProps<T>) => {
// //   const [data, setData] = useState<T[]>([]);
// //   const [pagination, setPagination] = useState({
// //     total: 0,
// //     pages: 1,
// //     page: 1,
// //     limit: 10,
// //   });
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [filtersValue, setFilterValue] = useState(new Map<string, any>());
// //   const [viewMode, setViewMode] = useState(defaultViewMode);

// //   useEffect(() => {
// //     const limit = viewMode === "kanban" ? 1000 : pagination.limit;
// //     get(pagination.page, limit);
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [searchTerm, filtersValue, extraFilter, viewMode]);

// //   const get = async (page = 1, limit = pagination.limit) => {
// //     try {
// //       const params: any = { page, limit };
// //       if (searchTerm) params.search = searchTerm;
// //       filtersValue.forEach((value, key) => {
// //         if (value && (!Array.isArray(value) || value.length > 0)) {
// //           params[key] = Array.isArray(value) ? value.join(",") : value;
// //         }
// //       });
// //       if (extraFilter && Object.keys(extraFilter).length > 0) {
// //         const filteredExtraFilter = Object.fromEntries(
// //           Object.entries(extraFilter).filter(
// //             ([, value]) => value !== null && value !== undefined
// //           )
// //         );
// //         Object.assign(params, filteredExtraFilter);
// //       }
// //       const result = await fetcher(params);
// //       setData(result.data);
// //       if (viewMode !== "kanban") setPagination(result.pagination);
// //     } catch (error) {
// //       console.error("Error fetching data:", error);
// //     }
// //   };

// //   // ... بقیه UI و فیلترها بدون تغییر ...
// //   // در renderContent اگر حالت کانبان فعال و kanbanOptions وجود داشته باشد، کامپوننت KanbanView را صدا می‌زنیم
// //   const renderContent = () => {
// //     if (loading)
// //       return <div className="p-10 text-center">{loadingMessage}...</div>;
// //     if (error)
// //       return (
// //         <div className="p-4 text-red-700 bg-red-100 border border-red-400 rounded-lg">
// //           {error}
// //         </div>
// //       );
// //     if (viewMode !== "kanban" && (!data || data.length === 0))
// //       return <div className="p-10 text-center">{emptyMessage}</div>;
// //     if (viewMode === "kanban" && kanbanOptions?.enabled) {
// //       // توجه: kanbanOptions.groupedData باید با کلیدِ statusId (بدون prefix) باشد؛
// //       // داخل KanbanView ما برای ستون‌ها و کارت‌ها prefix می‌زنیم.
// //       return <KanbanView options={kanbanOptions as any} />;
// //     }
// //     return (
// //       <Table
// //         iconViewMode={{ table: TableIcon(), list: ListIcon() }}
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
// //           className:
// //             "!bg-white dark:!bg-slate-800 border-[1px] border-gray-400",
// //         }}
// //         onPageChange={() => {}}
// //         defaultViewMode={viewMode === "kanban" ? "list" : viewMode}
// //         listItemRender={listItemRender}
// //         showIconViews={false}
// //       />
// //     );
// //   };

// //   const KanbanIcon = () => (
// //     <svg
// //       className="w-4 h-4"
// //       fill="currentColor"
// //       viewBox="0 0 20 20"
// //       xmlns="http://www.w3.org/2000/svg"
// //     >
// //       <path d="M2 3a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm8 0a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1h-4a1 1 0 01-1-1V3z"></path>
// //     </svg>
// //   );

// //   return (
// //     <div className={className}>
// //       <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-1">
// //         <div className="flex items-center gap-4">
// //           <Form
// //             schema={searchSchema}
// //             onSubmit={(d) => setSearchTerm(d.search)}
// //             className="grow"
// //           >
// //             <div className="flex items-center">
// //               <Input
// //                 name="search"
// //                 variant="primary"
// //                 className="bg-white max-md:w-40 lg:w-64"
// //                 placeholder={searchPlaceholder}
// //               />
// //               <Button
// //                 variant="ghost"
// //                 type="submit"
// //                 size="xs"
// //                 className="h-full"
// //                 icon={<DIcon icon="fa-search" />}
// //               />
// //             </div>
// //           </Form>
// //           {showIconViews && (
// //             <div className="flex items-center p-1 bg-gray-200 dark:bg-slate-700 rounded-lg">
// //               <button
// //                 onClick={() => setViewMode("table")}
// //                 className={`p-1.5 rounded-md ${
// //                   viewMode === "table"
// //                     ? "bg-white dark:bg-slate-600 shadow"
// //                     : ""
// //                 }`}
// //               >
// //                 <TableIcon />
// //               </button>
// //               <button
// //                 onClick={() => setViewMode("list")}
// //                 className={`p-1.5 rounded-md ${
// //                   viewMode === "list" ? "bg-white dark:bg-slate-600 shadow" : ""
// //                 }`}
// //               >
// //                 <ListIcon />
// //               </button>
// //               {kanbanOptions?.enabled && (
// //                 <button
// //                   onClick={() => setViewMode("kanban")}
// //                   className={`p-1.5 rounded-md ${
// //                     viewMode === "kanban"
// //                       ? "bg-white dark:bg-slate-600 shadow"
// //                       : ""
// //                   }`}
// //                 >
// //                   <KanbanIcon />
// //                 </button>
// //               )}
// //             </div>
// //           )}
// //         </div>
// //         {createUrl && (
// //           <Link href={createUrl}>
// //             <Button
// //               icon={<DIcon icon="fa-plus" cdi={false} classCustom="!mx-0" />}
// //             >
// //               ایجاد
// //             </Button>
// //           </Link>
// //         )}
// //       </div>

// //       {/* collapse filters ... (همان کد قبلی، بدون تغییر ساختاری) */}
// //       <div className="mt-4">{renderContent()}</div>
// //     </div>
// //   );
// // };

// // export default DataTableWrapper4;

// // // "use client";

// // // import DIcon from "@/@Client/Components/common/DIcon";
// // // import {
// // //   ListIcon,
// // //   TableIcon,
// // // } from "@/@Client/Components/common/table/iconView";
// // // import {
// // //   FilterOption,
// // //   FullQueryParams,
// // //   PaginationResult,
// // // } from "@/@Client/types";
// // // import {
// // //   DndContext,
// // //   DragEndEvent,
// // //   DragOverlay,
// // //   DragStartEvent,
// // //   KeyboardSensor,
// // //   PointerSensor,
// // //   closestCenter,
// // //   useSensor,
// // //   useSensors,
// // // } from "@dnd-kit/core";
// // // import {
// // //   SortableContext,
// // //   sortableKeyboardCoordinates,
// // //   useSortable,
// // //   verticalListSortingStrategy,
// // // } from "@dnd-kit/sortable";
// // // import { CSS } from "@dnd-kit/utilities";
// // // import { Button, Form, Input, Table } from "ndui-ahrom";
// // // import { Column } from "ndui-ahrom/dist/components/Table/Table";
// // // import Link from "next/link";
// // // import React, { useEffect, useMemo, useState } from "react";
// // // import { createPortal } from "react-dom";
// // // import { z } from "zod";
// // // import MultiSelectFilter from "../ui/MultiSelectFilter";
// // // import StandaloneDatePicker2 from "../ui/StandaloneDatePicker2";

// // // const searchSchema = z.object({ search: z.string() });

// // // export interface KanbanColumnSource {
// // //   id: string | number;
// // //   title: string;
// // //   [key: string]: any;
// // // }

// // // // آبجکت داده‌های کانبان مستقیماً از بیرون پاس داده می‌شود
// // // type KanbanGroupedData<T> = Record<string, T[]>;

// // // interface KanbanOptions<T> {
// // //   enabled: boolean;
// // //   cardRender: (item: T) => React.ReactNode;
// // //   // onCardDrop حالا فقط رویداد را گزارش می‌دهد
// // //   onCardDrop?: (active: any, over: any) => void;
// // //   // داده‌های گروه‌بندی شده مستقیماً از parent می‌آیند
// // //   groupedData: KanbanGroupedData<T>;
// // //   columns: KanbanColumnSource[];
// // // }

// // // interface DateFilterField {
// // //   name: string;
// // //   label: string;
// // // }
// // // export interface CustomFilterItem {
// // //   id: number | string;
// // //   name: string | null;
// // //   type: string;
// // // }

// // // interface DataTableWrapperProps<T> {
// // //   columns: Column[];
// // //   loading?: boolean;
// // //   showIconViews?: boolean;
// // //   error?: string | null;
// // //   emptyMessage?: string;
// // //   loadingMessage?: string;
// // //   listClassName?: string;
// // //   fetcher: (params: FullQueryParams) => Promise<PaginationResult<T>>;
// // //   searchPlaceholder?: string;
// // //   filterOptions?: FilterOption[];
// // //   dateFilterFields?: DateFilterField[];
// // //   createUrl?: string;
// // //   defaultViewMode?: "table" | "list" | "kanban";
// // //   className?: string;
// // //   cardClassName?: string;
// // //   title?: string;
// // //   extraFilter?: Record<string, any>;
// // //   listItemRender?: (row: any) => React.ReactNode;
// // //   kanbanOptions?: KanbanOptions<T>;
// // //   customFilterComponent?: React.ReactNode;
// // //   customFilterItems?: CustomFilterItem[];
// // //   onCustomFilterItemRemove?: (item: CustomFilterItem) => void;
// // // }

// // // const KanbanCard = <T,>({
// // //   item,
// // //   options,
// // // }: {
// // //   item: T & { id: string | number };
// // //   options: KanbanOptions<T>;
// // // }) => {
// // //   const {
// // //     attributes,
// // //     listeners,
// // //     setNodeRef,
// // //     transform,
// // //     transition,
// // //     isDragging,
// // //   } = useSortable({ id: item.id });
// // //   const style = {
// // //     transform: CSS.Transform.toString(transform),
// // //     transition,
// // //     opacity: isDragging ? 0.5 : 1,
// // //     zIndex: isDragging ? 9999 : "auto",
// // //   };
// // //   return (
// // //     <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
// // //       {options.cardRender(item)}
// // //     </div>
// // //   );
// // // };

// // // const KanbanColumn = <T,>({
// // //   id,
// // //   title,
// // //   items,
// // //   options,
// // // }: {
// // //   id: string | number;
// // //   title: string;
// // //   items: (T & { id: string | number })[];
// // //   options: KanbanOptions<T>;
// // // }) => {
// // //   return (
// // //     <div className="w-72 md:w-80 flex-shrink-0 bg-gray-100 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 flex flex-col">
// // //       <h3 className="p-3 text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-slate-700">
// // //         {title} <span className="text-sm text-gray-500">({items.length})</span>
// // //       </h3>
// // //       <SortableContext
// // //         id={String(id)}
// // //         items={items.map((i) => i.id)}
// // //         strategy={verticalListSortingStrategy}
// // //       >
// // //         <div className="p-2 min-h-[400px] max-h-[70vh] overflow-y-auto flex flex-col gap-3">
// // //           {items.map((item) => (
// // //             <KanbanCard key={item.id} item={item} options={options} />
// // //           ))}
// // //         </div>
// // //       </SortableContext>
// // //     </div>
// // //   );
// // // };

// // // // ====================================================================================
// // // // START: بازنویسی کامل و نهایی KanbanView با معماری کنترل‌شده
// // // // ====================================================================================
// // // const KanbanView = <T extends { id: number | string }>({
// // //   options,
// // // }: {
// // //   options: KanbanOptions<T>;
// // // }) => {
// // //   const [activeItem, setActiveItem] = useState<T | null>(null);

// // //   const sensors = useSensors(
// // //     useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
// // //     useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
// // //   );

// // //   const handleDragStart = (event: DragStartEvent) => {
// // //     const { active } = event;
// // //     const allItems = Object.values(options.groupedData).flat();
// // //     setActiveItem(allItems.find((i) => i.id === active.id) || null);
// // //   };

// // //   const handleDragEnd = (event: DragEndEvent) => {
// // //     const { active, over } = event;
// // //     setActiveItem(null);
// // //     if (over && options.onCardDrop) {
// // //       options.onCardDrop(active, over);
// // //     }
// // //   };

// // //   return (
// // //     <DndContext
// // //       sensors={sensors}
// // //       collisionDetection={closestCenter}
// // //       onDragStart={handleDragStart}
// // //       onDragEnd={handleDragEnd}
// // //     >
// // //       <div className="flex gap-4 overflow-x-auto p-2">
// // //         {options.columns.map((column) => (
// // //           <KanbanColumn
// // //             key={column.id}
// // //             id={String(column.id)}
// // //             title={column.title}
// // //             items={options.groupedData[String(column.id)] || []}
// // //             options={options}
// // //           />
// // //         ))}
// // //       </div>
// // //       {createPortal(
// // //         <DragOverlay>
// // //           {activeItem ? (
// // //             <div className="rounded-lg shadow-xl">
// // //               {options.cardRender(activeItem)}
// // //             </div>
// // //           ) : null}
// // //         </DragOverlay>,
// // //         document.body
// // //       )}
// // //     </DndContext>
// // //   );
// // // };
// // // // ====================================================================================
// // // // END: پایان بازنویسی
// // // // ====================================================================================

// // // const DataTableWrapper4 = <T extends { id: number | string }>({
// // //   columns,
// // //   loading = false,
// // //   showIconViews = true,
// // //   error = null,
// // //   emptyMessage = "هیچ داده‌ای یافت نشد",
// // //   loadingMessage = "در حال بارگذاری",
// // //   fetcher,
// // //   searchPlaceholder = "جستجو...",
// // //   filterOptions = [],
// // //   dateFilterFields = [],
// // //   createUrl,
// // //   defaultViewMode = "list",
// // //   className = "",
// // //   listClassName = "",
// // //   extraFilter,
// // //   listItemRender,
// // //   kanbanOptions,
// // //   customFilterComponent,
// // //   customFilterItems = [],
// // //   onCustomFilterItemRemove,
// // // }: DataTableWrapperProps<T>) => {
// // //   const [data, setData] = useState<T[]>([]);
// // //   const [pagination, setPagination] = useState({
// // //     total: 0,
// // //     pages: 1,
// // //     page: 1,
// // //     limit: 10,
// // //   });
// // //   const [searchTerm, setSearchTerm] = useState("");
// // //   const [filtersValue, setFilterValue] = useState(new Map<string, any>());
// // //   const [viewMode, setViewMode] = useState(defaultViewMode);

// // //   useEffect(() => {
// // //     const limit = viewMode === "kanban" ? 1000 : pagination.limit;
// // //     get(pagination.page, limit);
// // //   }, [searchTerm, filtersValue, extraFilter, viewMode]);

// // //   const get = async (page = 1, limit = pagination.limit) => {
// // //     try {
// // //       const params: any = { page, limit };
// // //       if (searchTerm) params.search = searchTerm;
// // //       filtersValue.forEach((value, key) => {
// // //         if (value && (!Array.isArray(value) || value.length > 0)) {
// // //           params[key] = Array.isArray(value) ? value.join(",") : value;
// // //         }
// // //       });
// // //       if (extraFilter && Object.keys(extraFilter).length > 0) {
// // //         const filteredExtraFilter = Object.fromEntries(
// // //           Object.entries(extraFilter).filter(
// // //             ([, value]) => value !== null && value !== undefined
// // //           )
// // //         );
// // //         Object.assign(params, filteredExtraFilter);
// // //       }
// // //       const result = await fetcher(params);
// // //       setData(result.data);
// // //       if (viewMode !== "kanban") {
// // //         setPagination(result.pagination);
// // //       }
// // //     } catch (error) {
// // //       console.error("Error fetching data:", error);
// // //     }
// // //   };

// // //   const handlePageChange = (page: number) => get(page);
// // //   const handleFilterChange = (name: string, value: any) => {
// // //     setFilterValue((prev) => {
// // //       const newFilters = new Map(prev);
// // //       if (
// // //         value === "all" ||
// // //         value === null ||
// // //         value === "" ||
// // //         (Array.isArray(value) && value.length === 0)
// // //       ) {
// // //         newFilters.delete(name);
// // //       } else {
// // //         newFilters.set(name, value);
// // //       }
// // //       return newFilters;
// // //     });
// // //   };

// // //   const optionsMap = useMemo(() => {
// // //     const map = new Map<string, string>();
// // //     filterOptions.forEach((filter) =>
// // //       filter.options.forEach((option) =>
// // //         map.set(`${filter.name}-${option.value}`, option.label)
// // //       )
// // //     );
// // //     return map;
// // //   }, [filterOptions]);

// // //   const handleRemoveFilterTag = (filterName: string, valueToRemove: string) => {
// // //     const currentValues = filtersValue.get(filterName) || [];
// // //     if (!Array.isArray(currentValues)) return;
// // //     const newValues = currentValues.filter((v: string) => v !== valueToRemove);
// // //     handleFilterChange(filterName, newValues);
// // //   };

// // //   const hasActiveTags = Array.from(filtersValue.values()).some(
// // //     (v) => Array.isArray(v) && v.length > 0
// // //   );
// // //   const handleSearch = (data: { search: string }) => setSearchTerm(data.search);
// // //   const clear = () => setFilterValue(new Map<string, any>());

// // //   const actionButton = createUrl ? (
// // //     <Link href={createUrl}>
// // //       <Button icon={<DIcon icon="fa-plus" cdi={false} classCustom="!mx-0" />}>
// // //         ایجاد
// // //       </Button>
// // //     </Link>
// // //   ) : undefined;

// // //   const renderContent = () => {
// // //     if (loading)
// // //       return <div className="p-10 text-center">{loadingMessage}...</div>;
// // //     if (error)
// // //       return (
// // //         <div className="p-4 text-red-700 bg-red-100 border border-red-400 rounded-lg">
// // //           {error}
// // //         </div>
// // //       );
// // //     // برای کانبان، حتی اگر داده خالی باشد، باید ستون‌ها نمایش داده شوند
// // //     if (viewMode !== "kanban" && (!data || data.length === 0)) {
// // //       return <div className="p-10 text-center">{emptyMessage}</div>;
// // //     }
// // //     if (viewMode === "kanban" && kanbanOptions?.enabled) {
// // //       return <KanbanView options={kanbanOptions} />;
// // //     }
// // //     return (
// // //       <Table
// // //         iconViewMode={{ table: TableIcon(), list: ListIcon() }}
// // //         listClassName={listClassName}
// // //         loading={loading}
// // //         loadingMessage={loadingMessage}
// // //         noDataMessage={emptyMessage}
// // //         columns={columns}
// // //         data={data}
// // //         pagination={pagination}
// // //         paginationUI={{
// // //           next: <DIcon icon="fa-angle-left" />,
// // //           prev: <DIcon icon="fa-angle-right" />,
// // //           last: <DIcon icon="fa-angles-left" />,
// // //           first: <DIcon icon="fa-angles-right" />,
// // //           className:
// // //             "!bg-white dark:!bg-slate-800 border-[1px] border-gray-400",
// // //         }}
// // //         onPageChange={handlePageChange}
// // //         defaultViewMode={viewMode === "kanban" ? "list" : viewMode}
// // //         listItemRender={listItemRender}
// // //         showIconViews={false}
// // //       />
// // //     );
// // //   };

// // //   const KanbanIcon = () => (
// // //     <svg
// // //       className="w-4 h-4"
// // //       fill="currentColor"
// // //       viewBox="0 0 20 20"
// // //       xmlns="http://www.w3.org/2000/svg"
// // //     >
// // //       <path d="M2 3a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm8 0a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1h-4a1 1 0 01-1-1V3z"></path>
// // //     </svg>
// // //   );

// // //   return (
// // //     <div className={className}>
// // //       <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-1">
// // //         <div className="flex items-center gap-4">
// // //           <Form schema={searchSchema} onSubmit={handleSearch} className="grow">
// // //             <div className="flex items-center">
// // //               <Input
// // //                 name="search"
// // //                 variant="primary"
// // //                 className="bg-white max-md:w-40 lg:w-64"
// // //                 placeholder={searchPlaceholder}
// // //               />
// // //               <Button
// // //                 variant="ghost"
// // //                 type="submit"
// // //                 size="xs"
// // //                 className="h-full"
// // //                 icon={<DIcon icon="fa-search" />}
// // //               />
// // //             </div>
// // //           </Form>
// // //           {showIconViews && (
// // //             <div className="flex items-center p-1 bg-gray-200 dark:bg-slate-700 rounded-lg">
// // //               <button
// // //                 onClick={() => setViewMode("table")}
// // //                 className={`p-1.5 rounded-md ${
// // //                   viewMode === "table"
// // //                     ? "bg-white dark:bg-slate-600 shadow"
// // //                     : ""
// // //                 }`}
// // //               >
// // //                 <TableIcon />
// // //               </button>
// // //               <button
// // //                 onClick={() => setViewMode("list")}
// // //                 className={`p-1.5 rounded-md ${
// // //                   viewMode === "list" ? "bg-white dark:bg-slate-600 shadow" : ""
// // //                 }`}
// // //               >
// // //                 <ListIcon />
// // //               </button>
// // //               {kanbanOptions?.enabled && (
// // //                 <button
// // //                   onClick={() => setViewMode("kanban")}
// // //                   className={`p-1.5 rounded-md ${
// // //                     viewMode === "kanban"
// // //                       ? "bg-white dark:bg-slate-600 shadow"
// // //                       : ""
// // //                   }`}
// // //                 >
// // //                   <KanbanIcon />
// // //                 </button>
// // //               )}
// // //             </div>
// // //           )}
// // //         </div>
// // //         {actionButton}
// // //       </div>
// // //       {(filterOptions.length > 0 || dateFilterFields.length > 0) && (
// // //         <div className="collapse collapse-arrow bg-white dark:bg-slate-800 mb-4 relative z-30">
// // //           <input type="checkbox" name="my-accordion-2" />
// // //           <div className="collapse-title text-slate-800 dark:text-slate-200">
// // //             <DIcon icon="fa-filter" /> فیلترها
// // //           </div>
// // //           <div className="collapse-content overflow-visible">
// // //             <div className="flex flex-wrap items-center gap-3">
// // //               {customFilterComponent && <div>{customFilterComponent}</div>}
// // //               {filterOptions.map((filter) => (
// // //                 <div key={filter.name} className="w-full sm:w-auto md:w-52">
// // //                   <MultiSelectFilter
// // //                     label={filter.label}
// // //                     options={filter.options}
// // //                     selectedValues={filtersValue.get(filter.name) || []}
// // //                     onChange={(values) =>
// // //                       handleFilterChange(filter.name, values)
// // //                     }
// // //                   />
// // //                 </div>
// // //               ))}
// // //               {(hasActiveTags ||
// // //                 dateFilterFields.some(
// // //                   (f) =>
// // //                     filtersValue.has(`${f.name}_gte`) ||
// // //                     filtersValue.has(`${f.name}_lte`)
// // //                 )) && (
// // //                 <div className="ml-auto self-center">
// // //                   <Button
// // //                     variant="ghost"
// // //                     onClick={clear}
// // //                     className="!text-error"
// // //                   >
// // //                     پاک کردن فیلترها
// // //                   </Button>
// // //                 </div>
// // //               )}
// // //             </div>
// // //             {hasActiveTags && (
// // //               <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-slate-700">
// // //                 {Array.from(filtersValue.entries()).map(
// // //                   ([key, values]) =>
// // //                     Array.isArray(values) &&
// // //                     values.map((value) => (
// // //                       <div
// // //                         key={`${key}-${value}`}
// // //                         className="group flex items-center bg-teal-50 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-sm font-medium pl-3 pr-1.5 py-1 rounded-full"
// // //                       >
// // //                         <span>
// // //                           {optionsMap.get(`${key}-${value}`) || value}
// // //                         </span>
// // //                         <button
// // //                           onClick={() => handleRemoveFilterTag(key, value)}
// // //                           className="flex-shrink-0 ml-1.5 h-5 w-5 rounded-full inline-flex items-center justify-center"
// // //                         >
// // //                           <DIcon
// // //                             icon="fa-times"
// // //                             classCustom="text-teal-500 dark:text-teal-400 group-hover:text-teal-700 text-xs"
// // //                           />
// // //                         </button>
// // //                       </div>
// // //                     ))
// // //                 )}
// // //               </div>
// // //             )}
// // //             {customFilterItems.length > 0 && (
// // //               <div
// // //                 className={`flex flex-wrap items-center gap-2 pt-3 ${
// // //                   hasActiveTags
// // //                     ? "pt-2"
// // //                     : "mt-3 border-t border-gray-200 dark:border-slate-700"
// // //                 }`}
// // //               >
// // //                 {customFilterItems.map((item) => (
// // //                   <div
// // //                     key={`${item.type}-${item.id}`}
// // //                     className="group flex items-center bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 text-sm font-medium pl-3 pr-1.5 py-1 rounded-full"
// // //                   >
// // //                     <span>{item.name}</span>
// // //                     <button
// // //                       onClick={() => onCustomFilterItemRemove?.(item)}
// // //                       className="flex-shrink-0 ml-1.5 h-5 w-5 rounded-full inline-flex items-center justify-center"
// // //                     >
// // //                       <DIcon
// // //                         icon="fa-times"
// // //                         classCustom="text-orange-500 dark:text-orange-400 group-hover:text-orange-700 text-xs"
// // //                       />
// // //                     </button>
// // //                   </div>
// // //                 ))}
// // //               </div>
// // //             )}
// // //             {dateFilterFields.length > 0 && (
// // //               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
// // //                 {dateFilterFields.map((field) => (
// // //                   <React.Fragment key={field.name}>
// // //                     <StandaloneDatePicker2
// // //                       name={`${field.name}_gte`}
// // //                       label={`${field.label} (از)`}
// // //                       value={filtersValue.get(`${field.name}_gte`) || null}
// // //                       timeOfDay="start"
// // //                       onChange={(payload) =>
// // //                         handleFilterChange(
// // //                           `${field.name}_gte`,
// // //                           payload ? payload.iso : null
// // //                         )
// // //                       }
// // //                     />
// // //                     <StandaloneDatePicker2
// // //                       name={`${field.name}_lte`}
// // //                       label={`${field.label} (تا)`}
// // //                       value={filtersValue.get(`${field.name}_lte`) || null}
// // //                       timeOfDay="end"
// // //                       onChange={(payload) =>
// // //                         handleFilterChange(
// // //                           `${field.name}_lte`,
// // //                           payload ? payload.iso : null
// // //                         )
// // //                       }
// // //                     />
// // //                   </React.Fragment>
// // //                 ))}
// // //               </div>
// // //             )}
// // //           </div>
// // //         </div>
// // //       )}
// // //       <div className="mt-4">{renderContent()}</div>
// // //     </div>
// // //   );
// // // };

// // // export default DataTableWrapper4;
