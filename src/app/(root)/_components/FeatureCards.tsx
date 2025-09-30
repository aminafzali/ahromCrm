"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import React, { RefObject, useEffect, useRef, useState } from "react";

/**
 * FeatureCards: 7 کارت با چارت خطی مینیمال و tooltip پویا
 */

const features = [
  {
    icon: "fa-tasks",
    title: "درخواست‌ها",
    desc: "پیگیری و مدیریت کامل چرخه درخواست‌ها.",
  },
  {
    icon: "fa-cogs",
    title: "کاتالوگ",
    desc: "مدیریت محصولات و خدمات به‌صورت حرفه‌ای.",
  },
  {
    icon: "fa-users",
    title: "مشتریان",
    desc: "پروفایل و تاریخچه تعاملات مشتری.",
  },
  {
    icon: "fa-file-invoice-dollar",
    title: "فاکتورها",
    desc: "صدور و پیگیری فاکتورها و پرداخت‌ها.",
  },
  {
    icon: "fa-chart-line",
    title: "گزارش‌ها",
    desc: "داشبوردهای تحلیلی برای تصمیم‌گیری.",
  },
  {
    icon: "fa-shield-alt",
    title: "امنیت",
    desc: "کنترل سطح دسترسی و لاگ‌های امنیتی.",
  },
  {
    icon: "fa-server",
    title: "ادغام",
    desc: "API و وب‌هوک برای اتصالات خارجی.",
  },
];

function useMovingDot(
  pathRef: React.RefObject<SVGPathElement>,
  loopDuration = 3500
) {
  const dotRef = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    const path = pathRef.current;
    const dot = dotRef.current;
    if (!path || !dot) return;
    const len = path.getTotalLength();
    const start = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      const t = ((now - start) % loopDuration) / loopDuration; // 0..1
      const pt = path.getPointAtLength(len * t);
      dot.setAttribute("cx", String(pt.x));
      dot.setAttribute("cy", String(pt.y));
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [pathRef, loopDuration]);

  return dotRef;
}

export default function FeatureCards() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold">
            چه کاری با اهرم انجام دهید
          </h2>
          <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
            ویژگی‌های کلیدی که به رشد کسب‌وکارتان کمک می‌کنند.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <FeatureCard key={f.title} feature={f} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  idx,
}: {
  feature: (typeof features)[number];
  idx: number;
}) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const dotRef = useMovingDot(
    pathRef as RefObject<SVGPathElement>,
    3000 + idx * 300
  ); // slight offset per card
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

  // sample points for tooltips (hardcoded relative positions for demo)
  const points = [
    { x: 12, y: 70, text: "شروع" },
    { x: 90, y: 45, text: "افزایش" },
    { x: 170, y: 30, text: "پیک" },
  ];

  return (
    <div className="rounded-2xl p-5 bg-white border hover:shadow-lg transition group">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center text-2xl text-teal-600">
          <DIcon icon={feature.icon} cdi={false} classCustom="text-teal-600" />
        </div>
        <div>
          <div className="text-lg font-semibold">{feature.title}</div>
          <div className="text-sm text-slate-500 mt-1">{feature.desc}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="bg-white rounded-md p-3 border">
          <div className="relative h-28">
            <svg
              viewBox="0 0 200 100"
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              {/* area */}
              <defs>
                <linearGradient id={`g-${idx}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(13,148,136,0.12)" />
                  <stop offset="100%" stopColor="rgba(13,148,136,0.02)" />
                </linearGradient>
              </defs>

              <path
                d="M0 80 C40 60, 80 55, 120 40 C160 28, 200 20, 200 20 L200 100 L0 100 Z"
                fill={`url(#g-${idx})`}
              />

              <path
                ref={pathRef}
                d="M0 80 C40 60, 80 55, 120 40 C160 28, 200 20"
                fill="none"
                stroke="#0d9488"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* moving dot */}
              <circle
                ref={dotRef}
                r="3.5"
                fill="#0d9488"
                stroke="#fff"
                strokeWidth="1"
              />

              {/* interactive points for tooltip */}
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={4}
                  fill="#0d9488"
                  className="cursor-pointer opacity-80 hover:opacity-100 transition"
                  onMouseEnter={(e) => {
                    const rect = (e.target as SVGCircleElement)
                      .closest("svg")!
                      .getBoundingClientRect();
                    setTooltip({
                      x: (p.x / 200) * rect.width,
                      y: (p.y / 100) * rect.height - 10,
                      text: p.text,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </svg>

            {/* tooltip */}
            {tooltip && (
              <div
                style={{
                  transform: `translate(${tooltip.x}px, ${tooltip.y}px)`,
                }}
                className="absolute pointer-events-none"
              >
                <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded-md shadow-md">
                  {tooltip.text}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
        <div>عملکرد</div>
        <div className="font-medium text-slate-800">+{10 + idx * 3}%</div>
      </div>
    </div>
  );
}
