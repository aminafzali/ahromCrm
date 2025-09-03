// مسیر فایل: src/@Client/Components/wrappers/DataTableWrapper.tsx

import DIcon from "@/@Client/Components/common/DIcon";
import {
  CardIcon,
  ListIcon,
  TableIcon,
} from "@/@Client/Components/common/table/iconView";
import {
  FilterOption,
  FullQueryParams,
  PaginationResult,
} from "@/@Client/types";
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
  onPageChange?: (page: number) => void;
  onClear?: () => void;
  onSearch?: boolean;
  fetcher: (params: FullQueryParams) => Promise<PaginationResult<T>>;
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  dateFilterFields?: DateFilterField[];
  extraFilter?: Record<string, any>;
  onFilterChange?: (name: string, value: string) => void;
  createUrl?: string;
  defaultViewMode?: "table" | "list";
  className?: string;
  cardClassName?: string;
  title?: string;
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
  listItemRender?: (row: any, columns: Column[]) => React.ReactNode;
}

const DataTableWrapper = <T,>({
  columns,
  loading = false,
  showIconViews = true,
  error = null,
  emptyMessage = "هیچ داده‌ای یافت نشد",
  loadingMessage = "در حال بارگذاری",
  fetcher,
  onSearch = true,
  searchPlaceholder = "جستجو...",
  filterOptions = [],
  dateFilterFields = [],
  createUrl,
  defaultViewMode = "list",
  className = "",
  cardClassName = "",
  listClassName = "",
  title = "",
  extraFilter,
  onClear,
  listItemRender = undefined,
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

  useEffect(() => {
    get();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filtersValue, extraFilter]);

  const get = async (page = 1, limit = pagination.limit) => {
    try {
      const params: any = { page, limit };

      if (searchTerm) {
        params.search = searchTerm;
      }

      // ===== شروع اصلاحیه ۱: تبدیل آرایه به رشته =====
      filtersValue.forEach((value, key) => {
        if (value && (!Array.isArray(value) || value.length > 0)) {
          // اگر مقدار آرایه بود، آن را به رشته جدا شده با کاما تبدیل می‌کنیم
          params[key] = Array.isArray(value) ? value.join(",") : value;
        }
      });
      // ===== پایان اصلاحیه ۱ =====

      if (extraFilter && Object.keys(extraFilter).length > 0) {
        const filteredExtraFilter = Object.fromEntries(
          Object.entries(extraFilter).filter(
            ([, value]) => value !== null && value !== undefined
          )
        );
        Object.assign(params, filteredExtraFilter);
      }

      const data = await fetcher(params);
      setData(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handlePageChange = (page: number) => {
    get(page);
  };

  // ===== شروع اصلاحیه ۲: به‌روزرسانی توابع مدیریت فیلتر =====
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
  // ===== پایان اصلاحیه ۲ =====

  const handleSearch = (data: { search: string }) => {
    setSearchTerm(data.search);
  };

  const clear = () => {
    setFilterValue(new Map<string, any>());
    onClear?.();
  };

  const actionButton = createUrl ? (
    <Link href={createUrl}>
      <Button icon={<DIcon icon="fa-plus" cdi={false} classCustom="!mx-0" />}>
        ایجاد
      </Button>
    </Link>
  ) : undefined;

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
      </div>

      {(filterOptions.length > 0 || dateFilterFields.length > 0) && (
        // ===== شروع اصلاحیه =====
        <div className="collapse collapse-arrow bg-white mb-4 relative z-30">
          <input type="checkbox" name="my-accordion-2" />
          {/* // ===== پایان اصلاحیه ===== */}
          <div className="collapse-title text-slate-800 dark:text-slate-200">
            <DIcon icon="fa-filter" /> فیلترها
          </div>
          
          <div className="collapse-content overflow-visible">
            {/* ===== شروع اصلاحیه ۳: جایگزینی Select22 با MultiSelectFilter ===== */}
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
            {/* ===== پایان اصلاحیه ۳ ===== */}

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
        paginationUI={{
          next: <DIcon icon="fa-angle-left" />,
          prev: <DIcon icon="fa-angle-right" />,
          last: <DIcon icon="fa-angles-left" />,
          first: <DIcon icon="fa-angles-right" />,
          className: "!bg-white border-[1px] border-gray-400",
        }}
        onPageChange={handlePageChange}
        defaultViewMode={defaultViewMode}
        listItemRender={listItemRender}
        showIconViews={showIconViews}
      />
    </div>
  );
};

export default DataTableWrapper;
