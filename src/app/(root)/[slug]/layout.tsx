// مسیر فایل: src/app/[slug]/layout.tsx

"use client";

import { WorkspaceProvider } from "@/@Client/context/WorkspaceProvider";
import BaseToolBar from "@/components/home/BaseToolBar";
import Footer from "@/components/home/Footer";
import dynamic from "next/dynamic";

// SupportChatWidget removed - support-chat module deleted

export default function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  return (
    <WorkspaceProvider>
      <div className="flex flex-col min-h-screen bg-base-100">
        <BaseToolBar />
        <main className="flex-grow container mx-auto px-2">{children}</main>
        <Footer />
        {/* SupportChatWidget removed */}
      </div>
    </WorkspaceProvider>
  );
}
