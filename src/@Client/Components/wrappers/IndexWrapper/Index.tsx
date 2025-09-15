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
import React, { useEffect, useState } from "react";
import { z } from "zod";
import Select22 from "../Select22";

const searchSchema = z.object({
  search: z.string(),
});

interface DataTableWrapperProps<T, R extends BaseRepository<T, number>> {
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
  extraFilter?: Record<string, any>;
  defaultFilter?: Array<Record<string, any>>;
  onFilterChange?: (name: string, value: string) => void;
  createUrl?: boolean;
  quickCreate?: React.ReactNode | ((closeModal: () => void) => React.ReactNode);
  defaultViewMode?: "table" | "list";
  className?: string;
  cardClassName?: string;
  title?: string;
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
  repo: R;
  listItemRender?: (row: any, columns: Column[]) => React.ReactNode;
  /**
   * Selection mode can be either "multiple" or "single".
   */
  selectionMode?: "multiple" | "single" | "none";
  onSelect?: (selectedItems: T[]) => void; // در multiple آرایه و در single شیء یا null
}

const IndexWrapper = <T, R extends BaseRepository<T, number>>({
  columns,
  showIconViews = true,
  emptyMessage = "هیچ داده‌ای یافت نشد",
  loadingMessage = "در حال بارگذاری",
  onSearch = true,
  searchPlaceholder = "جستجو...",
  filterOptions = [],
  createUrl = true,
  defaultViewMode = "list",
  className = "",
  listClassName = "",
  title = "",
  repo,
  extraFilter,
  defaultFilter,
  onClear,
  quickCreate,
  listItemRender = undefined,
  selectionMode = "none",
  onSelect,
}: DataTableWrapperProps<T, R>) => {
  const [selectedItems, setSelctedItems] = useState<T[]>([]);

  const handleSelectionChange = (newSelected: T[]) => {
    setSelctedItems(newSelected);
  };

  const pathname = usePathname(); // Get the current route

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
      if (defaultFilter && Array.isArray(defaultFilter)) {
        defaultFilter.forEach((filter) => {
          Object.entries(filter).forEach(([key, value]) => {
            if (
              value !== null &&
              value !== undefined &&
              value !== "all" &&
              value !== ""
            ) {
              params[key] = value;
            }
          });
        });
      }

      if (extraFilter && Object.keys(extraFilter).length > 0) {
        const filteredExtraFilter = Object.fromEntries(
          Object.entries(extraFilter).filter(
            ([, value]) => value !== null && value !== undefined
          )
        );

        Object.assign(params, filteredExtraFilter);
      }

      const data = await getAll(params);
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
    <Link href={`${pathname}/create`}>
      <Button icon={<DIcon icon="fa-plus" cdi={false} classCustom="!mx-0" />}>
        ایجاد
      </Button>
    </Link>
  ) : undefined;

  const onSelectButton = onSelect ? (
    <Button
      icon={<DIcon icon="fa-check" cdi={false} classCustom="!mx-0" />}
      onClick={() => {
        onSelect?.(selectedItems);
      }}
    >
      انتخاب
    </Button>
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
        {onSelectButton}
        {quickCreate && (
          <ButtonCreate
            modalTitle="ایجاد سریع"
            modalContent={quickCreate}
          ></ButtonCreate>
        )}
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
        selection={selectionMode} // انتخاب mode به جدول پاس داده می‌شود
        defaultSelected={selectedItems}
        onSelectionChange={handleSelectionChange}
      />
    </div>
  );
};


export default IndexWrapper;
