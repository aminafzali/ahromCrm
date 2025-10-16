"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { TabsWrapper } from "@/@Client/Components/wrappers";
import { useMemo } from "react";
import CustomerView from "./CustomerView";
import SupportChatTab from "./SupportChatTab";
import TicketTableTab from "./TicketTableTab";

interface SupportChatIndexPageProps {
  isAdmin?: boolean;
}

export default function SupportChatIndexPage({
  isAdmin = false,
}: SupportChatIndexPageProps) {
  console.log("🔄 [Support Chat Page] Initializing... isAdmin:", isAdmin);

  const chatTabContent = useMemo(() => <SupportChatTab />, []);
  const tableTabContent = useMemo(() => <TicketTableTab />, []);

  // If user is not admin, show customer view
  if (!isAdmin) {
    return <CustomerView />;
  }

  // If user is admin, show admin view with tabs
  return (
    <div className="h-full">
      <div className="mb-4 flex items-center gap-3">
        <DIcon icon="fa-headset" classCustom="text-3xl text-blue-500" />
        <h1 className="text-2xl font-bold">سیستم پشتیبانی مشتریان</h1>
      </div>

      <TabsWrapper
        tabs={[
          {
            id: "chat",
            label: "پشتیبانی",
            content: chatTabContent,
          },
          {
            id: "table",
            label: "لیست تیکت‌ها",
            content: tableTabContent,
          },
        ]}
        defaultTabId="chat"
      />
    </div>
  );
}
