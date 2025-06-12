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
import React, { useEffect, useState } from "react";
import { z } from "zod";
import Select22 from "./Select22";

const searchSchema = z.object({
  search: z.string(),
});

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
  }, [searchTerm, filtersValue, extraFilter]);

  const get = async (page = 1, limit = pagination.limit) => {
    try {
      const params: any = { page, limit };

      if (searchTerm) {
        params.search = searchTerm;
      }

      filtersValue.forEach((value, key) => {
        if (value && value !== "all" && value !== "") {
          params[key] = value;
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

  const handleFilterChange = (name: string, value: string | number) => {
    setFilterValue((prev) => {
      const newFilters = new Map(prev);
      if (value === "all") {
        newFilters.delete(name);
      } else newFilters.set(name, value);
      return newFilters;
    });
  };

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

      {filterOptions.length > 0 && (
        <div className="collapse collapse-arrow bg-white mb-4">
          <input type="checkbox" name="my-accordion-2" />
          <div className="collapse-title">
            <DIcon icon="fa-filter" />
            فیلتر ها ....
          </div>
          <div className="collapse-content">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => (
                <div key={filter.name} className="w-full md:w-auto">
                  <Select22
                    name={filter.name}
                    options={filter.options}
                    onChange={(e) =>
                      handleFilterChange(filter.name, e.target.value)
                    }
                    placeholder={filter.label}
                  />
                </div>
              ))}

              <Button
                variant="ghost"
                onClick={clear}
                icon={
                  <DIcon
                    icon="fa-xmark"
                    cdi={false}
                    classCustom="!text-error"
                  />
                }
                className="!text-error"
              >
                حذف فیلترها
              </Button>
            </div>
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
