"use client";

import TicketDetailWrapper from "./TicketDetailWrapper";

// Types
interface TicketDetailPageProps {
  id: number;
  backUrl?: string;
  isAdmin?: boolean;
}

// Main Page Component - Simple wrapper that delegates to TicketDetailWrapper
export default function TicketDetailPage({
  id,
  backUrl = "/dashboard/support-chat",
  isAdmin = false,
}: TicketDetailPageProps) {
  return <TicketDetailWrapper id={id} backUrl={backUrl} isAdmin={isAdmin} />;
}
