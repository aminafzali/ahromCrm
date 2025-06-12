import DIcon from "@/@Client/Components/common/DIcon";
import { Button } from "ndui-ahrom";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">درباره ما</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          ما یک تیم متخصص در زمینه تعمیر لوازم خانگی هستیم که با بیش از یک دهه تجربه، خدمات با کیفیت و مطمئن را به مشتریان عزیز ارائه می‌دهیم.
        </p>
      </div>

      {/* Values Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <DIcon icon="fa-award" cdi={false} classCustom="text-3xl text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-3">کیفیت برتر</h3>
          <p className="text-gray-600">
            استفاده از قطعات اصلی و ارائه خدمات با بالاترین استانداردها
          </p>
        </div>

        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <DIcon icon="fa-clock" cdi={false} classCustom="text-3xl text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-3">سرعت در خدمات</h3>
          <p className="text-gray-600">
            پاسخگویی سریع و حضور به موقع تکنسین‌های متخصص
          </p>
        </div>

        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <DIcon icon="fa-shield" cdi={false} classCustom="text-3xl text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-3">گارانتی خدمات</h3>
          <p className="text-gray-600">
            ارائه گارانتی برای تمامی خدمات و قطعات تعویضی
          </p>
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">تیم ما</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((member) => (
            <div key={member} className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="font-bold mb-1">نام و نام خانوادگی</h3>
              <p className="text-gray-600">سمت شغلی</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-white rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">آماده خدمت‌رسانی به شما هستیم</h2>
        <p className="mb-6">برای دریافت خدمات، همین حالا درخواست خود را ثبت کنید</p>
        <Link href="/request">
          <Button
            size="lg"
            className="!bg-white !text-primary"
            icon={<DIcon icon="fa-arrow-left" cdi={false} classCustom="mr-2" />}
          >
            ثبت درخواست
          </Button>
        </Link>
      </div>
    </div>
  );
}