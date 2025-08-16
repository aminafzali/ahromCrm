// مسیر فایل: src/app/(root)/page.tsx

import { getAllPublicWorkspaces } from "@/@Server/services/workspaces/WorkspaceApiService";
import FeaturesSection from "./_components/FeaturesSection";
import LandingHero from "./_components/LandingHero";
import WorkspaceList from "./_components/WorkspaceList";

export default async function LandingPage() {
  const workspaces = await getAllPublicWorkspaces();

  return (
    <div className="container mx-auto px-4">
      {/* بخش اول: معرفی و دکمه‌های اصلی */}
      <LandingHero />

      {/* بخش دوم: معرفی امکانات */}
      <FeaturesSection />

      {/* بخش سوم: لیست ورک‌اسپیس‌ها */}
      <WorkspaceList workspaces={workspaces} />
    </div>
  );
}

// // مسیر فایل: src/app/(root)/page.tsx

// import DIcon from "@/@Client/Components/common/DIcon";
// import prisma from "@/lib/prisma";
// import { Button } from "ndui-ahrom";
// import Link from "next/link";

// // تابع برای دریافت ورک‌اسپیس‌ها از دیتابیس
// async function getWorkspaces() {
//   const workspaces = await prisma.workspace.findMany({
//     // می‌توانید در آینده فیلدی مانند isPublic اضافه کنید تا فقط ورک‌اسپیس‌های عمومی نمایش داده شوند
//     // where: { isPublic: true },
//     select: {
//       name: true,
//       slug: true,
//       //  description: true,
//     },
//     take: 6, // نمایش حداکثر ۶ ورک‌اسپیس
//   });
//   return workspaces;
// }

// // تعریف امکانات کلیدی پنل
// const features = [
//   {
//     icon: "fa-tasks",
//     title: "مدیریت درخواست‌ها",
//     description:
//       "روند درخواست‌های مشتریان را از ثبت تا تکمیل به راحتی پیگیری کنید.",
//   },
//   {
//     icon: "fa-users",
//     title: "مدیریت مشتریان (CRM)",
//     description:
//       "اطلاعات مشتریان و تاریخچه سفارشات آن‌ها را در یک مکان متمرکز مدیریت کنید.",
//   },
//   {
//     icon: "fa-file-invoice-dollar",
//     title: "صدور فاکتور و پرداخت",
//     description:
//       "فاکتورهای حرفه‌ای صادر کرده و پرداخت‌های آنلاین و آفلاین را ثبت نمایید.",
//   },
//   {
//     icon: "fa-boxes-stacked",
//     title: "مدیریت محصولات و خدمات",
//     description:
//       "لیست محصولات و خدمات خود را با جزئیات کامل و دسته‌بندی پویا تعریف کنید.",
//   },
//   {
//     icon: "fa-chart-line",
//     title: "گزارش‌گیری و آمار",
//     description:
//       "با گزارش‌های تحلیلی، دیدی عمیق نسبت به عملکرد کسب‌وکار خود پیدا کنید.",
//   },
//   {
//     icon: "fa-sitemap",
//     title: "سیستم چندمستأجره",
//     description:
//       "چندین کسب‌وکار یا شعبه را به صورت کاملاً مجزا در یک پنل واحد مدیریت کنید.",
//   },
// ];

// export default async function LandingPage() {
//   const workspaces = await getWorkspaces();

//   return (
//     <>
//       {/* بخش معرفی (Hero Section) */}
//       <section className="text-center py-20 lg:py-32">
//         <div className="container mx-auto px-4">
//           <h1 className="text-4xl md:text-6xl font-bold mb-4">
//             پنل مدیریت کسب و کار اهرم
//           </h1>
//           <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
//             ابزار جامع شما برای مدیریت هوشمندانه خدمات، مشتریان، فاکتورها و رشد
//             کسب‌وکارتان.
//           </p>
//           <div className="flex flex-wrap justify-center gap-4">
//             <Link href="/dashboard">
//               <Button size="lg" color="primary">
//                 ورود به پنل کاربری
//               </Button>
//             </Link>
//             <Link href="/demo">
//               <Button size="lg" variant="ghost">
//                 مشاهده دمو
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* بخش امکانات */}
//       <section id="features" className="bg-base-200 py-20">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold">امکانات قدرتمند اهرم</h2>
//             <p className="text-gray-500 mt-2">
//               هر آنچه برای مدیریت یکپارچه کسب‌وکار خود نیاز دارید.
//             </p>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {features.map((feature) => (
//               <div
//                 key={feature.title}
//                 className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow"
//               >
//                 <div className="card-body items-center text-center">
//                   <DIcon
//                     icon={feature.icon}
//                     cdi={false}
//                     classCustom="text-primary text-4xl mb-4"
//                   />
//                   <h3 className="card-title">{feature.title}</h3>
//                   <p>{feature.description}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* بخش لیست ورک‌اسپیس‌ها */}
//       <section id="workspaces" className="py-20">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold">ورک‌اسپیس‌های فعال</h2>
//             <p className="text-gray-500 mt-2">
//               به صفحات اختصاصی کسب‌وکارهای تحت مدیریت اهرم بپیوندید.
//             </p>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {workspaces.map((ws) => (
//               <Link href={`/${ws.slug}`} key={ws.slug}>
//                 <div className="card bg-base-100 h-full shadow-md hover:shadow-xl hover:-translate-y-1 transition-all">
//                   <div className="card-body">
//                     <h3 className="card-title">{ws.name}</h3>
//                     <p className="text-gray-600 dark:text-gray-400 flex-grow">
//                       {
//                         //ws.description ||
//                         `صفحه اختصاصی ${ws.name}`
//                       }
//                     </p>
//                     <div className="card-actions justify-end mt-4">
//                       <span className="btn btn-ghost btn-sm">
//                         مشاهده صفحه
//                         <DIcon
//                           icon="fa-arrow-left"
//                           cdi={false}
//                           classCustom="mr-2"
//                         />
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         </div>
//       </section>
//     </>
//   );
// }

// // import DIcon from "@/@Client/Components/common/DIcon";
// // import Base from "@/components/home/base";
// // import Features from "@/components/home/Features";
// // import ProductShowcase from "@/components/home/ProductShowcase";
// // import Testimonials from "@/components/home/Testimonials";
// // import prisma from "@/lib/prisma";
// // import { Button } from "ndui-ahrom";
// // import Link from "next/link";

// // async function getServiceTypes() {
// //   const serviceTypes = await prisma.serviceType.findMany({
// //     where: {
// //       isActive: true,
// //     },
// //     orderBy: {
// //       name: "asc",
// //     },
// //     take: 6,
// //   });

// //   return serviceTypes;
// // }

// // async function getFeaturedProducts() {
// //   const products = await prisma.product.findMany({
// //     where: {
// //       isActive: true,
// //     },
// //     include: {
// //       images: true,
// //       brand: true,
// //       category: true,
// //     },
// //     take: 8,
// //     orderBy: {
// //       createdAt: "desc",
// //     },
// //   });

// //   return products;
// // }

// // export default async function Home() {
// //   const serviceTypes = await getServiceTypes();
// //   const products = await getFeaturedProducts();

// //   return (
// //     <>
// //       {/* Hero Section */}
// //       <div className="relative bg-gradient-to-r from-primary to-primary/75 text-white py-20 m-6 rounded-3xl">
// //         <div className="container mx-auto px-4">
// //           <div className="max-w-3xl mx-auto text-center">
// //             <h1 className="text-2xl md:text-5xl font-bold mb-6">
// //               خدمات تعمیر لوازم خانگی حرفه‌ای
// //             </h1>
// //             <p className="text-md mb-8">
// //               با بیش از 10 سال تجربه در ارائه خدمات تعمیر با کیفیت و قیمت مناسب
// //             </p>
// //             <div className="flex flex-wrap justify-center gap-4">
// //               <Link href="/request" className="">
// //                 <Button
// //                   size="lg"
// //                   icon={
// //                     <DIcon
// //                       icon="fa-wrench"
// //                       cdi={false}
// //                       classCustom="!ml-2 text-2xl"
// //                     />
// //                   }
// //                   className="w-full !bg-white !text-gray-800 border-0"
// //                 >
// //                   ثبت درخواست
// //                 </Button>
// //               </Link>
// //               <Link href="/demo" className="btn btn-ghost btn-lg text-white">
// //                 <DIcon icon="fa-play" cdi={false} classCustom="ml-2" />
// //                 مشاهده دمو
// //               </Link>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       <Base />

// //       {/* Service Types Section */}
// //       <div className="container mx-auto px-4 py-16">
// //         <h2 className="text-3xl font-bold mb-8 text-center">خدمات ما</h2>
// //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
// //           {serviceTypes.map((service) => (
// //             <div
// //               key={service.id}
// //               className="bg-white p-6 rounded-lg border-2 hover:shadow-lg transition-shadow"
// //             >
// //               <h3 className="text-xl font-semibold mb-2">
// //                 <DIcon icon="fa-wrench" />
// //                 {service.name}
// //               </h3>
// //               <p className="text-gray-600 mb-4">{service.description}</p>
// //               <p className="text-primary font-bold">
// //                 از {service.basePrice.toLocaleString()} تومان
// //               </p>
// //             </div>
// //           ))}
// //         </div>
// //       </div>

// //       {/* Features Section */}
// //       <Features />

// //       {/* Product Showcase */}
// //       <ProductShowcase products={products} />

// //       {/* Testimonials */}
// //       <Testimonials />

// //       {/* Footer */}
// //     </>
// //   );
// // }

// // export const revalidate = 60;
