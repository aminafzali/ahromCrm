// // import LoginButton from "./LoginButton";
"use client";

import { useEffect, useRef } from "react";
import LoginButton from "./LoginButton";

/**
 * LandingHero - ساده، شیک و مینیمال
 * کارت راست: چارت خطی ساده با نقطه متحرک (loop)
 */
export default function LandingHero() {
  const pathRef = useRef<SVGPathElement | null>(null);
  const dotRef = useRef<SVGCircleElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const path = pathRef.current;
    const dot = dotRef.current;
    if (!path || !dot) return;

    const len = path.getTotalLength();
    // loop animation: t from 0..1
    const loop = (now: number) => {
      const t = ((now - start) / 3000) % 1; // 3s loop
      const pos = path.getPointAtLength(len * t);
      dot.setAttribute("cx", String(pos.x));
      dot.setAttribute("cy", String(pos.y));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section className="relative py-14">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* LEFT */}
          <div className="max-w-xl space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-slate-900">
              کسب‌وکار خود را با <span className="text-teal-600">اهرم</span>{" "}
              متحول کنید
            </h1>

            <p className="text-lg text-slate-600">
              پنل مدیریت اهرم؛ یک پلتفرم یکپارچه برای مدیریت درخواست‌ها، خدمات،
              محصولات و مشتریان — ساده، قدرتمند و قابل توسعه.
            </p>

            <div className="flex items-center gap-4">
              <LoginButton />
              {/* <div className="text-sm text-slate-500">یا سریع ثبت‌نام کنید و شروع کنید</div> */}
            </div>

            <div className="mt-3 flex gap-3">
              <div className="px-3 py-2 rounded-lg bg-white border shadow-sm text-sm">
                مناسب برای استارتاپ‌ها و کسب‌وکارهای خدماتی
              </div>
              <div className="px-3 py-2 rounded-lg bg-white border shadow-sm text-sm">
                پشتیبانی 24/7
              </div>
            </div>
          </div>

          {/* RIGHT - simple card with minimal line chart */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">نمونه گزارش</div>
                  <div className="text-lg font-semibold mt-1">
                    روند فروش ماهانه
                  </div>
                </div>
                <div className="text-teal-600 font-bold">تجزیه‌و‌تحلیل</div>
              </div>

              <div className="mt-4 rounded-lg p-3 bg-gradient-to-b from-teal-50 to-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-slate-600">فروش (تومان)</div>
                  <div className="text-sm font-medium text-slate-800">
                    ماه جاری
                  </div>
                </div>

                <div className="relative h-44">
                  <svg
                    viewBox="0 0 360 120"
                    preserveAspectRatio="none"
                    className="w-full h-full"
                  >
                    {/* area fill */}
                    <defs>
                      <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(13,148,136,0.12)" />
                        <stop offset="100%" stopColor="rgba(13,148,136,0.02)" />
                      </linearGradient>
                    </defs>

                    <path
                      d="M0 100 C60 78, 120 70, 180 58 C240 45, 300 40, 360 30 L360 120 L0 120 Z"
                      fill="url(#areaGrad)"
                    />

                    <path
                      ref={pathRef}
                      d="M0 100 C60 78, 120 70, 180 58 C240 45, 300 40, 360 30"
                      fill="none"
                      stroke="#0d9488"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="block"
                    />

                    {/* animated dot */}
                    <circle
                      ref={dotRef}
                      r="4.5"
                      fill="#0d9488"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  </svg>

                  <div className="absolute right-3 top-3 bg-white/90 px-3 py-1 rounded-md text-xs font-medium text-slate-700 shadow-sm">
                    رشد ماهانه: <span className="text-teal-600">+18%</span>
                  </div>
                </div>

                <div className="mt-4 text-sm text-slate-500 flex justify-between">
                  <div>تراکنش‌های اخیر</div>
                  <div className="font-medium text-slate-700">۳۲ مورد</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* centered arrow button */}
        <div className="mt-8 flex justify-center">
          <a
            href="#features"
            aria-label="مشاهده امکانات"
            className="flex flex-col items-center gap-2"
          >
            <div className="w-14 h-14 rounded-full bg-white border border-slate-100 shadow-md flex items-center justify-center hover:scale-105 transition">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14"
                  stroke="#0d9488"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 12l-7 7-7-7"
                  stroke="#0d9488"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-sm text-slate-600">مشاهده امکانات</div>
          </a>
        </div>
      </div>
    </section>
  );
}

// // src/app/(root)/_components/LandingHero.tsx
// "use client";

// import LoginButton from "./LoginButton";

// export default function LandingHero() {
//   return (
//     <section className="relative overflow-visible py-14">
//       <div className="container mx-auto px-4">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
//           {/* LEFT: headline + small pitches */}
//           <div className="max-w-xl space-y-6">
//             <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-slate-900">
//               کسب‌وکار خود را با <span className="text-teal-600">اهرم</span>{" "}
//               متحول کنید
//             </h1>

//             <p className="text-lg text-slate-600">
//               پنل مدیریت اهرم؛ راهکار یکپارچهٔ مدیریت درخواست‌ها، خدمات، محصولات
//               و مشتریان — با سرعت، دقت و رشدِ پایدار.
//             </p>

//             <div className="flex items-center gap-4">
//               <LoginButton />
//               <div className="text-sm text-slate-500">
//                 یا به سرعت ثبت‌نام کرده و مدیریت را آغاز کنید.
//               </div>
//             </div>

//             <div className="flex gap-4 mt-3">
//               <div className="px-3 py-2 rounded-lg bg-white border shadow-sm">
//                 <div className="text-xs text-slate-400">مناسب برای</div>
//                 <div className="font-medium">
//                   استارتاپ‌ها و کسب‌وکارهای خدماتی
//                 </div>
//               </div>

//               <div className="px-3 py-2 rounded-lg bg-white border shadow-sm">
//                 <div className="text-xs text-slate-400">پشتیبانی</div>
//                 <div className="font-medium">24/7</div>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT: card with animated line chart + floating badges */}
//           <div className="relative flex items-center justify-center">
//             <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <div className="text-xs text-slate-400">نمونه گزارش</div>
//                   <div className="text-lg font-semibold mt-1">
//                     اصلاح فروش ماهانه
//                   </div>
//                 </div>
//                 <div className="text-teal-600 font-bold">تجزیه‌و‌تحلیل</div>
//               </div>

//               {/* animated line chart */}
//               <div className="mt-4 rounded-lg p-3 bg-gradient-to-b from-teal-50 to-white">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="text-sm text-slate-600">فروش (تومان)</div>
//                   <div className="text-sm font-medium text-slate-800">
//                     ماه جاری
//                   </div>
//                 </div>

//                 <div className="relative h-44">
//                   <svg
//                     viewBox="0 0 400 120"
//                     preserveAspectRatio="none"
//                     className="w-full h-full"
//                   >
//                     {/* subtle grid */}
//                     <defs>
//                       <linearGradient id="g1" x1="0" x2="1">
//                         <stop offset="0%" stopColor="rgba(13,148,136,0.12)" />
//                         <stop offset="100%" stopColor="rgba(13,148,136,0.02)" />
//                       </linearGradient>
//                     </defs>

//                     {/* filled area */}
//                     <path
//                       d="M0 100 C60 70, 120 60, 180 50 C240 40, 300 30, 360 20 L400 20 L400 120 L0 120 Z"
//                       fill="url(#g1)"
//                       opacity="0.9"
//                     />

//                     {/* animated line (looping) */}
//                     <path
//                       d="M0 100 C60 70, 120 60, 180 50 C240 40, 300 30, 360 20"
//                       fill="none"
//                       stroke="#0d9488"
//                       strokeWidth="3"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       className="hero-line"
//                     />

//                     {/* moving glow (a stroked duplicate for glow) */}
//                     <path
//                       d="M0 100 C60 70, 120 60, 180 50 C240 40, 300 30, 360 20"
//                       fill="none"
//                       stroke="rgba(13,148,136,0.15)"
//                       strokeWidth="8"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       className="hero-line-glow"
//                     />

//                     {/* dots */}
//                     <circle
//                       cx="0"
//                       cy="100"
//                       r="3"
//                       fill="#0d9488"
//                       className="dot dot-1"
//                     />
//                     <circle
//                       cx="120"
//                       cy="60"
//                       r="3.5"
//                       fill="#0d9488"
//                       className="dot dot-2"
//                     />
//                     <circle
//                       cx="240"
//                       cy="40"
//                       r="3.5"
//                       fill="#0d9488"
//                       className="dot dot-3"
//                     />
//                     <circle
//                       cx="360"
//                       cy="20"
//                       r="3.5"
//                       fill="#0d9488"
//                       className="dot dot-4"
//                     />
//                   </svg>

//                   <div className="absolute right-3 top-3 bg-white/80 px-3 py-1 rounded-md text-xs font-medium text-slate-700 shadow-sm">
//                     رشد ماهانه: <span className="text-teal-600">+18%</span>
//                   </div>
//                 </div>

//                 <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
//                   <div>تراکنش‌های اخیر</div>
//                   <div className="text-slate-700 font-medium">۳۲ مورد</div>
//                 </div>
//               </div>
//             </div>

//             {/* floating badges (motivation / clock) */}
//             <div className="absolute -left-6 -top-6 w-28 p-3 bg-white/80 backdrop-blur rounded-xl shadow-md border text-sm">
//               <div className="flex items-center gap-2">
//                 <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs">
//                   ⏱
//                 </div>
//                 <div>
//                   <div className="text-xs text-slate-600">سرعت رشد</div>
//                   <div className="font-medium">+12% این ماه</div>
//                 </div>
//               </div>
//             </div>

//             <div className="absolute -right-8 bottom-0 w-36 p-3 bg-white/80 backdrop-blur rounded-xl shadow-md border text-sm">
//               <div className="flex items-center gap-2">
//                 <div className="w-9 h-9 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs">
//                   ✨
//                 </div>
//                 <div>
//                   <div className="text-xs text-slate-600">نکته</div>
//                   <div className="font-medium">افزایش تبدیل</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* centered arrow button under hero */}
//         <div className="mt-8 flex justify-center">
//           <a
//             href="#features"
//             aria-label="مشاهده امکانات"
//             className="flex flex-col items-center gap-2"
//           >
//             <div className="w-14 h-14 rounded-full bg-white border border-slate-100 shadow-md flex items-center justify-center hover:scale-105 transition">
//               {/* arrow */}
//               <svg
//                 width="20"
//                 height="20"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 className="text-teal-600"
//               >
//                 <path
//                   d="M12 5v14"
//                   stroke="#0d9488"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//                 <path
//                   d="M19 12l-7 7-7-7"
//                   stroke="#0d9488"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//               </svg>
//             </div>
//             <div className="text-sm text-slate-600">مشاهده امکانات</div>
//           </a>
//         </div>
//       </div>

//       {/* scoped styles for animation */}
//       <style jsx>{`
//         .hero-line {
//           stroke-dasharray: 800;
//           stroke-dashoffset: 800;
//           animation: draw 4s linear infinite;
//         }
//         .hero-line-glow {
//           stroke-dasharray: 800;
//           stroke-dashoffset: 800;
//           animation: draw 4s linear infinite,
//             glow 2s ease-in-out infinite alternate;
//           opacity: 0.9;
//         }
//         @keyframes draw {
//           to {
//             stroke-dashoffset: -0;
//           }
//         }
//         @keyframes glow {
//           from {
//             opacity: 0.05;
//           }
//           to {
//             opacity: 0.25;
//             transform: scale(1.01);
//           }
//         }
//         .dot {
//           opacity: 0;
//           transform: translateY(6px) scale(0.8);
//           transition: all 0.4s ease;
//         }
//         .dot-1 {
//           animation: dotIn 1s ease-in-out 0.8s infinite alternate;
//         }
//         .dot-2 {
//           animation: dotIn 1s ease-in-out 1.4s infinite alternate;
//         }
//         .dot-3 {
//           animation: dotIn 1s ease-in-out 1.8s infinite alternate;
//         }
//         .dot-4 {
//           animation: dotIn 1s ease-in-out 2.2s infinite alternate;
//         }

//         @keyframes dotIn {
//           from {
//             opacity: 0.15;
//             transform: translateY(6px) scale(0.8);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0) scale(1.05);
//           }
//         }

//         /* small responsive tweaks */
//         @media (max-width: 1024px) {
//           .hero-line,
//           .hero-line-glow {
//             animation-duration: 3.2s;
//           }
//         }
//       `}</style>
//     </section>
//   );
// }

// // // src/app/(root)/_components/LandingHero.tsx

// // // // src/app/(root)/_components/FeaturesSection.tsx

// // "use client";

// // import DIcon from "@/@Client/Components/common/DIcon";
// // import LoginButton from "./LoginButton";

// // /**
// //  * LandingHero — Hero مدرن با کارت نمونه گزارش و چارت خطی متحرک
// //  */
// // export default function LandingHero() {
// //   return (
// //     <section className="relative overflow-hidden rounded-3xl">
// //       <div
// //         className="bg-gradient-to-r from-white/60 via-teal-50 to-white/60"
// //         style={{
// //           boxShadow: "0 20px 40px rgba(2,6,23,0.06)",
// //           borderRadius: 24,
// //         }}
// //       >
// //         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center px-6 py-12 lg:py-20">
// //           {/* left: headline + CTAs */}
// //           <div className="max-w-xl mx-auto lg:mx-0 space-y-6">
// //             <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-slate-900">
// //               کسب‌وکار خود را با <span className="text-teal-600">اهرم</span>{" "}
// //               متحول کنید
// //             </h1>

// //             <p className="mt-1 text-lg text-slate-600">
// //               پنل مدیریت اهرم؛ راهکار یکپارچهٔ مدیریت درخواست‌ها، خدمات، محصولات
// //               و مشتریان — سریع، قابل اعتماد و قابل توسعه.
// //             </p>

// //             <div className="flex flex-col sm:flex-row sm:items-center gap-3">
// //               <LoginButton />
// //             </div>

// //             <div className="mt-3 text-sm text-slate-500">
// //               مناسب برای استارتاپ‌ها، تیم‌های خدماتی و کسب‌وکارهایی که رشد
// //               می‌خواهند.
// //             </div>
// //           </div>

// //           {/* right: کارت نمونه گزارش + چارت خطی انیمیشنی */}
// //           <div className="flex items-center justify-center">
// //             <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border">
// //               <div className="flex items-center justify-between">
// //                 <div>
// //                   <div className="text-xs text-slate-400">نمونه گزارش</div>
// //                   <div className="text-lg font-semibold mt-1">
// //                     اصلاح فروش ماهانه
// //                   </div>
// //                 </div>

// //                 <div className="text-teal-600 font-bold">تجزیه‌و‌تحلیل</div>
// //               </div>

// //               {/* animated line chart */}
// //               <div className="mt-4 rounded-lg p-3 bg-gradient-to-b from-teal-50 to-white">
// //                 <div className="flex items-center justify-between mb-3">
// //                   <div className="text-sm text-slate-600">فروش (تومان)</div>
// //                   <div className="text-sm font-medium text-slate-800">
// //                     ماه جاری
// //                   </div>
// //                 </div>

// //                 <div className="relative h-40">
// //                   {/* SVG line with stroke-draw animation */}
// //                   <svg
// //                     viewBox="0 0 200 80"
// //                     preserveAspectRatio="none"
// //                     className="w-full h-full"
// //                     aria-hidden
// //                   >
// //                     {/* grid lines (subtle) */}
// //                     <g stroke="#e6f6f3" strokeWidth="0.8">
// //                       <line x1="0" y1="10" x2="200" y2="10" />
// //                       <line x1="0" y1="30" x2="200" y2="30" />
// //                       <line x1="0" y1="50" x2="200" y2="50" />
// //                       <line x1="0" y1="70" x2="200" y2="70" />
// //                     </g>

// //                     {/* filled area under line (soft) */}
// //                     <path
// //                       d="M0 60 C20 50, 40 40, 60 35 C80 30, 100 28, 120 20 C140 12, 160 18, 180 12 L200 12 L200 80 L0 80 Z"
// //                       fill="rgba(13,148,136,0.06)"
// //                     />

// //                     {/* animated line */}
// //                     <path
// //                       d="M0 60 C20 50, 40 40, 60 35 C80 30, 100 28, 120 20 C140 12, 160 18, 180 12"
// //                       fill="none"
// //                       stroke="#0d9488"
// //                       strokeWidth="2.5"
// //                       strokeLinecap="round"
// //                       strokeLinejoin="round"
// //                       className="animated-line"
// //                       style={{
// //                         strokeDasharray: 400,
// //                         strokeDashoffset: 400,
// //                       }}
// //                     />

// //                     {/* data points */}
// //                     <circle
// //                       cx="0"
// //                       cy="60"
// //                       r="2.5"
// //                       fill="#0d9488"
// //                       className="point"
// //                     />
// //                     <circle
// //                       cx="60"
// //                       cy="35"
// //                       r="3"
// //                       fill="#0d9488"
// //                       className="point"
// //                     />
// //                     <circle
// //                       cx="120"
// //                       cy="20"
// //                       r="3"
// //                       fill="#0d9488"
// //                       className="point"
// //                     />
// //                     <circle
// //                       cx="180"
// //                       cy="12"
// //                       r="3"
// //                       fill="#0d9488"
// //                       className="point"
// //                     />
// //                   </svg>

// //                   {/* simple legend and value */}
// //                   <div className="absolute top-3 right-4 bg-white/80 px-3 py-1 rounded-md text-xs font-medium text-slate-700 shadow-sm">
// //                     رشد ماهانه: <span className="text-teal-600">+18%</span>
// //                   </div>
// //                 </div>

// //                 <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
// //                   <div>تراکنش‌های اخیر</div>
// //                   <div className="text-slate-700 font-medium">۳۲ مورد</div>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //           {/* دکمه مشاهده امکانات با فلش به پایین */}
// //           <a
// //             href="#features"
// //             className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-teal-100 bg-white text-teal-600 hover:shadow-md transition transform hover:-translate-y-0.5"
// //             aria-label="مشاهده امکانات"
// //           >
// //             <span>مشاهده امکانات</span>
// //             <DIcon
// //               icon="fa-arrow-down"
// //               cdi={false}
// //               classCustom="!text-teal-600"
// //             />
// //           </a>
// //         </div>
// //       </div>

// //       {/* small CSS for animation (scoped style) */}
// //       <style jsx>{`
// //         .animated-line {
// //           animation: dash 2s ease forwards 0.2s;
// //         }

// //         @keyframes dash {
// //           to {
// //             stroke-dashoffset: 0;
// //           }
// //         }

// //         /* نقطه‌ها با تاخیر ظاهر می‌شوند */
// //         .point {
// //           opacity: 0;
// //           transform-origin: center;
// //           animation: appear 0.6s ease forwards;
// //         }
// //         .point:nth-of-type(1) {
// //           animation-delay: 1.6s;
// //         }
// //         .point:nth-of-type(2) {
// //           animation-delay: 1.9s;
// //         }
// //         .point:nth-of-type(3) {
// //           animation-delay: 2.1s;
// //         }
// //         .point:nth-of-type(4) {
// //           animation-delay: 2.3s;
// //         }

// //         @keyframes appear {
// //           from {
// //             opacity: 0;
// //             transform: scale(0.6);
// //           }
// //           to {
// //             opacity: 1;
// //             transform: scale(1);
// //           }
// //         }
// //       `}</style>
// //     </section>
// //   );
// // }

// // import LoginButton from "./LoginButton";

// // export default function LandingHero() {
// //   return (
// //     <section className="relative overflow-hidden rounded-3xl">
// //       <div
// //         className="bg-gradient-to-r from-white/60 via-teal-50 to-white/60"
// //         style={{
// //           boxShadow: "0 20px 40px rgba(2,6,23,0.06)",
// //           borderRadius: 24,
// //         }}
// //       >
// //         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center px-6 py-12 lg:py-20">
// //           <div className="max-w-xl mx-auto lg:mx-0">
// //             <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-slate-900">
// //               کسب‌وکار خود را با <span className="text-teal-600">اهرم</span>{" "}
// //               متحول کنید
// //             </h1>
// //             <p className="mt-4 text-lg text-slate-600">
// //               پنل مدیریت اهرم؛ راهکار یکپارچهٔ مدیریت درخواست‌ها، خدمات، محصولات
// //               و مشتریان — سریع، قابل اعتماد، و قابل توسعه.
// //             </p>

// //             <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
// //               <LoginButton />
// //               <a
// //                 href="#features"
// //                 className="inline-flex items-center justify-center px-5 py-3 rounded-lg border border-teal-100 bg-white text-teal-600 hover:shadow-md transition"
// //               >
// //                 مشاهده امکانات
// //               </a>
// //             </div>

// //             <div className="mt-6 text-sm text-slate-500">
// //               قابل استفاده برای استارتاپ‌ها، کسب‌وکارهای خدماتی و تیم‌های فنی.
// //             </div>
// //           </div>

// //           <div className="flex items-center justify-center">
// //             {/* Illustration card */}
// //             <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border">
// //               <div className="flex items-center justify-between">
// //                 <div>
// //                   <div className="text-xs text-slate-400">نمونه گزارش</div>
// //                   <div className="text-lg font-semibold mt-1">
// //                     فاکتور ماهانه
// //                   </div>
// //                 </div>
// //                 <div className="text-teal-600 font-bold">تجزیه‌و‌تحلیل</div>
// //               </div>

// //               <div className="mt-4 h-40 bg-gradient-to-b from-teal-50 to-white rounded-lg p-4">
// //                 {/* fake chart bars */}
// //                 <div className="flex items-end h-full gap-2">
// //                   <div className="w-3 rounded-t-md bg-teal-500 h-[60%]" />
// //                   <div className="w-3 rounded-t-md bg-teal-400 h-[40%]" />
// //                   <div className="w-3 rounded-t-md bg-teal-600 h-[80%]" />
// //                   <div className="w-3 rounded-t-md bg-teal-300 h-[30%]" />
// //                   <div className="w-3 rounded-t-md bg-teal-500 h-[50%]" />
// //                   <div className="w-3 rounded-t-md bg-teal-400 h-[70%]" />
// //                 </div>
// //               </div>

// //               <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
// //                 <div>تراکنش‌های اخیر</div>
// //                 <div className="text-slate-700 font-medium">۳۲ مورد</div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </section>
// //   );
// // }

// // // export default async function LandingHero() {
// // //   return (
// // //     <div className="hero min-h-[70vh] bg-base-200 rounded-3xl my-6">
// // //       <div className="hero-content text-center  justify-items-center justify-center content-center">
// // //         <div className="max-w-2xl">
// // //           <h1 className="text-5xl font-bold leading-tight justify-items-center justify-center content-center">
// // //             کسب‌وکار خود را با <span className="text-primary">اهرم</span> متحول
// // //             کنید
// // //           </h1>
// // //           <p className="py-6 text-lg">
// // //             پنل مدیریت اهرم، یک راهکار جامع برای مدیریت هوشمند درخواست‌ها،
// // //             خدمات، محصولات و مشتریان شماست. همه‌چیز در یک پلتفرم یکپارچه.
// // //           </p>
// // //           <LoginButton />
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }
