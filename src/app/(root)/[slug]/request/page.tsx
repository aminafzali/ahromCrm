// مسیر فایل: src/app/(root)/request/page.tsx

import NotFound from "@/@Client/Components/common/NotFound";
import { prisma } from "@/lib/prisma";
import PublicRequestForm from "@/modules/requests/components/PublicRequestForm";

// این صفحه یک Server Component است و می‌تواند مستقیم با دیتابیس کار کند
export default async function RequestPage() {
  // ۱. دریافت لیست انواع خدمات از دیتابیس
  const serviceTypes = await prisma.serviceType.findMany();

  // ۲. دریافت وضعیت اولیه برای درخواست‌ها از دیتابیس
  // فرض می‌کنیم اولین وضعیت، وضعیت پیش‌فرض برای درخواست‌های جدید است
  const initialStatus = await prisma.status.findFirst({
    orderBy: {
      id: "asc",
    },
  });

  // اگر هیچ وضعیتی در دیتابیس تعریف نشده بود، صفحه را نمایش نده
  if (!initialStatus) {
    return (
      <NotFound
      //  message="هیچ وضعیت اولیه‌ای برای درخواست‌ها تعریف نشده است."
      />
    );
  }

  return (
    <div className="container py-8">
      {/* ۳. پاس دادن داده‌های دریافت شده به عنوان props به کامپوننت کلاینت
       */}
      <PublicRequestForm
        // serviceTypes={serviceTypes}
        initialStatusId={initialStatus.id}
      />
    </div>
  );
}
