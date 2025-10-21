"use client";

import { useState } from "react";
import {
  TicketFilters as TicketFiltersType,
  TicketWithRelations,
} from "../types";
import TicketCard from "./TicketCard";
import TicketFilters from "./TicketFilters";
import TicketStats from "./TicketStats";

interface TicketListProps {
  tickets: TicketWithRelations[];
  loading?: boolean;
  onStatusChange?: (ticketId: number, status: string) => void;
  onAssign?: (ticketId: number, agentId: number) => void;
  onFiltersChange?: (filters: TicketFiltersType) => void;
  filters?: TicketFiltersType;
}

export default function TicketList({
  tickets,
  loading = false,
  onStatusChange,
  onAssign,
  onFiltersChange,
  filters = {},
}: TicketListProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleClearFilters = () => {
    if (onFiltersChange) {
      onFiltersChange({});
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TicketStats tickets={tickets} />

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">تیکت‌ها ({tickets.length})</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          {showFilters ? "مخفی کردن فیلترها" : "نمایش فیلترها"}
        </button>
      </div>

      {showFilters && onFiltersChange && (
        <TicketFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClearFilters={handleClearFilters}
        />
      )}

      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">هیچ تیکتی یافت نشد</div>
          <p className="text-gray-400 text-sm mt-2">
            تیکت‌های جدید در اینجا نمایش داده می‌شوند
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onStatusChange={onStatusChange}
              onAssign={onAssign}
            />
          ))}
        </div>
      )}
    </div>
  );
}
