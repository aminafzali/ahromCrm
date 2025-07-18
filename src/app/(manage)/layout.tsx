// مسیر فایل: src/app/(manage)/layout.tsx
"use client";
import { WorkspaceProvider } from "@/@Client/context/WorkspaceProvider";
import AuthProvider from "@/providers/AuthProvider";
import { ToastContainer, ToastProvider } from "ndui-ahrom";

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ToastProvider>
        <WorkspaceProvider>
          <main className="bg-light min-vh-100 d-flex flex-column">
            <div className="container-fluid flex-grow-1 d-flex flex-column justify-content-center align-items-center p-4">
              {children}
            </div>
          </main>
          <ToastContainer position="top-center" />
        </WorkspaceProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
