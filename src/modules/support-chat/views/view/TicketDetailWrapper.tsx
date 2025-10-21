"use client";

import { useCallback } from "react";
import ErrorState from "./components/ErrorState";
import LoadingSpinner from "./components/LoadingSpinner";
import TicketDetailLayout from "./components/TicketDetailLayout";
import { useTicketDetailState } from "./hooks/useTicketDetailState";

// Constants
const DEFAULT_BACK_URL = "/dashboard/support-chat";

// Types
interface TicketDetailWrapperProps {
  id: number;
  backUrl?: string;
  isAdmin?: boolean;
}

// Main Wrapper Component
export default function TicketDetailWrapper({
  id,
  backUrl = DEFAULT_BACK_URL,
  isAdmin = false,
}: TicketDetailWrapperProps) {
  // Use the custom hook for state management
  const {
    ticketState,
    messageState,
    sendMessage,
    loadMoreMessages,
    assignTicket,
    updateTicketStatus,
    editMessage,
    deleteMessage,
    handleBack,
  } = useTicketDetailState({
    ticketId: id,
    isAdmin,
    backUrl,
  });

  // Handlers
  const handleSendMessage = useCallback(
    async (messageBody: string) => {
      try {
        await sendMessage(messageBody);
      } catch (error) {
        alert("خطا در ارسال پیام");
      }
    },
    [sendMessage]
  );

  const handleAssign = useCallback(
    async (assignToId: number) => {
      try {
        const updated = await assignTicket(assignToId);
        if (updated) {
          console.log("✅ [Ticket Detail] Ticket assigned successfully");
        }
      } catch (error) {
        alert("خطا در تخصیص تیکت");
      }
    },
    [assignTicket]
  );

  const handleStatusChange = useCallback(
    async (status: string) => {
      try {
        const updated = await updateTicketStatus(status);
        if (updated) {
          console.log("✅ [Ticket Detail] Status updated successfully");
        }
      } catch (error) {
        alert("خطا در تغییر وضعیت");
      }
    },
    [updateTicketStatus]
  );

  const handleReply = useCallback((message: any) => {
    console.log("Reply to message:", message);
    // Implement reply functionality
  }, []);

  const handleEdit = useCallback(
    async (message: any) => {
      try {
        const newText = prompt("ویرایش پیام:", message.body);
        if (newText && newText !== message.body) {
          await editMessage(message.id, newText);
          console.log("✅ [Ticket Detail] Message edited successfully");
        }
      } catch (error) {
        alert("خطا در ویرایش پیام");
      }
    },
    [editMessage]
  );

  const handleDelete = useCallback(
    async (message: any) => {
      try {
        if (confirm("آیا مطمئن هستید که می‌خواهید این پیام را حذف کنید؟")) {
          await deleteMessage(message.id);
          console.log("✅ [Ticket Detail] Message deleted successfully");
        }
      } catch (error) {
        alert("خطا در حذف پیام");
      }
    },
    [deleteMessage]
  );

  // Render states
  if (ticketState.loading) {
    return <LoadingSpinner />;
  }

  if (!ticketState.ticket) {
    return <ErrorState onBack={handleBack} />;
  }

  return (
    <TicketDetailLayout
      ticket={ticketState.ticket}
      messages={messageState.messages}
      onSendMessage={handleSendMessage}
      loading={messageState.sending}
      isAdmin={isAdmin}
      hasMore={messageState.hasMore}
      onLoadMore={loadMoreMessages}
      autoScrollSignal={messageState.autoScrollSignal}
      onAssign={handleAssign}
      onChangeStatus={handleStatusChange}
      onReply={handleReply}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onClose={handleBack}
    />
  );
}
