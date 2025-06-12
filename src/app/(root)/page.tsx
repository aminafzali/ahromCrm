import DIcon from "@/@Client/Components/common/DIcon";
import Base from "@/components/home/base";
import Features from "@/components/home/Features";
import ProductShowcase from "@/components/home/ProductShowcase";
import Testimonials from "@/components/home/Testimonials";
import prisma from "@/lib/prisma";
import { Button } from "ndui-ahrom";
import Link from "next/link";

async function getServiceTypes() {
  const serviceTypes = await prisma.serviceType.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
    take: 6,
  });

  return serviceTypes;
}

async function getFeaturedProducts() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    include: {
      images: true,
      brand: true,
      category: true,
    },
    take: 8,
    orderBy: {
      createdAt: "desc",
    },
  });

  return products;
}

export default async function Home() {
  const serviceTypes = await getServiceTypes();
  const products = await getFeaturedProducts();

  return (
    <>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary to-primary/75 text-white py-20 m-6 rounded-3xl">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl md:text-5xl font-bold mb-6">
              خدمات تعمیر لوازم خانگی حرفه‌ای
            </h1>
            <p className="text-md mb-8">
              با بیش از 10 سال تجربه در ارائه خدمات تعمیر با کیفیت و قیمت مناسب
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/request" className="">
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
            </div>
          </div>
        </div>
      </div>

      <Base />

      {/* Service Types Section */}
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

      {/* Features Section */}
      <Features />

      {/* Product Showcase */}
      <ProductShowcase products={products} />

      {/* Testimonials */}
      <Testimonials />

      {/* Footer */}
    </>
  );
}

export const revalidate = 60;
