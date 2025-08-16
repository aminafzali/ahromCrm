"use client";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-base-100">
      {/* <BaseToolBar />  */}

      <main
      // className="flex-grow container mx-auto px-2"
      >
        {children}
      </main>

      {/* <Footer /> */}
    </div>
  );
}
