// مسیر فایل: src/@Client/context/WorkspaceProvider.tsx (نسخه نهایی و کامل)

"use client";

import axios from "axios";
import { useSession } from "next-auth/react";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import Loading from "../Components/common/Loading";

// تعریف تایپ‌ها بر اساس خروجی API که قبلاً ساختیم
interface Role {
  id: number;
  name: string;
}
interface Workspace {
  id: number;
  name: string;
  slug: string;
}
export interface UserWorkspace {
  workspaceId: number;
  userId: number;
  roleId: number;
  workspace: Workspace;
  role: Role;
}

// تعریف تایپ برای مقادیری که Context در اختیار قرار می‌دهد
interface WorkspaceContextType {
  workspaces: UserWorkspace[];
  activeWorkspace: UserWorkspace | null;
  setActiveWorkspace: (workspace: UserWorkspace | null) => void;
  isLoading: boolean;
  refetchWorkspaces: () => void;
}

// ساخت Context
const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

// کامپوننت Provider اصلی
export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const [workspaces, setWorkspaces] = useState<UserWorkspace[]>([]);
  const [activeWorkspace, setActiveWorkspaceState] =
    useState<UserWorkspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkspaces = useCallback(async () => {
    // فقط در صورتی که کاربر احراز هویت شده باشد، درخواست ارسال می‌شود
    if (status === "authenticated") {
      setIsLoading(true);
      try {
        const response = await axios.get<UserWorkspace[]>(
          "/api/user/workspaces"
        );
        const userWorkspaces = response.data;
        setWorkspaces(userWorkspaces);

        const storedWorkspaceId = localStorage.getItem("activeWorkspaceId");

        let active: UserWorkspace | null = null;
        if (storedWorkspaceId) {
          // با || null تضمین می‌کنیم که اگر آیتمی پیدا نشد، مقدار null برگردد نه undefined
          active =
            userWorkspaces.find(
              (ws) => ws.workspaceId.toString() === storedWorkspaceId
            ) || null;
        }

        // اگر ورک‌اسپیس ذخیره شده معتبر نبود، اولین ورک‌اسپیس را به عنوان فعال انتخاب کن
        const currentActive = active || userWorkspaces[0] || null;
        setActiveWorkspaceState(currentActive);

        // اگر ورک‌اسپیس فعالی وجود داشت، آن را در localStorage ذخیره کن
        if (currentActive) {
          localStorage.setItem(
            "activeWorkspaceId",
            currentActive.workspaceId.toString()
          );
        } else {
          // اگر کاربر هیچ ورک‌اسپیسی نداشت، کلید را پاک کن
          localStorage.removeItem("activeWorkspaceId");
        }
      } catch (error) {
        console.error("Failed to fetch workspaces:", error);
        localStorage.removeItem("activeWorkspaceId");
        setActiveWorkspaceState(null);
      } finally {
        setIsLoading(false);
      }
    }

    // اگر کاربر لاگین نکرده بود یا در حال بررسی بود، لودینگ را تمام کن
    if (status === "unauthenticated" || status === "loading") {
      setIsLoading(false);
      setWorkspaces([]);
      setActiveWorkspaceState(null);
    }
  }, [status]);

  useEffect(() => {
    fetchWorkspaces();
  }, [status]); // وابستگی به status صحیح است تا با تغییر وضعیت لاگین، دوباره فراخوانی شود

  // تابعی برای تغییر ورک‌اسپیس فعال
  const setActiveWorkspace = (workspace: UserWorkspace | null) => {
    setActiveWorkspaceState(workspace);
    if (workspace) {
      localStorage.setItem(
        "activeWorkspaceId",
        workspace.workspaceId.toString()
      );
    } else {
      localStorage.removeItem("activeWorkspaceId");
    }
    // رفرش کردن کامل صفحه برای بارگذاری تمام داده‌های مربوط به ورک‌اسپیس جدید
    window.location.reload();
  };

  // تا زمانی که وضعیت لاگین نامشخص است یا در حال دریافت اطلاعات ورک‌اسپیس‌ها هستیم، لودر نمایش بده
  if (status === "loading" || isLoading) {
    return <Loading />;
  }

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        isLoading,
        refetchWorkspaces: fetchWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

// هوک سفارشی برای استفاده آسان از این Context در کامپوننت‌های دیگر
export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
