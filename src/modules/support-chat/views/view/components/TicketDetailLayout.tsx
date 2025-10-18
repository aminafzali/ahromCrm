import React from "react";
import TicketChatWindow from "../../../components/layout/TicketChatWindow";
import TicketDetailPanel from "../../../components/tickets/TicketDetailPanel";
import {
    SupportMessageWithRelations,
    SupportTicketWithRelations,
} from "../../../types";

interface TicketDetailLayoutProps {
  ticket: SupportTicketWithRelations;
  messages: SupportMessageWithRelations[];
  onSendMessage: (messageBody: string) => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
  hasMore: boolean;
  onLoadMore: () => Promise<void>;
  autoScrollSignal: number;
  onAssign: (assignToId: number) => Promise<void>;
  onChangeStatus: (status: string) => Promise<void>;
  onClose: () => void;
}

export const TicketDetailLayout: React.FC<TicketDetailLayoutProps> = ({
  ticket,
  messages,
  onSendMessage,
  loading,
  isAdmin,
  hasMore,
  onLoadMore,
  autoScrollSignal,
  onAssign,
  onChangeStatus,
  onClose,
}) => {
  return (
    <div className="h-screen flex bg-gray-50">
      {/* Chat Window */}
      <div className="flex-1">
        <TicketChatWindow
          ticket={ticket}
          messages={messages}
          onSendMessage={onSendMessage}
          loading={loading}
          isAgent={isAdmin}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          autoScrollSignal={autoScrollSignal}
        />
      </div>

      {/* Detail Panel (Only for Admin) */}
      {isAdmin && (
        <div className="w-96 border-l">
          <TicketDetailPanel
            ticket={ticket}
            onAssign={onAssign}
            onChangeStatus={onChangeStatus}
            onClose={onClose}
          />
        </div>
      )}
    </div>
  );
};

export default TicketDetailLayout;
