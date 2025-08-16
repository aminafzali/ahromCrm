import DIcon from "@/@Client/Components/common/DIcon";
import type { Workspace } from "@prisma/client"; // تایپ Workspace را از Prisma وارد کنید
import Link from "next/link";

interface WorkspaceListProps {
  workspaces: Partial<Workspace>[]; // ما فقط به بخشی از فیلدها نیاز داریم
}

export default function WorkspaceList({ workspaces }: WorkspaceListProps) {
  if (workspaces.length === 0) {
    return null; // اگر ورک‌اسپیسی وجود نداشت، این بخش را نمایش نده
  }

  return (
    <section className="py-20 px-3">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">وب‌سایت مشتریان ما</h2>
        <p className="text-base-content/70 mt-2">
          نمونه‌ای از وب‌سایت‌های ایجاد شده با پنل اهرم را مشاهده کنید.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((ws) => (
          <Link key={ws.id} href={`/${ws.slug}`}>
            <div className="card bg-white border h-full hover:border-primary transition-colors">
              <div className="card-body">
                <h3 className="card-title">{ws.name}</h3>
                <p className="flex-grow">
                  {ws.description || "برای مشاهده جزئیات بیشتر کلیک کنید."}
                </p>
                <div className="card-actions justify-end mt-4">
                  <span className="btn btn-sm btn-ghost text-primary">
                    مشاهده وب‌سایت
                    <DIcon
                      icon="fa-arrow-left"
                      cdi={false}
                      classCustom="mr-2"
                    />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
