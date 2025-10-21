"use client";

import { Button, Select } from "ndui-ahrom";
import { TicketFilters } from "../types";

interface TicketFiltersProps {
  filters: TicketFilters;
  onFiltersChange: (filters: TicketFilters) => void;
  onClearFilters: () => void;
}

export default function TicketFiltersComponent({
  filters,
  onFiltersChange,
  onClearFilters,
}: TicketFiltersProps) {
  const handleFilterChange = (name: string, value: string) => {
    onFiltersChange({
      ...filters,
      [name]: value === "all" ? undefined : value,
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">فیلترها</h3>
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          پاک کردن فیلترها
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          name="status"
          label="وضعیت"
          value={filters.status || "all"}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          options={[
            { value: "all", label: "همه" },
            { value: "OPEN", label: "باز" },
            { value: "IN_PROGRESS", label: "در حال پیگیری" },
            { value: "PENDING", label: "در انتظار" },
            { value: "RESOLVED", label: "حل شده" },
            { value: "CLOSED", label: "بسته" },
          ]}
        />

        <Select
          name="priority"
          label="اولویت"
          value={filters.priority || "all"}
          onChange={(e) => handleFilterChange("priority", e.target.value)}
          options={[
            { value: "all", label: "همه" },
            { value: "LOW", label: "کم" },
            { value: "MEDIUM", label: "متوسط" },
            { value: "HIGH", label: "زیاد" },
            { value: "URGENT", label: "فوری" },
          ]}
        />

        <Select
          name="assignedToId"
          label="تخصیص یافته به"
          value={filters.assignedToId || "all"}
          onChange={(e) => handleFilterChange("assignedToId", e.target.value)}
          options={[
            { value: "all", label: "همه" },
            { value: "unassigned", label: "تخصیص نیافته" },
          ]}
        />
      </div>
    </div>
  );
}
