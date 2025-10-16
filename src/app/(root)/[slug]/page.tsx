// مسیر فایل: src/app/(root)/[slug]/page.tsx

import DIcon from "@/@Client/Components/common/DIcon";
import Base from "@/components/home/base";
import Features from "@/components/home/Features";
import ProductShowcase from "@/components/home/ProductShowcase";
import Testimonials from "@/components/home/Testimonials";
import prisma from "@/lib/prisma";
import { Button } from "ndui-ahrom";
import { Metadata } from "next"; // ایمپورت کردن تایپ متادیتا
import Link from "next/link";
import { notFound } from "next/navigation";

// --- توابع واکشی داده (بدون تغییر) ---
async function getWorkspaceBySlug(slug: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { slug },
  });
  return workspace;
}

async function getServiceTypes(workspaceId: number) {
  const serviceTypes = await prisma.serviceType.findMany({
    where: { isActive: true, workspaceId: workspaceId },
    orderBy: { name: "asc" },
    take: 6,
  });
  return serviceTypes;
}

async function getFeaturedProducts(workspaceId: number) {
  const products = await prisma.product.findMany({
    where: { isActive: true, workspaceId: workspaceId },
    include: { images: true, brand: true, category: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
  return products;
}
// ------------------------------------

// ===== شروع بخش سئو ۱: تابع generateMetadata =====
type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const workspace = await prisma.workspace.findUnique({
    where: { slug }, // استفاده مستقیم از slug
    select: {
      name: true,
      description: true,
    },
  });

  if (!workspace) {
    return {
      title: "صفحه یافت نشد",
    };
  }

  const pageTitle = `${workspace.name} | اهرم`;
  const pageDescription =
    workspace.description || `خدمات و محصولات ${workspace.name}`;
  const pageUrl = `http://localhost:4010/${slug}`; // آدرس دامنه خود را جایگزین کنید

  return {
    title: pageTitle,
    description: pageDescription,
    // تگ‌های Open Graph برای پیش‌نمایش زیبا در شبکه‌های اجتماعی
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: pageUrl,
      siteName: "اهرم",
      // اگر برای هر ورک‌اسپیس لوگو دارید، آدرس آن را اینجا قرار دهید
      // images: [
      //   {
      //     url: workspace.logoUrl,
      //     width: 800,
      //     height: 600,
      //   },
      // ],
      type: "website",
    },
  };
}
// ===== پایان بخش سئو ۱ =====

export default async function WorkspacePage({ params }: Props) {
  const { slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);

  if (!workspace) {
    notFound();
  }

  const [serviceTypes, products] = await Promise.all([
    getServiceTypes(workspace.id),
    getFeaturedProducts(workspace.id),
  ]);

  // ===== شروع بخش سئو ۲: داده‌های ساختاریافته (JSON-LD) =====
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization", // یا "LocalBusiness" اگر کسب‌وکار محلی است
    name: workspace.name,
    url: `http://localhost:4010/${slug}`, // آدرس دامنه خود را جایگزین کنید
    // "logo": workspace.logoUrl, // آدرس لوگوی ورک‌اسپیس
    description: workspace.description || "",
  };
  // ===== پایان بخش سئو ۲ =====

  // const WorkspaceSupportButton = dynamic(
  //   () => import("@/modules/chat/components/WorkspaceSupportButtonClient"),
  //   { ssr: true }
  // );
  // TODO: Add support-chat widget button

  return (
    <>
      {/* ===== شروع بخش سئو ۳: تزریق داده‌های ساختاریافته به صفحه ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* ===== پایان بخش سئو ۳ ===== */}

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary to-primary/75 text-white py-20 m-6 rounded-3xl">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl md:text-5xl font-bold mb-6">
              {workspace.name}
            </h1>
            <p className="text-md mb-8">
              {(workspace as any).description ||
                `به ${workspace.name} خوش آمدید!`}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href={`/${slug}/request`} className="">
                <Button
                  size="lg"
                  icon={
                    <DIcon
                      icon="fa-wrench"
                      cdi={false}
                      classCustom="!ml-2 text-2xl"
                    />
                  }
                  className="w-full !bg-white !text-gray-800 border-0"
                >
                  ثبت درخواست
                </Button>
              </Link>
              <Link href="/demo" className="btn btn-ghost btn-lg text-white">
                <DIcon icon="fa-play" cdi={false} classCustom="ml-2" />
                مشاهده دمو
              </Link>
              <Link
                href={`/${slug}/support`}
                className="btn btn-secondary btn-lg"
              >
                گفتگو با پشتیبانی
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Base />

      {/* Service Types Section */}
      {serviceTypes.length > 0 && (
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-8 text-center">خدمات ما</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {serviceTypes.map((service) => (
              <div
                key={service.id}
                className="bg-white p-6 rounded-lg border-2 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">
                  <DIcon icon="fa-wrench" />
                  {service.name}
                </h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <p className="text-primary font-bold">
                  از {service.basePrice.toLocaleString()} تومان
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <Features />

      {/* Product Showcase */}
      {products.length > 0 && <ProductShowcase products={products} />}

      <Testimonials />
    </>
  );
}

export const revalidate = 60;
