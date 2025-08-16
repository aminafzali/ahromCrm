import DIcon from "@/@Client/Components/common/DIcon";
// ===== شروع اصلاحیه: از تابع صحیح getSession استفاده می‌کنیم =====
import { getSession } from "@/lib/auth";
// ==========================================================
import { Button } from "ndui-ahrom";
import Link from "next/link";

export default async function LandingHero() {
  // ===== شروع اصلاحیه: تابع getSession را فراخوانی می‌کنیم =====
  const session = await getSession();
  // =======================================================

  return (
    <div className="hero min-h-[70vh] bg-base-200 rounded-3xl my-6">
      <div className="hero-content text-center">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold leading-tight">
            کسب‌وکار خود را با <span className="text-primary">اهرم</span> متحول
            کنید
          </h1>
          <p className="py-6 text-lg">
            پنل مدیریت اهرم، یک راهکار جامع برای مدیریت هوشمند درخواست‌ها،
            خدمات، محصولات و مشتریان شماست. همه‌چیز در یک پلتفرم یکپارچه.
          </p>
          <div className="flex items-center justify-center gap-4">
            {session?.user ? (
              // اگر کاربر لاگین کرده باشد
              <Link href="/dashboard">
                <Button size="lg" variant="primary">
                  <DIcon
                    icon="fa-tachometer-alt"
                    cdi={false}
                    classCustom="ml-2"
                  />
                  ورود به پنل مدیریت
                </Button>
              </Link>
            ) : (
              // اگر کاربر لاگین نکرده باشد
              <Link href="/login">
                <Button size="lg" variant="primary">
                  <DIcon icon="fa-sign-in-alt" cdi={false} classCustom="ml-2" />
                  ورود / ثبت‌نام
                </Button>
              </Link>
            )}
            <Link href="#features">
              <Button size="lg" variant="ghost">
                آشنایی با امکانات
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
