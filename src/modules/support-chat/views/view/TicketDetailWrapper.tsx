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
      onClose={handleBack}
    />
  );
}
