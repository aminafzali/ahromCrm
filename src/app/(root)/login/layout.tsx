import { ToastProvider, ToastContainer } from "ndui-ahrom";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <ToastProvider>
        {children}
        <ToastContainer position="top-center" />
      </ToastProvider>
  );
}
