"use client";

import { TicketWithRelations } from "../types";

interface TicketStatsProps {
  tickets: TicketWithRelations[];
}

export default function TicketStats({ tickets }: TicketStatsProps) {
  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    pending: tickets.filter((t) => t.status === "PENDING").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
    closed: tickets.filter((t) => t.status === "CLOSED").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "text-blue-600 bg-blue-100";
      case "IN_PROGRESS":
        return "text-purple-600 bg-purple-100";
      case "PENDING":
        return "text-yellow-600 bg-yellow-100";
      case "RESOLVED":
        return "text-green-600 bg-green-100";
      case "CLOSED":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        <div className="text-sm text-gray-600">کل تیکت‌ها</div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className={`text-2xl font-bold ${getStatusColor("OPEN")}`}>
          {stats.open}
        </div>
        <div className="text-sm text-gray-600">باز</div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className={`text-2xl font-bold ${getStatusColor("IN_PROGRESS")}`}>
          {stats.inProgress}
        </div>
        <div className="text-sm text-gray-600">در حال پیگیری</div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className={`text-2xl font-bold ${getStatusColor("PENDING")}`}>
          {stats.pending}
        </div>
        <div className="text-sm text-gray-600">در انتظار</div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className={`text-2xl font-bold ${getStatusColor("RESOLVED")}`}>
          {stats.resolved}
        </div>
        <div className="text-sm text-gray-600">حل شده</div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className={`text-2xl font-bold ${getStatusColor("CLOSED")}`}>
          {stats.closed}
        </div>
        <div className="text-sm text-gray-600">بسته</div>
      </div>
    </div>
  );
}
