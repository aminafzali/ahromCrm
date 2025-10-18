import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useSupportChat } from "../../../hooks/useSupportChat";
import { SupportChatRepository } from "../../../repo/SupportChatRepository";
import {
  SupportMessageWithRelations,
  SupportTicketWithRelations,
} from "../../../types";

// Constants
const MESSAGES_PAGE_LIMIT = 50;

// Types
interface MessageState {
  messages: SupportMessageWithRelations[];
  loading: boolean;
  sending: boolean;
  page: number;
  hasMore: boolean;
  autoScrollSignal: number;
}

interface TicketState {
  ticket: SupportTicketWithRelations | null;
  loading: boolean;
}

interface UseTicketDetailStateProps {
  ticketId: number;
  isAdmin: boolean;
  backUrl: string;
}

interface UseTicketDetailStateReturn {
  ticketState: TicketState;
  messageState: MessageState;
  loadTicket: () => Promise<SupportTicketWithRelations | undefined>;
  loadMessages: (ticketData: SupportTicketWithRelations) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  sendMessage: (messageBody: string) => Promise<void>;
  updateMessage: (
    messageId: number,
    updates: Partial<SupportMessageWithRelations>
  ) => void;
  assignTicket: (assignToId: number) => Promise<any>;
  updateTicketStatus: (status: string) => Promise<any>;
  editMessage: (messageId: number, text: string) => Promise<any>;
  deleteMessage: (messageId: number) => Promise<any>;
  handleBack: () => void;
}

// Custom Hook for Ticket Data Management
const useTicketData = (ticketId: number) => {
  const [ticketState, setTicketState] = useState<TicketState>({
    ticket: null,
    loading: true,
  });

  const loadTicket = useCallback(async () => {
    try {
      setTicketState((prev) => ({ ...prev, loading: true }));
      console.log("📥 [Ticket Detail] Loading ticket:", ticketId);

      const repo = new SupportChatRepository();
      const ticketData = await repo.getTicketById(ticketId);

      setTicketState({
        ticket: ticketData,
        loading: false,
      });

      console.log("✅ [Ticket Detail] Ticket loaded:", ticketData);
      return ticketData;
    } catch (error) {
      console.error("❌ [Ticket Detail] Error loading ticket:", error);
      setTicketState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  }, [ticketId]);

  return { ticketState, loadTicket };
};

// Custom Hook for Messages Management
const useMessages = (ticketId: number) => {
  const [messageState, setMessageState] = useState<MessageState>({
    messages: [],
    loading: false,
    sending: false,
    page: 1,
    hasMore: false,
    autoScrollSignal: 0,
  });

  const loadMessages = useCallback(
    async (ticketData: SupportTicketWithRelations) => {
      try {
        setMessageState((prev) => ({ ...prev, loading: true }));

        const repo = new SupportChatRepository();

        // Load latest messages using lastPage logic
        const headRes = await repo.getTicketMessages(ticketId, {
          page: 1,
          limit: 1,
        });

        const total = headRes?.total || 0;
        const lastPage = Math.max(1, Math.ceil(total / MESSAGES_PAGE_LIMIT));

        const latestRes = await repo.getTicketMessages(ticketId, {
          page: lastPage,
          limit: MESSAGES_PAGE_LIMIT,
        });

        setMessageState((prev) => ({
          ...prev,
          messages: latestRes?.data || [],
          page: lastPage,
          hasMore: lastPage > 1,
          autoScrollSignal: Date.now(),
          loading: false,
        }));
      } catch (error) {
        console.error("❌ [Ticket Detail] Error loading messages:", error);
        setMessageState((prev) => ({ ...prev, loading: false }));
        throw error;
      }
    },
    [ticketId]
  );

  const loadMoreMessages = useCallback(async () => {
    try {
      const nextPage = messageState.page - 1;
      if (nextPage < 1) {
        setMessageState((prev) => ({ ...prev, hasMore: false }));
        return;
      }

      const repo = new SupportChatRepository();
      const older = await repo.getTicketMessages(ticketId, {
        page: nextPage,
        limit: MESSAGES_PAGE_LIMIT,
      });

      if (older?.data?.length) {
        setMessageState((prev) => ({
          ...prev,
          messages: [...older.data, ...prev.messages],
          page: nextPage,
          hasMore: nextPage > 1,
        }));
      } else {
        setMessageState((prev) => ({ ...prev, hasMore: false }));
      }
    } catch (error) {
      console.error("❌ [Ticket Detail] Error loading older messages:", error);
    }
  }, [ticketId, messageState.page]);

  const sendMessage = useCallback(
    async (messageBody: string) => {
      if (!messageBody.trim()) return;

      try {
        setMessageState((prev) => ({ ...prev, sending: true }));
        console.log("📤 [Ticket Detail] Sending message...");

        const repo = new SupportChatRepository();
        const newMessage = await repo.sendMessage(ticketId, {
          body: messageBody,
        });

        setMessageState((prev) => ({
          ...prev,
          messages: [...prev.messages, newMessage],
          sending: false,
        }));

        console.log("✅ [Ticket Detail] Message sent");
      } catch (error) {
        console.error("❌ [Ticket Detail] Error sending message:", error);
        setMessageState((prev) => ({ ...prev, sending: false }));
        throw error;
      }
    },
    [ticketId]
  );

  const updateMessage = useCallback(
    (messageId: number, updates: Partial<SupportMessageWithRelations>) => {
      setMessageState((prev) => ({
        ...prev,
        messages: prev.messages.map((m) =>
          m.id === messageId ? { ...m, ...updates } : m
        ),
      }));
    },
    []
  );

  return {
    messageState,
    loadMessages,
    loadMoreMessages,
    sendMessage,
    updateMessage,
  };
};

// Custom Hook for Ticket Actions
const useTicketActions = (ticketId: number, isAdmin: boolean) => {
  const assignTicket = useCallback(
    async (assignToId: number) => {
      if (!isAdmin) return;

      try {
        console.log("👤 [Ticket Detail] Assigning ticket...");
        const repo = new SupportChatRepository();
        const updated = await repo.assignTicket(ticketId, assignToId);
        console.log("✅ [Ticket Detail] Ticket assigned");
        return updated;
      } catch (error) {
        console.error("❌ [Ticket Detail] Error assigning ticket:", error);
        throw error;
      }
    },
    [ticketId, isAdmin]
  );

  const updateTicketStatus = useCallback(
    async (status: string) => {
      if (!isAdmin) return;

      try {
        console.log("📝 [Ticket Detail] Changing status...");
        const repo = new SupportChatRepository();
        const updated = await repo.updateTicketStatus(ticketId, status as any);
        console.log("✅ [Ticket Detail] Status updated");
        return updated;
      } catch (error) {
        console.error("❌ [Ticket Detail] Error updating status:", error);
        throw error;
      }
    },
    [ticketId, isAdmin]
  );

  return { assignTicket, updateTicketStatus };
};

// Custom Hook for Message Actions
const useMessageActions = (ticketId: number) => {
  const editMessage = useCallback(
    async (messageId: number, text: string) => {
      try {
        const repo = new SupportChatRepository();
        const updated = await repo.editMessage(ticketId, messageId, {
          body: text,
        });
        return updated;
      } catch (error) {
        console.error("❌ [Support Chat Detail] Edit error:", error);
        throw error;
      }
    },
    [ticketId]
  );

  const deleteMessage = useCallback(
    async (messageId: number) => {
      try {
        const repo = new SupportChatRepository();
        await repo.deleteMessage(ticketId, messageId);
        return { isDeleted: true };
      } catch (error) {
        console.error("❌ [Support Chat Detail] Delete error:", error);
        throw error;
      }
    },
    [ticketId]
  );

  return { editMessage, deleteMessage };
};

// Main Hook
export const useTicketDetailState = ({
  ticketId,
  isAdmin,
  backUrl,
}: UseTicketDetailStateProps): UseTicketDetailStateReturn => {
  const router = useRouter();
  const { connect, disconnect, onMessageEdited, onMessageDeleted } =
    useSupportChat();

  // Custom hooks
  const { ticketState, loadTicket } = useTicketData(ticketId);
  const {
    messageState,
    loadMessages,
    loadMoreMessages,
    sendMessage,
    updateMessage,
  } = useMessages(ticketId);
  const { assignTicket, updateTicketStatus } = useTicketActions(
    ticketId,
    isAdmin
  );
  const { editMessage, deleteMessage } = useMessageActions(ticketId);

  // Navigation handler
  const handleBack = useCallback(() => {
    router.push(backUrl);
  }, [router, backUrl]);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        connect();
        const ticketData = await loadTicket();
        if (ticketData) {
          await loadMessages(ticketData);
        }
      } catch (error) {
        console.error("❌ [Ticket Detail] Initialization error:", error);
        alert("خطا در بارگذاری تیکت");
        router.push(backUrl);
      }
    };

    initializeData();

    return () => {
      disconnect();
    };
  }, [
    ticketId,
    connect,
    disconnect,
    loadTicket,
    loadMessages,
    router,
    backUrl,
  ]);

  // Event handlers for edit/delete
  useEffect(() => {
    const handleEditRequest = async (e: Event) => {
      try {
        const customEvent = e as CustomEvent;
        const { messageId, text } = customEvent.detail || {};
        if (!ticketId || !messageId) return;

        const updated = await editMessage(messageId, text);
        if (updated) {
          updateMessage(messageId, updated);
        }
      } catch (error) {
        console.error("❌ [Support Chat Detail] Edit error:", error);
      }
    };

    const handleDeleteRequest = async (e: Event) => {
      try {
        const customEvent = e as CustomEvent;
        const { messageId } = customEvent.detail || {};
        if (!ticketId || !messageId) return;

        const updated = await deleteMessage(messageId);
        if (updated) {
          updateMessage(messageId, updated);
        }
      } catch (error) {
        console.error("❌ [Support Chat Detail] Delete error:", error);
      }
    };

    window.addEventListener("support-chat:edit-request", handleEditRequest);
    window.addEventListener("support-chat:delete-request", handleDeleteRequest);

    return () => {
      window.removeEventListener(
        "support-chat:edit-request",
        handleEditRequest
      );
      window.removeEventListener(
        "support-chat:delete-request",
        handleDeleteRequest
      );
    };
  }, [ticketId, editMessage, deleteMessage, updateMessage]);

  // Realtime listeners
  useEffect(() => {
    const offEdited = onMessageEdited?.((data: any) => {
      if (data?.ticketId !== ticketId) return;
      updateMessage(data.messageId, {
        body: data.body,
        isEdited: true,
      });
    });

    const offDeleted = onMessageDeleted?.((data: any) => {
      if (data?.ticketId !== ticketId) return;
      updateMessage(data.messageId, {
        isDeleted: true,
      });
    });

    return () => {
      offEdited?.();
      offDeleted?.();
    };
  }, [ticketId, updateMessage, onMessageEdited, onMessageDeleted]);

  return {
    ticketState,
    messageState,
    loadTicket,
    loadMessages,
    loadMoreMessages,
    sendMessage,
    updateMessage,
    assignTicket,
    updateTicketStatus,
    editMessage,
    deleteMessage,
    handleBack,
  };
};
