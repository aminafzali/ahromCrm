// // مسیر فایل: src/app/(root)/page.tsx
// src/app/(root)/page.tsx
import { getAllPublicWorkspaces } from "@/@Server/services/workspaces/WorkspaceApiService";
import Footer from "@/components/home/Footer";
import Testimonials from "@/components/home/Testimonials";
import FeaturesSection from "./_components/FeaturesSection";
import LandingHero from "./_components/LandingHero";
import StickyHeader from "./_components/StickyHeader";
import WorkspaceList from "./_components/WorkspaceList";

export default async function LandingPage() {
  const workspaces = await getAllPublicWorkspaces();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="container mx-auto px-4">
        <div className="">
          <StickyHeader />
        </div>

        {/* hero */}
        <div className="pt-5">
          <LandingHero />
        </div>

        {/* features */}
        <div className="mt-12">
          <FeaturesSection />
        </div>

        {/* workspaces */}
        <div className="mt-14">
          <WorkspaceList workspaces={workspaces} />
        </div>

        {/* testimonials */}
        <div className="mt-20">
          <Testimonials />
        </div>

        {/* footer */}
        <div className="mt-24">
          <Footer />
        </div>
      </div>
    </div>
  );
}

// import { getAllPublicWorkspaces } from "@/@Server/services/workspaces/WorkspaceApiService";
// import Footer from "@/components/home/Footer";
// import Testimonials from "@/components/home/Testimonials";
// import FeaturesSection from "./_components/FeaturesSection";
// import LandingHero from "./_components/LandingHero";
// import WorkspaceList from "./_components/WorkspaceList";

// export default async function LandingPage() {
//   const workspaces = await getAllPublicWorkspaces();

//   return (
//     <div className="container mx-auto px-4">
//       {/* بخش اول: معرفی و دکمه‌های اصلی */}
//       <LandingHero />

//       {/* بخش دوم: معرفی امکانات */}
//       <FeaturesSection />

//       {/* بخش سوم: لیست ورک‌اسپیس‌ها */}
//       <WorkspaceList workspaces={workspaces} />

//       {/* بخش چهارم:  نظرات */}
//       <Testimonials />

//       {/* بخش پنجم: فوتر  */}
//       <Footer />
//     </div>
//   );
// }
