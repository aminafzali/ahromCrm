"use client";

import Select3 from "@/@Client/Components/ui/Select3";
import { SupportPriority, SupportTicketStatus } from "@prisma/client";

interface TicketFiltersProps {
  filters: {
    status?: SupportTicketStatus;
    priority?: SupportPriority;
    assignedToId?: number;
    categoryId?: number;
  };
  onChange: (filters: any) => void;
  categories?: Array<{ id: number; name: string }>;
  agents?: Array<{ id: number; displayName: string }>;
}

export default function TicketFilters({
  filters,
  onChange,
  categories = [],
  agents = [],
}: TicketFiltersProps) {
  const handleFilterChange = (field: string, value: string) => {
    onChange({
      ...filters,
      [field]: value === "all" ? undefined : value,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Filter */}
        <Select3
          name="status"
          label="وضعیت"
          value={filters.status || "all"}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          options={[
            { value: "all", label: "همه" },
            { value: "OPEN", label: "باز" },
            { value: "PENDING", label: "در انتظار" },
            { value: "IN_PROGRESS", label: "در حال بررسی" },
            { value: "WAITING_CUSTOMER", label: "منتظر پاسخ مشتری" },
            { value: "RESOLVED", label: "حل شده" },
            { value: "CLOSED", label: "بسته شده" },
          ]}
        />

        {/* Priority Filter */}
        <Select3
          name="priority"
          label="اولویت"
          value={filters.priority || "all"}
          onChange={(e) => handleFilterChange("priority", e.target.value)}
          options={[
            { value: "all", label: "همه" },
            { value: "LOW", label: "کم" },
            { value: "MEDIUM", label: "متوسط" },
            { value: "HIGH", label: "زیاد" },
            { value: "CRITICAL", label: "بحرانی" },
          ]}
        />

        {/* Assignee Filter */}
        <Select3
          name="assignedToId"
          label="تخصیص به"
          value={filters.assignedToId?.toString() || "all"}
          onChange={(e) => handleFilterChange("assignedToId", e.target.value)}
          options={[
            { value: "all", label: "همه" },
            ...agents.map((agent) => ({
              value: agent.id.toString(),
              label: agent.displayName,
            })),
          ]}
        />

        {/* Category Filter */}
        {categories.length > 0 && (
          <Select3
            name="categoryId"
            label="دسته‌بندی"
            value={filters.categoryId?.toString() || "all"}
            onChange={(e) => handleFilterChange("categoryId", e.target.value)}
            options={[
              { value: "all", label: "همه" },
              ...categories.map((cat) => ({
                value: cat.id.toString(),
                label: cat.name,
              })),
            ]}
          />
        )}
      </div>
    </div>
  );
}
