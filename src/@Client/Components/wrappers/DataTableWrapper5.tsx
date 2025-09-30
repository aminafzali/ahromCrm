// // مسیر : src/@Client/Components/wrappers/DataTableWrapper5.tsx
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
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useDroppable,
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
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { z } from "zod";
import MultiSelectFilter from "../ui/MultiSelectFilter";
import StandaloneDatePicker2 from "../ui/StandaloneDatePicker2";

const searchSchema = z.object({ search: z.string() });

export interface KanbanColumnSource {
  id: string | number;
  title: string;
  color?: string; // اضافه شد: رنگ وضعیت (hex)
  order?: number;
  [key: string]: any;
}

// داده‌های گروه‌بندی‌شده کانبان
type KanbanGroupedData<T> = Record<string, T[]>;

interface KanbanOptions<T> {
  enabled: boolean;
  cardRender: (
    item: T,
    isDragging?: boolean,
    isActivatable?: boolean
  ) => React.ReactNode;
  onCardDrop?: (active: any, over: any) => void;
  groupedData: KanbanGroupedData<T>;
  columns: KanbanColumnSource[];
}

interface KanbanTouchConfig {
  delay?: number; // ms for TouchSensor activation
  tolerance?: number;
  pointerDistance?: number;
  // optional: scroll tuning
  scrollEdgeThreshold?: number;
  scrollSpeed?: number;
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

/** helper: تبدیل hex color به rgba با آلفا */
const hexToRgba = (hex?: string, alpha = 1) => {
  try {
    if (!hex) return undefined;
    let h = hex.replace("#", "").trim();
    if (h.length === 3) {
      h = h
        .split("")
        .map((c) => c + c)
        .join("");
    }
    const int = parseInt(h, 16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch {
    return undefined;
  }
};

/** کارت کانبان — هر کارت با id یکتا task-<id> شناخته می‌شود */
const KanbanCard = <T,>({
  item,
  options,
  activeItemId,
}: {
  item: T & { id: string | number };
  options: KanbanOptions<T>;
  activeItemId?: string | number | null;
}) => {
  // useSortable با id ای که wrapper صفحه تولید می‌کند: `task-<id>`
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `task-${item.id}` });

  const isActivatable =
    activeItemId !== null && String(activeItemId) === String(item.id);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 9999 : "auto",
    WebkitUserSelect: "none",
    userSelect: "none",
  };

  // تشخیص موبایل یا دسکتاپ
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="relative">
      {/* Handle برای موبایل - فقط این بخش قابل drag است */}
      {isMobile && (
        <div
          {...listeners}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center cursor-grab active:cursor-grabbing bg-gray-100 dark:bg-gray-700 rounded-md opacity-70 hover:opacity-100 transition-opacity z-10 touch-none"
          style={{ touchAction: "none" }}
        >
          <svg
            className="w-4 h-4 text-gray-600 dark:text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M7 2a1 1 0 000 2h6a1 1 0 100-2H7zM4 6a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 10a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zM4 14a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM7 18a1 1 0 000 2h6a1 1 0 100-2H7z"></path>
          </svg>
        </div>
      )}

      {/* محتوای کارت */}
      <div
        {...(!isMobile ? listeners : {})}
        className={!isMobile ? "cursor-grab active:cursor-grabbing" : ""}
        style={{ touchAction: "manipulation" }}
      >
        {options.cardRender(item, isDragging, isActivatable)}
      </div>
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
  color,
  activeItemId,
}: {
  id: string | number;
  title: string;
  items: (T & { id: string | number })[];
  options: KanbanOptions<T>;
  color?: string;
  activeItemId?: string | number | null;
}) => {
  // droppable registration برای ستون (مهم برای ستون‌های خالی)
  const droppableId = `col-${String(id)}`;
  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: droppableId,
  });

  const headerBg = hexToRgba(color, 0.1);
  const headerBorder = hexToRgba(color, 0.22);

  return (
    <div
      ref={setDroppableRef}
      className={`w-72 md:w-80 flex-shrink-0 rounded-lg border flex flex-col transition-all duration-150 ${
        isOver
          ? "bg-teal-700/10 dark:bg-teal-900/20 border-teal-700"
          : "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
      }`}
      style={{
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-y", // اجازه اسکرول عمودی
      }}
    >
      <h3
        className="p-3 text-lg font-semibold text-gray-800 dark:text-gray-100 border-b"
        style={{
          backgroundColor: headerBg,
          borderBottomColor: headerBorder,
        }}
      >
        {title} <span className="text-sm text-gray-500">({items.length})</span>
      </h3>

      <SortableContext
        id={droppableId}
        items={items.map((i) => `task-${i.id}`)}
        strategy={verticalListSortingStrategy}
      >
        <div
          className="p-2 min-h-[200px] max-h-[70vh] overflow-y-auto flex flex-col gap-3"
          style={{
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorY: "contain",
            touchAction: "pan-y manipulation", // اجازه اسکرول عمودی و manipulation
            paddingBottom: "1.5cm", // فضای بیشتری برای اسکرول راحت
          }}
        >
          {items.map((item) => (
            <KanbanCard
              key={`task-${item.id}`}
              item={item}
              options={options}
              activeItemId={activeItemId}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

// ====================================================================================
// KanbanView: کنترل‌شده، پشتیبانی از TouchSensor و over tracking دقیق
// (نسخهٔ با auto-scroll دستی و لاگینگ)
// ====================================================================================
const KanbanView = <T extends { id: number | string }>(props: {
  options: KanbanOptions<T>;
  touchConfig?: KanbanTouchConfig;
}) => {
  const {
    options,
    touchConfig = { delay: 150, tolerance: 5, pointerDistance: 5 },
  } = props;

  const [activeItem, setActiveItem] = useState<T | null>(null);

  // ref به کانتینر اسکرول افقی تا auto-scroll دستی انجام بشه
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  // آخرین مختصات اشاره‌گر
  const lastClientXRef = useRef<number | null>(null);
  // smoothing برای سرعت اسکرول (اجتناب از جهش)
  const scrollVelocityRef = useRef(0);

  // پارامترها — از touchConfig قابل override
  const EDGE_THRESHOLD = touchConfig.scrollEdgeThreshold ?? 80;
  const BASE_SCROLL_SPEED = touchConfig.scrollSpeed ?? 18;
  const MIN_FACTOR = 0.12; // حداقل فاکتور سرعت
  const SMOOTHING = 0.15; // میزان هموارسازی velocity (0..1)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: touchConfig.pointerDistance ?? 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        // delay: زمان نگه‌داری قبل از شروع drag - متعادل برای موبایل
        delay: touchConfig.delay ?? 250,
        // tolerance: فاصله‌ای که می‌توان حرکت کرد بدون لغو drag
        // مقدار متعادل برای اسکرول و drag
        tolerance: touchConfig.tolerance ?? 8,
      },
    })
  );

  // helper: محاسبه و اجرای اسکرول بر اساس lastClientXRef
  const performAutoScroll = () => {
    const container = containerRef.current;
    const clientX = lastClientXRef.current;
    if (!container || clientX == null) return;

    const rect = container.getBoundingClientRect();
    const leftEdge = rect.left;
    const rightEdge = rect.right;

    const distLeft = clientX - leftEdge;
    const distRight = rightEdge - clientX;

    let targetVelocity = 0; // مثبت => scroll right, منفی => scroll left

    if (distLeft < EDGE_THRESHOLD) {
      const factor = Math.max(
        MIN_FACTOR,
        (EDGE_THRESHOLD - distLeft) / EDGE_THRESHOLD
      );
      targetVelocity = -Math.ceil(BASE_SCROLL_SPEED * factor);
    } else if (distRight < EDGE_THRESHOLD) {
      const factor = Math.max(
        MIN_FACTOR,
        (EDGE_THRESHOLD - distRight) / EDGE_THRESHOLD
      );
      targetVelocity = Math.ceil(BASE_SCROLL_SPEED * factor);
    } else {
      targetVelocity = 0;
    }

    // هموارسازی velocity (کاهش لگ/پرش)
    scrollVelocityRef.current =
      scrollVelocityRef.current +
      (targetVelocity - scrollVelocityRef.current) * SMOOTHING;

    // اگر velocity نزدیک صفر شد، صفرش کن
    if (Math.abs(scrollVelocityRef.current) < 0.5)
      scrollVelocityRef.current = 0;

    if (scrollVelocityRef.current !== 0) {
      // scrollBy باید با left به کار رود (مثبت => به راست)
      container.scrollBy({
        left: Math.round(scrollVelocityRef.current),
        behavior: "auto",
      });
      // لاگ فقط برای دیباگ - حذف کنید اگر لازم نبود
      // console.debug("[KANBAN-AUTOSCROLL] scrollBy", {
      //   velocity: scrollVelocityRef.current,
      //   targetVelocity,
      //   clientX,
      // });
    }
  };

  // حلقهٔ RAF پیوسته که وقتی درگ فعال است اجرا می‌شود
  const autoScrollLoop = () => {
    if (!draggingRef.current) {
      // cleanup
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      scrollVelocityRef.current = 0;
      return;
    }

    performAutoScroll();
    rafRef.current = window.requestAnimationFrame(autoScrollLoop);
  };

  // listener کلی روی pointermove / touchmove که موقعیت اشاره‌گر را آپدیت می‌کند
  const globalMoveHandler = (e: PointerEvent | TouchEvent) => {
    if (!draggingRef.current) return;
    let clientX: number | null = null;
    if (e instanceof PointerEvent) {
      clientX = e.clientX;
    } else if (e instanceof TouchEvent) {
      if (e.touches && e.touches.length > 0) clientX = e.touches[0].clientX;
    }
    if (clientX == null) return;
    lastClientXRef.current = clientX;
    // لاگ سبک برای دیباگ
    // console.debug("[KANBAN-DRAG] pointer move", { clientX });
  };

  // فعال/غیرفعال کردن listener های global در شروع/پایان درگ
  const enableGlobalMoveListeners = () => {
    window.addEventListener("pointermove", globalMoveHandler as any, {
      passive: true,
    });
    window.addEventListener("touchmove", globalMoveHandler as any, {
      passive: true,
    });
    // شروع حلقه
    if (!rafRef.current)
      rafRef.current = window.requestAnimationFrame(autoScrollLoop);
  };
  const disableGlobalMoveListeners = () => {
    window.removeEventListener("pointermove", globalMoveHandler as any);
    window.removeEventListener("touchmove", globalMoveHandler as any);
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastClientXRef.current = null;
    scrollVelocityRef.current = 0;
  };

  const handleDragStart = (event: DragStartEvent) => {
    // console.log("[KANBAN-DRAG] 🟢 Drag start", {
    //   activeId: event.active.id,
    //   rect: (event.active as any)?.rect ?? null,
    // });
    const { active } = event;
    const allItems = Object.values(options.groupedData).flat();
    const rawId = String(active.id);
    const found = allItems.find(
      (i) => `task-${i.id}` === rawId || String(i.id) === rawId
    );
    setActiveItem(found || null);

    // enable auto-scroll listeners برای همه سایزها
    draggingRef.current = true;
    enableGlobalMoveListeners();
  };

  // onDragOver می‌مونه ولی ما پردازش اصلی اسکرول را با globalMoveHandler + RAF انجام میدیم
  const handleDragOver = (event: DragOverEvent) => {
    // console.debug("[KANBAN-DRAG] Drag over", {
    //   activeId: event.active.id,
    //   overId: event.over?.id,
    //   delta: event.delta,
    // });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    // console.debug("[KANBAN-DRAG] Drag end", {
    //   activeId: event.active.id,
    //   overId: event.over?.id,
    //   delta: event.delta,
    // });
    const { active, over } = event;
    setActiveItem(null);

    // disable auto-scroll listeners
    draggingRef.current = false;
    disableGlobalMoveListeners();

    if (over && options.onCardDrop) {
      options.onCardDrop(active, over);
    }
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      disableGlobalMoveListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      autoScroll={false} // ما از autoScroll داخلی استفاده نمی‌کنیم، دستی مدیریت می‌کنیم
    >
      {/* کانتینر اسکرولی که بهش ref داده می‌شود تا auto-scroll دستی انجام شود */}
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto p-2"
        style={{
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-x manipulation", // اجازه اسکرول افقی و manipulation
          overscrollBehaviorX: "contain",
        }}
      >
        {options.columns.map((column) => (
          // هر ستون کاملاً مستقل است؛ KanbanColumn خودش droppable را ثبت می‌کند
          <div key={`col-wrapper-${column.id}`} className="flex-shrink-0">
            <KanbanColumn
              id={String(column.id)}
              title={column.title}
              items={options.groupedData[String(column.id)] || []}
              options={options}
              color={column.color}
              activeItemId={activeItem?.id ?? null}
            />
          </div>
        ))}
      </div>

      {createPortal(
        <DragOverlay>
          {activeItem ? (
            <div className="rounded-lg shadow-xl">
              {options.cardRender(activeItem, true, true)}
            </div>
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};
// ====================================================================================
// END KanbanView
// ====================================================================================

const DataTableWrapper5 = <T extends { id: number | string }>(
  props: DataTableWrapperProps<T> & { kanbanTouchConfig?: KanbanTouchConfig }
) => {
  const {
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
  } = props;

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

  const hasActiveTags = Array.from(filtersValue.values()).some(
    (v) => Array.isArray(v) && v.length > 0
  );
  const handleSearch = (data: { search: string }) => setSearchTerm(data.search);
  const clear = () => setFilterValue(new Map<string, any>());

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

    if (viewMode === "kanban" && kanbanOptions?.enabled) {
      return (
        <KanbanView options={kanbanOptions} touchConfig={kanbanTouchConfig} />
      );
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
              {customFilterComponent && <div>{customFilterComponent}</div>}
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
              {(hasActiveTags ||
                dateFilterFields.some(
                  (f) =>
                    filtersValue.has(`${f.name}_gte`) ||
                    filtersValue.has(`${f.name}_lte`)
                )) && (
                <div className="ml-auto self-center">
                  <Button
                    variant="ghost"
                    onClick={clear}
                    className="!text-error"
                  >
                    پاک کردن فیلترها
                  </Button>
                </div>
              )}
            </div>

            {hasActiveTags && (
              <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-slate-700">
                {Array.from(filtersValue.entries()).map(
                  ([key, values]) =>
                    Array.isArray(values) &&
                    values.map((value) => (
                      <div
                        key={`${key}-${value}`}
                        className="group flex items-center bg-teal-50 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-sm font-medium pl-3 pr-1.5 py-1 rounded-full"
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

            {customFilterItems.length > 0 && (
              <div
                className={`flex flex-wrap items-center gap-2 pt-3 ${
                  hasActiveTags
                    ? "pt-2"
                    : "mt-3 border-t border-gray-200 dark:border-slate-700"
                }`}
              >
                {customFilterItems.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="group flex items-center bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 text-sm font-medium pl-3 pr-1.5 py-1 rounded-full"
                  >
                    <span>{item.name}</span>
                    <button
                      onClick={() => onCustomFilterItemRemove?.(item)}
                      className="flex-shrink-0 ml-1.5 h-5 w-5 rounded-full inline-flex items-center justify-center"
                    >
                      <DIcon
                        icon="fa-times"
                        classCustom="text-orange-500 dark:text-orange-400 group-hover:text-orange-700 text-xs"
                      />
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

export default DataTableWrapper5;
