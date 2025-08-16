// مسیر فایل: src/app/workspaces/page.tsx

"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { Button } from "ndui-ahrom";
import { useRouter } from "next/navigation";

export default function WorkspacesHubPage() {
  const { workspaces, setActiveWorkspace, isLoading } = useWorkspace();
  const router = useRouter();

  if (isLoading) {
    return <Loading />;
  }

  const handleSelect = (ws: any) => {
    setActiveWorkspace(ws);
    if (ws.role.name === "Admin") {
      router.push("/dashboard");
    } else {
      router.push("/panel");
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
            انتخاب فضای کاری
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            برای ادامه، وارد یکی از فضاهای کاری خود شوید یا یک فضای جدید بسازید.
          </p>
        </div>

        {workspaces.length > 0 ? (
          // چیدمان گرید برای نمایش کارت‌ها
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((ws) => (
              <button
                key={ws.workspaceId}
                type="button"
                className="group bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 text-right flex flex-col"
                onClick={() => handleSelect(ws)}
              >
                <div className="flex-grow">
                  {/* آیکون ساختمان برای زیبایی بیشتر */}
                  <div className="p-3 bg-teal-100 dark:bg-teal-900/50 rounded-lg w-fit mb-4">
                    <DIcon
                      icon="fa-building"
                      cdi={false}
                      classCustom="text-2xl text-teal-600 dark:text-teal-400"
                    />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                    {ws.workspace.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    نقش شما:{" "}
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {ws.role.name === "Admin" ? "مدیر" : "کاربر عادی"}
                    </span>
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-end text-teal-600 dark:text-teal-400 font-semibold">
                  <span>ورود به فضای کاری</span>
                  <DIcon
                    icon="fa-arrow-left"
                    cdi={false}
                    classCustom="mr-2 transform transition-transform duration-300 group-hover:-translate-x-1"
                  />
                </div>
              </button>
            ))}

            {/* کارت مخصوص ساخت ورک‌اسپیس جدید */}
            <button
              type="button"
              className="group border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-300 p-6 flex flex-col items-center justify-center text-slate-500"
              onClick={() => router.push("/workspaces/create")}
            >
              <DIcon
                icon="fa-plus"
                cdi={false}
                classCustom="text-3xl mb-2 transition-transform duration-300 group-hover:scale-110"
              />
              <span className="font-semibold">ساخت فضای کاری جدید</span>
            </button>
          </div>
        ) : (
          // حالت زمانی که هیچ ورک‌اسپیسی وجود ندارد
          <div className="text-center bg-white dark:bg-slate-800 rounded-xl shadow-md p-10">
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              شما هنوز هیچ ورک‌اسپیسی نساخته‌اید یا به آن دعوت نشده‌اید.
            </p>
            <Button
              className="btn btn-primary btn-lg"
              onClick={() => router.push("/workspaces/create")}
            >
              <DIcon icon="fa-plus" cdi={false} classCustom="me-2" />
              ساخت اولین ورک‌اسپیس
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
