// مسیر فایل: src/app/(root)/page.tsx

import { getAllPublicWorkspaces } from "@/@Server/services/workspaces/WorkspaceApiService";
import Footer from "@/components/home/Footer";
import Testimonials from "@/components/home/Testimonials";
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

      {/* بخش چهارم:  نظرات */}
      <Testimonials />

      {/* بخش پنجم: فوتر  */}
      <Footer />
    </div>
  );
}
