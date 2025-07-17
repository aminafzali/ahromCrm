// مسیر فایل: src/app/(manage)/layout.tsx

"use client";

import  AuthProvider  from "@/providers/AuthProvider";
import { ToastContainer, ToastProvider } from "ndui-ahrom";

/**
 * این Layout ساده، برای صفحات مدیریت کلی مانند ساخت ورک‌اسپیس استفاده می‌شود
 * و فاقد سایدبار و هدر پیچیده داشبورد است.
 */
export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ToastProvider>
        <main className="bg-light min-vh-100 d-flex flex-column">
          <div className="container-fluid flex-grow-1 d-flex flex-column justify-content-center align-items-center">
            {children}
          </div>
        </main>
        <ToastContainer position="top-center" />
      </ToastProvider>
    </AuthProvider>
  );
}
