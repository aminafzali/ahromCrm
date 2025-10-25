// مسیر فایل: src/app/layout.tsx

import { ToastContainer, ToastProvider } from "ndui-ahrom";
import { Suspense } from "react"; // اضافه شده

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ToastProvider>
      <div className="">
        {/* اضافه شده: حل مشکل useSearchParams در زمان Pre-rendering */}
        <Suspense fallback={<div>در حال بارگذاری...</div>}>{children}</Suspense>
      </div>
      <ToastContainer position="top-center" />
    </ToastProvider>
  );
}
