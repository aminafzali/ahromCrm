"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { format } from "date-fns-jalali";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AssignTicketModal from "../../components/AssignTicketModal";
import ChangeStatusModal from "../../components/ChangeStatusModal";
import { useTickets } from "../../hooks/useTickets";

export default function TicketDetailPage() {
  const params = useParams() as { id?: string } | null;
  const id = Number(params?.id);
  const router = useRouter();
  const { getById, loading, error } = useTickets();
  const [ticket, setTicket] = useState<any | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    if (id) load();
  }, [id]);

  const load = async () => {
    const data = await getById(id);
    if (data) setTicket(data);
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      // Call API directly
      const response = await fetch(`/api/tickets/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await load(); // Reload ticket data
        setShowStatusModal(false);
      }
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  const handleAssign = async (agentId: number) => {
    try {
      // Call API directly
      const response = await fetch(`/api/tickets/${id}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId: agentId }),
      });

      if (response.ok) {
        await load(); // Reload ticket data
        setShowAssignModal(false);
      }
    } catch (error) {
      console.error("Error assigning ticket:", error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      OPEN: "bg-yellow-100 text-yellow-800 border-yellow-200",
      IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
      PENDING: "bg-orange-100 text-orange-800 border-orange-200",
      RESOLVED: "bg-green-100 text-green-800 border-green-200",
      CLOSED: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status as keyof typeof colors] || colors.OPEN;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      OPEN: "باز",
      IN_PROGRESS: "در حال بررسی",
      PENDING: "در انتظار",
      RESOLVED: "حل شده",
      CLOSED: "بسته شده",
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: "bg-green-100 text-green-800 border-green-200",
      MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
      HIGH: "bg-orange-100 text-orange-800 border-orange-200",
      URGENT: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[priority as keyof typeof colors] || colors.MEDIUM;
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      LOW: "پایین",
      MEDIUM: "متوسط",
      HIGH: "بالا",
      URGENT: "فوری",
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  if (!id) return <NotFound />;
  if (loading) return <Loading />;
  if (error && error.includes("404")) return <NotFound />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <DIcon icon="fa-arrow-right" classCustom="text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    جزئیات تیکت #{ticket?.ticketNumber}
                  </h1>
                  <p className="text-gray-600 mt-1">{ticket?.subject}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <DIcon icon="fa-edit" classCustom="text-sm" />
                  تغییر وضعیت
                </button>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <DIcon icon="fa-user-plus" classCustom="text-sm" />
                  تخصیص تیکت
                </button>
              </div>
            </div>
          </div>

          {/* Ticket Info Cards */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Status Card */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DIcon icon="fa-ticket-alt" classCustom="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">وضعیت</p>
                    <p
                      className={`text-sm font-medium px-2 py-1 rounded-full border ${getStatusColor(
                        ticket?.status
                      )}`}
                    >
                      {getStatusLabel(ticket?.status)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Priority Card */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <DIcon
                      icon="fa-exclamation-triangle"
                      classCustom="text-orange-600"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">اولویت</p>
                    <p
                      className={`text-sm font-medium px-2 py-1 rounded-full border ${getPriorityColor(
                        ticket?.priority
                      )}`}
                    >
                      {getPriorityLabel(ticket?.priority)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Card */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DIcon icon="fa-user" classCustom="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">مشتری</p>
                    <p className="text-sm font-medium text-gray-900">
                      {ticket?.workspaceUser?.displayName ||
                        ticket?.guestUser?.name ||
                        "کاربر ناشناس"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assignee Card */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <DIcon icon="fa-user-tie" classCustom="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">تخصیص یافته به</p>
                    <p className="text-sm font-medium text-gray-900">
                      {ticket?.assignedTo?.displayName || "تخصیص نیافته"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  توضیحات تیکت
                </h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {ticket?.description || "توضیحاتی ارائه نشده است"}
                </p>
              </div>
            </div>

            {/* TODO: Chat Section - آینده اینجا چت اضافه خواهد شد */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">گفتگو</h2>
                <p className="text-sm text-gray-600 mt-1">
                  بخش چت در آینده اینجا اضافه خواهد شد
                </p>
              </div>
              <div className="p-6">
                <div className="text-center py-12 text-gray-500">
                  <DIcon icon="fa-comments" classCustom="text-4xl mb-4" />
                  <p>بخش چت در حال توسعه است</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  اطلاعات تیکت
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600">شماره تیکت</p>
                  <p className="text-sm font-medium text-gray-900">
                    #{ticket?.ticketNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">دسته‌بندی</p>
                  <p className="text-sm font-medium text-gray-900">
                    {ticket?.category?.name || "دسته‌بندی نشده"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ایمیل مشتری</p>
                  <p className="text-sm font-medium text-gray-900">
                    {ticket?.workspaceUser?.user?.email ||
                      ticket?.guestUser?.email ||
                      "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">تاریخ ایجاد</p>
                  <p className="text-sm font-medium text-gray-900">
                    {ticket?.createdAt
                      ? format(new Date(ticket.createdAt), "yyyy/MM/dd - HH:mm")
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">آخرین بروزرسانی</p>
                  <p className="text-sm font-medium text-gray-900">
                    {ticket?.updatedAt
                      ? format(new Date(ticket.updatedAt), "yyyy/MM/dd - HH:mm")
                      : "-"}
                  </p>
                </div>
                {ticket?.closedAt && (
                  <div>
                    <p className="text-sm text-gray-600">تاریخ بسته شدن</p>
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(ticket.closedAt), "yyyy/MM/dd - HH:mm")}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">تعداد پیام‌ها</p>
                  <p className="text-sm font-medium text-gray-900">
                    {ticket?._count?.messages || 0} پیام
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  عملیات سریع
                </h3>
              </div>
              <div className="p-6 space-y-3">
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <DIcon icon="fa-edit" classCustom="text-sm" />
                  تغییر وضعیت
                </button>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <DIcon icon="fa-user-plus" classCustom="text-sm" />
                  تخصیص تیکت
                </button>
                <button
                  onClick={() => router.push(`/dashboard/tickets/${id}/edit`)}
                  className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                >
                  <DIcon icon="fa-edit" classCustom="text-sm" />
                  ویرایش تیکت
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAssignModal && (
        <AssignTicketModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssign}
          ticketId={id}
        />
      )}

      {showStatusModal && (
        <ChangeStatusModal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          onStatusChange={handleStatusChange}
          currentStatus={ticket?.status}
          ticketId={id}
        />
      )}
    </div>
  );
}
