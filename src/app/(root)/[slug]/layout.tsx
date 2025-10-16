// مسیر فایل: src/app/[slug]/layout.tsx

"use client";

import BaseToolBar from "@/components/home/BaseToolBar";
import Footer from "@/components/home/Footer";
import dynamic from "next/dynamic";

const SupportChatWidget = dynamic(
  () => import("@/modules/support-chat/public/SupportChatWidget"),
  { ssr: false }
);

export default function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  return (
    <div className="flex flex-col min-h-screen bg-base-100">
      <BaseToolBar />
      <main className="flex-grow container mx-auto px-2">{children}</main>
      <Footer />
      <SupportChatWidget workspaceSlug={params.slug} />
    </div>
  );
}
