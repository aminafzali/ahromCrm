// ------------------------------------------------------------------
// File: src/app/workspaces/layout.tsx (CLIENT)
// ------------------------------------------------------------------
"use client";

import { WorkspaceProvider } from "@/@Client/context/WorkspaceProvider";
import AuthProvider from "@/providers/AuthProvider";
import { ToastContainer, ToastProvider } from "ndui-ahrom";
import React from "react";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ToastProvider>
        <WorkspaceProvider>
          <main className="bg-light min-vh-100 d-flex flex-column justify-content-center align-items-center p-4">
            {children}
          </main>
          <ToastContainer position="top-center" />
        </WorkspaceProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
// // مسیر فایل: src/app/workspaces/layout.tsx

// //"use client";

// import { WorkspaceProvider } from "@/@Client/context/WorkspaceProvider";
// import  AuthProvider  from "@/providers/AuthProvider";
// import { ToastContainer, ToastProvider } from "ndui-ahrom";

// export default function WorkspaceLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <AuthProvider>
//       <ToastProvider>
//         <WorkspaceProvider>
//           <main className="bg-light min-vh-100 d-flex flex-column justify-content-center align-items-center p-4">
//             {children}
//           </main>
//           <ToastContainer position="top-center" />
//         </WorkspaceProvider>
//       </ToastProvider>
//     </AuthProvider>
//   );
// }
