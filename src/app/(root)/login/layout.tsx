import { ToastContainer, ToastProvider } from "ndui-ahrom";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ToastProvider>
      <div className="">{children}</div>
      <ToastContainer position="top-center" />
    </ToastProvider>
  );
}
