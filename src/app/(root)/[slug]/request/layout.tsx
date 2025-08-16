import { ToastProvider, ToastContainer } from "ndui-ahrom";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="p-2 bg-base-100">
      <ToastProvider>
        {children}
        <ToastContainer position="top-center" />
      </ToastProvider>
    </div>
  );
}
