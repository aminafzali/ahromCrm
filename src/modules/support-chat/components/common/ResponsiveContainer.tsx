"use client";

import { ReactNode } from "react";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  mobile?: string;
  tablet?: string;
  desktop?: string;
}

export default function ResponsiveContainer({
  children,
  className = "",
  mobile = "w-full",
  tablet = "sm:w-full",
  desktop = "lg:w-full",
}: ResponsiveContainerProps) {
  const responsiveClasses =
    `${mobile} ${tablet} ${desktop} ${className}`.trim();

  return <div className={responsiveClasses}>{children}</div>;
}
