// مسیر فایل: src/app/(manage)/layout.tsx (نسخه ساده برای دیباغ)

"use client";
import AuthProvider from "@/providers/AuthProvider";

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("--- DEBUG: (manage) layout is rendering ---");
  return (
    <AuthProvider>
      <main className="bg-light min-vh-100 d-flex flex-column">{children}</main>
    </AuthProvider>
  );
}
