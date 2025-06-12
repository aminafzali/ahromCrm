import type { Metadata } from "next";

import I18nProvider from "@/@Client/Components/I18nProvider";
import AuthProvider from "@/providers/AuthProvider";
import "../../public/styles/all.min.css";
import "../../public/styles/globals.css";
import "../../public/styles/pro.css";
import "./custom.css";

export const metadata: Metadata = {
  title: "سامانه خدمات",
  description: "سامانه درخواست و پیگیری خدمات",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" data-theme="light">
      <body className={` bg-base-100 antialiased`}>
        <I18nProvider>
          <AuthProvider>{children}</AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
