"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { Button } from "ndui-ahrom";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PriorityBadge from "../components/ui/PriorityBadge";
import StatusBadge from "../components/ui/StatusBadge";
import { useSupportChat } from "../hooks/useSupportChat";
import { SupportTicketWithRelations } from "../types";

export default function CustomerView() {
  const router = useRouter();
  const { repo } = useSupportChat();
  const [tickets, setTickets] = useState<SupportTicketWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");

  useEffect(() => {
    loadMyTickets();
  }, [filter]);

  const loadMyTickets = async () => {
    console.log("🔄 [Customer View] Loading my tickets...", { filter });
    setLoading(true);
    try {
      const params: any = { page: 1, limit: 100 };
      if (filter === "open") {
        params.status = "OPEN,IN_PROGRESS,WAITING_CUSTOMER,PENDING";
      } else if (filter === "closed") {
        params.status = "RESOLVED,CLOSED";
      }

      console.log("📡 [Customer View] Fetching tickets with params:", params);
      const response = await repo.getMyTickets(params);
      console.log(
        "✅ [Customer View] Tickets loaded:",
        response?.data?.length || 0
      );
      setTickets(response?.data || []);
    } catch (error) {
      console.error("❌ [Customer View] Error loading tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = (ticketId: number) => {
    console.log("🎫 [Customer View] Viewing ticket:", ticketId);
    router.push(`/dashboard/support-chat/${ticketId}`);
  };

  const handleCreateTicket = () => {
    console.log("➕ [Customer View] Creating new ticket");
    router.push("/dashboard/support-chat/create");
  };

  const getFilteredCount = (filterType: "all" | "open" | "closed") => {
    if (filterType === "all") return tickets.length;
    if (filterType === "open") {
      return tickets.filter((t) =>
        ["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "PENDING"].includes(
          t.status
        )
      ).length;
    }
    return tickets.filter((t) => ["RESOLVED", "CLOSED"].includes(t.status))
      .length;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <DIcon icon="fa-headset" classCustom="text-3xl text-primary" />
          <div>
            <h1 className="text-2xl font-bold">پشتیبانی</h1>
            <p className="text-sm text-gray-500">تیکت‌های پشتیبانی شما</p>
          </div>
        </div>
        <Button
          variant="primary"
          icon={<DIcon icon="fa-plus" classCustom="ml-2" />}
          onClick={handleCreateTicket}
        >
          تیکت جدید
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={filter === "all" ? "primary" : "ghost"}
          onClick={() => setFilter("all")}
          size="sm"
        >
          همه ({getFilteredCount("all")})
        </Button>
        <Button
          variant={filter === "open" ? "primary" : "ghost"}
          onClick={() => setFilter("open")}
          size="sm"
        >
          باز ({getFilteredCount("open")})
        </Button>
        <Button
          variant={filter === "closed" ? "primary" : "ghost"}
          onClick={() => setFilter("closed")}
          size="sm"
        >
          بسته شده ({getFilteredCount("closed")})
        </Button>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <DIcon
            icon="fa-spinner"
            classCustom="text-4xl text-primary animate-spin"
          />
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 p-12 text-center">
          <DIcon
            icon="fa-ticket-alt"
            classCustom="text-6xl text-gray-300 mb-4"
          />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            تیکتی یافت نشد
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {filter === "all"
              ? "شما هنوز تیکتی ایجاد نکرده‌اید"
              : `تیکت ${filter === "open" ? "بازی" : "بسته شده‌ای"} یافت نشد`}
          </p>
          <Button
            variant="primary"
            icon={<DIcon icon="fa-plus" classCustom="ml-2" />}
            onClick={handleCreateTicket}
          >
            ایجاد اولین تیکت
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => handleViewTicket(ticket.id)}
              className="bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 p-4 hover:shadow-md transition-all cursor-pointer hover:border-primary"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                      #{ticket.ticketNumber}
                    </span>
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                    {ticket.subject}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {ticket.description}
                  </p>
                </div>
                <DIcon
                  icon="fa-chevron-left"
                  classCustom="text-gray-400 mt-1 mr-2"
                />
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 mt-3 pt-3 border-t dark:border-slate-700 flex-wrap">
                <div className="flex items-center gap-1">
                  <DIcon icon="fa-clock" classCustom="text-gray-400" />
                  <span>
                    {new Date(ticket.createdAt).toLocaleDateString("fa-IR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {ticket.category && (
                  <div className="flex items-center gap-1">
                    <DIcon icon="fa-folder" classCustom="text-gray-400" />
                    <span>{ticket.category.name}</span>
                  </div>
                )}
                {ticket.assignedTo && (
                  <div className="flex items-center gap-1">
                    <DIcon icon="fa-user-check" classCustom="text-green-500" />
                    <span>تخصیص داده شده</span>
                  </div>
                )}
                {ticket.messages && ticket.messages.length > 0 && (
                  <div className="flex items-center gap-1">
                    <DIcon icon="fa-comments" classCustom="text-blue-500" />
                    <span>{ticket.messages.length} پیام</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
