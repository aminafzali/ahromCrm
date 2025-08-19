import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../Button/Button";
import Input from "../Input/Input";
import Select from "../Select/Select";
import Card from "../Card/Card";
import Pagination from "./Pagination";

const TableIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <line x1="3" y1="15" x2="21" y2="15"></line>
    <line x1="9" y1="3" x2="9" y2="21"></line>
    <line x1="15" y1="3" x2="15" y2="21"></line>
  </svg>
);

// Card view icon SVG
const CardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

// List view icon SVG
const ListIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

export interface Column {
  name: string;
  field?: string;
  label: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  filterable?: boolean;
  format?: (value: any) => React.ReactNode;
  render?: (row: any) => React.ReactNode;
  style?: React.CSSProperties;
  width?: number | string;
}

export interface TableProps {
  columns: Column[];
  data: any[];
  defaultSelected?: any[]; // لیست مقادیر انتخاب‌شده پیش‌فرض
  title?: string;
  loading?: boolean;
  showIconViews?: boolean;
  selection?: "single" | "multiple" | "none";
  onSelectionChange?: (selected: any[]) => void;
  pagination?: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  rowsPerPageOptions?: number[];
  onRowClick?: (row: any, index: number) => void;
  noDataMessage?: React.ReactNode;
  loadingMessage?: React.ReactNode;
  expandable?: boolean;
  tableCardView?: boolean;
  renderExpandedRow?: (row: any) => React.ReactNode;
  defaultViewMode?: "table" | "card" | "list";
  gridValue?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  iconViewMode?: {
    table?: React.ReactNode;
    card?: React.ReactNode;
    list?: React.ReactNode;
  };
  paginationUI?: {
    className?: string;
    first?: React.ReactNode;
    last?: React.ReactNode;
    next?: React.ReactNode;
    prev?: React.ReactNode;
    notFound?: React.ReactNode;
  };
  listItemHeight?: string;
  listItemClassName?: string;
  listClassName?: string;
  listItemRender?: (row: any, columns: Column[]) => React.ReactNode;
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  title,
  loading = false,
  showIconViews = true,
  selection = "none",
  onSelectionChange,
  pagination,
  onPageChange,
  onLimitChange,
  rowsPerPageOptions = [5, 10, 20, 50],
  onRowClick,
  noDataMessage = "No data available",
  loadingMessage = "Loading...",
  expandable = false,
  tableCardView = true,
  renderExpandedRow,
  defaultViewMode = "table",
  gridValue = { sm: 1, md: 2, lg: 3, xl: 3 },
  iconViewMode = {
    card: <CardIcon />,
    table: <TableIcon />,
    list: <ListIcon />,
  },
  listItemHeight = "auto",
  listItemClassName = "",
  listClassName,
  listItemRender,
  paginationUI,
  defaultSelected = [],
}) => {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDesc, setSortDesc] = useState(false);
  const [selected, setSelected] = useState<any[]>(defaultSelected || []);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<"table" | "card" | "list">(
    defaultViewMode
  );
  const tableRef = useRef<HTMLDivElement>(null);
  const resizingColumn = useRef<string | null>(null);
  const startX = useRef<number>(0);
  const startWidth = useRef<number>(0);


  // // Handle column resizing
  // const handleResizeStart = (e: React.MouseEvent, columnName: string) => {
  //   e.preventDefault();
  //   resizingColumn.current = columnName;
  //   startX.current = e.pageX;
  //   startWidth.current = columnWidths[columnName] || 0;

  //   document.addEventListener("mousemove", handleResizeMove);
  //   document.addEventListener("mouseup", handleResizeEnd);
  // };

  // const handleResizeMove = (e: MouseEvent) => {
  //   if (!resizingColumn.current) return;

  //   const diff = e.pageX - startX.current;
  //   const newWidth = Math.max(50, startWidth.current + diff);

  //   setColumnWidths((prev) => ({
  //     ...prev,
  //     [resizingColumn.current!]: newWidth,
  //   }));
  // };

  // const handleResizeEnd = () => {
  //   resizingColumn.current = null;
  //   document.removeEventListener("mousemove", handleResizeMove);
  //   document.removeEventListener("mouseup", handleResizeEnd);
  // };

  // useEffect(() => {
  //   return () => {
  //     document.removeEventListener("mousemove", handleResizeMove);
  //     document.removeEventListener("mouseup", handleResizeEnd);
  //   };
  // }, []);

  // Handle filtering
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      return Object.entries(filters).every(([field, value]) => {
        if (!field) return true;
        const cellValue = row[field]?.toString().toLowerCase();
        return !value || cellValue?.includes(value.toLowerCase());
      });
    });
  }, [data, filters]);

  // Handle sorting
  const sortedData = useMemo(() => {
    if (!sortBy) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue === bValue) return 0;
      const comparison = aValue > bValue ? 1 : -1;
      return sortDesc ? -comparison : comparison;
    });
  }, [filteredData, sortBy, sortDesc]);

  // Handle selection
  const handleSelectAll = () => {
    console.log("TODO");
    const newSelected = selected.length === data.length ? [] : data;
    setSelected(newSelected);
    onSelectionChange?.(newSelected);
  };

  const handleSelectRow = (row: any) => {
    let newSelected: any[];

    if (selection === "single") {
      newSelected = [row];
    } else {
      const selectedIndex = selected.findIndex(
        (selectedRow) => selectedRow.id === row.id
      );
      if (selectedIndex === -1) {
        newSelected = [...selected, row];
      } else {
        newSelected = selected.filter(
          (selectedRow) => selectedRow.id !== row.id
        );
      }
    }

    setSelected(newSelected);
    onSelectionChange?.(newSelected);
  };

  const isSelected = (row: any) =>
    selected.some((selectedRow) => selectedRow.id === row.id);

  // Handle row expansion
  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    );
  };

  // Get cell content based on column configuration
  const getCellContent = (row: any, column: Column) => {
    if (column.render) {
      return column.render(row);
    }

    if (column.field) {
      const value = column.field.includes(".")
        ? column.field.split(".").reduce((obj, key) => obj && obj[key], row)
        : row[column.field];

      return column.format ? column.format(value) : value;
    }

    return null;
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const handleLimitChange = (limit: number) => {
    if (onLimitChange) {
      onLimitChange(limit);
    }
  };

  // Render table view
  const renderTableView = () => (
    <div
      className={`overflow-x-auto ${
        tableCardView ? "bg-white border-2 p-2 rounded-lg" : ""
      }`}
    >
      <table className="table w-full">
        <thead>
          <tr>
            {selection !== "none" && (
              <th className="w-16">
                {selection === "multiple" && (
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={handleSelectAll}
                    aria-label="Select all rows"
                  />
                )}
              </th>
            )}
            {expandable && <th className="w-12"></th>}
            {columns.map((column) => (
              <th
                key={column.name}
                className={`
                  ${column.sortable && column.field ? "cursor-pointer" : ""} 
                  ${column.align ? `text-${column.align}` : ""}
                  relative
                `}
                style={{
                  width: columnWidths[column.name] || column.width,
                  minWidth: "100px",
                }}
                onClick={() => {
                  if (column.sortable && column.field) {
                    if (sortBy === column.field) {
                      setSortDesc(!sortDesc);
                    } else {
                      setSortBy(column.field);
                      setSortDesc(false);
                    }
                  }
                }}
                role="columnheader"
                aria-sort={
                  sortBy === column.field
                    ? sortDesc
                      ? "descending"
                      : "ascending"
                    : "none"
                }
              >
                <div className="flex items-center gap-2 ">
                  {column.label}
                  {column.sortable &&
                    column.field &&
                    sortBy === column.field && (
                      <span aria-hidden="true">{sortDesc ? "↓" : "↑"}</span>
                    )}
                </div>
                {column.filterable && column.field && (
                  <Input
                    name={`filter-${column.field}`}
                    value={filters[column.field] || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFilters((prev) => ({
                        ...prev,
                        [column.field!]: e.target.value,
                      }))
                    }
                    aria-label={`Filter ${column.label}`}
                    inputSize="xs"
                    className="mt-2 w-full"
                  />
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={
                  columns.length +
                  (selection !== "none" ? 1 : 0) +
                  (expandable ? 1 : 0)
                }
                className="text-center p-4"
                role="status"
              >
                {loadingMessage}
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={
                  columns.length +
                  (selection !== "none" ? 1 : 0) +
                  (expandable ? 1 : 0)
                }
                className="text-center p-4"
              >
                {noDataMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                <tr
                  className={`
                    ${onRowClick ? "cursor-pointer hover:bg-base-200" : ""}
                    ${isSelected(row) ? "bg-base-200" : ""}
                  `}
                  onClick={() => {
                    onRowClick?.(row, rowIndex);
                    if (selection !== "none") {
                      handleSelectRow(row);
                    }
                  }}
                  role="row"
                  aria-selected={isSelected(row)}
                >
                  {selection !== "none" && (
                    <td role="cell">
                      <input
                        type={selection === "multiple" ? "checkbox" : "radio"}
                        className={
                          selection === "multiple" ? "checkbox" : "radio"
                        }
                        checked={isSelected(row)}
                        onChange={() => handleSelectRow(row)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select row ${rowIndex + 1}`}
                      />
                    </td>
                  )}
                  {expandable && (
                    <td role="cell">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRowExpansion(row.id);
                        }}
                        aria-expanded={expandedRows.includes(row.id)}
                        aria-label={`Expand row ${rowIndex + 1}`}
                      >
                        {expandedRows.includes(row.id) ? "▼" : "▶"}
                      </Button>
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.name}
                      className={column.align ? `text-${column.align}` : ""}
                      style={{
                        width: columnWidths[column.name] || column.width,
                        ...column.style,
                      }}
                      role="cell"
                    >
                      {getCellContent(row, column)}
                    </td>
                  ))}
                </tr>
                {expandable && expandedRows.includes(row.id) && (
                  <tr>
                    <td
                      colSpan={
                        columns.length + (selection !== "none" ? 1 : 0) + 1
                      }
                      className="p-4 bg-base-100"
                    >
                      <AnimatePresence>
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {renderExpandedRow?.(row)}
                        </motion.div>
                      </AnimatePresence>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // Render card view
  const renderCardView = () => (
    <div
      className={`grid grid-cols-${gridValue.sm} md:grid-cols-${gridValue.md} lg:grid-cols-${gridValue.lg}  xl:grid-cols-${gridValue.xl} gap-2`}
    >
      {loading ? (
        <div className="col-span-full text-center p-4" role="status">
          {loadingMessage}
        </div>
      ) : data.length === 0 ? (
        <div className="col-span-full text-center p-4">{noDataMessage}</div>
      ) : (
        data.map((row, rowIndex) => (
          <Card
            key={rowIndex}
            className={`
              ${onRowClick ? "cursor-pointer" : ""}
              ${isSelected(row) ? "border-primary" : ""}
            `}
          >
            <div className="flex justify-between items-start mb-4">
              {selection !== "none" && (
                <input
                  type={selection === "multiple" ? "checkbox" : "radio"}
                  className={selection === "multiple" ? "checkbox" : "radio"}
                  checked={isSelected(row)}
                  onChange={() => handleSelectRow(row)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Select row ${rowIndex + 1}`}
                />
              )}
              {expandable && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRowExpansion(row.id);
                  }}
                  aria-expanded={expandedRows.includes(row.id)}
                  aria-label={`Expand row ${rowIndex + 1}`}
                >
                  {expandedRows.includes(row.id) ? "▼" : "▶"}
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {columns.map((column) => (
                <div key={column.name} className="flex flex-col">
                  <span className="text-sm font-medium">{column.label}</span>
                  <div>{getCellContent(row, column)}</div>
                </div>
              ))}
            </div>

            {expandable && expandedRows.includes(row.id) && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 pt-4 border-t"
                >
                  {renderExpandedRow?.(row)}
                </motion.div>
              </AnimatePresence>
            )}
          </Card>
        ))
      )}
    </div>
  );

  // Render list view
  const renderListView = () => (
    <div
      className={`
    ${
      listClassName
        ? listClassName
        : "grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4"
    }
    `}
    >
      {loading ? (
        <div className="text-center p-4" role="status">
          {loadingMessage}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center p-4">{noDataMessage}</div>
      ) : (
        data.map((row, rowIndex) => {
          // Use custom list item renderer if provided
          if (listItemRender) {
            return (
              <div
                key={rowIndex}
                className={`
                  
                  ${onRowClick ? "cursor-pointer hover:bg-base-100" : ""}
                  ${isSelected(row) ? "border-primary" : ""}
                  ${listItemClassName}
                `}
                style={{ minHeight: listItemHeight }}
                onClick={() => {
                  onRowClick?.(row, rowIndex);
                  if (selection !== "none") {
                    handleSelectRow(row);
                  }
                }}
              >
                {listItemRender(row, columns)}
              </div>
            );
          }

          // Default list item rendering
          return (
            <div
              key={rowIndex}
              className={`
                bg-white p-4 rounded-lg border border-base-300
                ${onRowClick ? "cursor-pointer hover:bg-base-100" : ""}
                ${isSelected(row) ? "border-primary" : ""}
                ${listItemClassName}
              `}
              style={{ minHeight: listItemHeight }}
              onClick={() => {
                onRowClick?.(row, rowIndex);
                if (selection !== "none") {
                  handleSelectRow(row);
                }
              }}
            >
              <div className="flex justify-between items-start mb-2">
                {selection !== "none" && (
                  <input
                    type={selection === "multiple" ? "checkbox" : "radio"}
                    className={selection === "multiple" ? "checkbox" : "radio"}
                    checked={isSelected(row)}
                    onChange={() => handleSelectRow(row)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select row ${rowIndex + 1}`}
                  />
                )}
                {expandable && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRowExpansion(row.id);
                    }}
                    aria-expanded={expandedRows.includes(row.id)}
                    aria-label={`Expand row ${rowIndex + 1}`}
                  >
                    {expandedRows.includes(row.id) ? "▼" : "▶"}
                  </Button>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {columns.map((column) => (
                  <div key={column.name} className="flex justify-between">
                    <span className="font-bold text-primary">
                      {column.label}:
                    </span>
                    <div>{getCellContent(row, column)}</div>
                  </div>
                ))}
              </div>

              {expandable && expandedRows.includes(row.id) && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 pt-4 border-t"
                  >
                    {renderExpandedRow?.(row)}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div
      className="overflow-x-auto"
      ref={tableRef}
      role="table"
      aria-label={title}
    >
        {showIconViews && (
          <div className="flex items-center gap-1 py-2 lg:p-4">
            <Button
              variant={viewMode === "table" ? "primary" : "ghost"}
              onClick={() => setViewMode("table")}
              aria-label="Table view"
              size="sm"
              icon={iconViewMode.table}
            />
            <Button
              variant={viewMode === "list" ? "primary" : "ghost"}
              onClick={() => setViewMode("list")}
              aria-label="List view"
              size="sm"
              icon={iconViewMode.list}
            />
          </div>
        )}

      {viewMode === "table"
        ? renderTableView()
        : viewMode === "card"
        ? renderListView()
        : renderListView()}

      {pagination && pagination.pages > 1 && (
        <Pagination
          totalPages={pagination.pages}
          currentPage={pagination.page}
          onPageChange={
            onPageChange ? onPageChange : (page: number) => console.error(page)
          }
          paginationUI={paginationUI}
        />
      )}
    </div>
  );
};

export default Table;
