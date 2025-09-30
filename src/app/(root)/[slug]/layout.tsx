// مسیر فایل: src/app/[slug]/layout.tsx

"use client";

import BaseToolBar from "@/components/home/BaseToolBar";
import Footer from "@/components/home/Footer";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-base-100">
      <BaseToolBar />
      <main className="flex-grow container mx-auto px-2">{children}</main>
      <Footer />
    </div>
  );
}
