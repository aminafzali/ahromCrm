// File: src/app/(root)/layout.tsx
import React from "react";


export default function RootLayout({
children,
}: {
children: React.ReactNode;
}) {
return (
<div className="">
{/* main container: حداکثر عرض و padding مناسب */}
<main className="">{children}</main>
</div>
);
}