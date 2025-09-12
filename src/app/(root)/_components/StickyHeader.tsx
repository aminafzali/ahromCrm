"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function StickyHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all backdrop-blur-md bg-white/60 shadow-sm ${
        scrolled ? "backdrop-blur-md bg-white/60 shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          {/* اگر لوگو در public هست از Image استفاده کن */}
          {/* <div className="w-8 h-8 relative">
            <Image
              src="/ahrom.png"
              alt="ahrom"
              fill
              style={{ objectFit: "contain" }}
            />
          </div> */}
          <span className="font-semibold text-slate-900">فناوری اهرم</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/about" className="hover:text-teal-600 transition">
            درباره ما
          </Link>
          <Link href="/products" className="hover:text-teal-600 transition">
            محصولات
          </Link>
          <Link href="/pricing" className="hover:text-teal-600 transition">
            تعرفه‌ها
          </Link>
          <Link href="/blog" className="hover:text-teal-600 transition">
            بلاگ
          </Link>
          <Link href="/contact" className="hover:text-teal-600 transition">
            تماس با ما
          </Link>
        </nav>

        <div className="flex items-center gap-3"></div>
      </div>
    </header>
  );
}
