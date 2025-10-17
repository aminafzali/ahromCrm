// مسیر فایل: src/@Client/context/WorkspaceProvider.tsx
"use client";

import apiClient from "@/@Client/lib/axios";
import { useSession } from "next-auth/react";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * WorkspaceProvider (بازنویسی‌شده)
 *
 * - هنگام تغییر statusِ session، چند تلاش متوالی (با تأخیر کوتاه) برای fetchWorkspaces انجام می‌دهد.
 * - fetchWorkspaces مقدار را برمی‌گرداند (Promise<UserWorkspace[]>).
 * - refetchWorkspaces همان fetchWorkspaces است و قابل استفاده از صفحات است.
 * - لاگ‌های مفصل برای دیباگ اضافه شده‌اند.
 */

/* ===== تایپ‌ها ===== */
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
  id: number;
  workspaceId: number;
  userId: number;
  roleId: number | null;
  workspace: Workspace;
  role: Role;
}

interface WorkspaceContextType {
  workspaces: UserWorkspace[];
  activeWorkspace: UserWorkspace | null;
  setActiveWorkspace: (workspace: UserWorkspace | null) => void;
  isLoading: boolean;
  refetchWorkspaces: () => Promise<UserWorkspace[]>;
  addWorkspace: (workspace: UserWorkspace) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { status } = useSession();
  const [workspaces, setWorkspaces] = useState<UserWorkspace[]>([]);
  const [activeWorkspace, setActiveWorkspaceState] =
    useState<UserWorkspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ref برای شمارش تلاش‌های خودکار پس از authenticated
  const authRefetchAttempts = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /* ===== addWorkspace (optimistic) ===== */
  const addWorkspace = useCallback((workspace: UserWorkspace) => {
    setWorkspaces((prev) => {
      if (!prev.find((ws) => ws.workspaceId === workspace.workspaceId)) {
        return [workspace, ...prev];
      }
      return prev;
    });
    setActiveWorkspaceState((prev) => prev || workspace);
    try {
      localStorage.setItem(
        "activeWorkspaceId",
        workspace.workspaceId.toString()
      );
      localStorage.setItem("workspaceUserId", workspace.id.toString());
      localStorage.setItem("workspaceId", workspace.workspaceId.toString());
    } catch {}
  }, []);

  /* ===== fetchWorkspaces =====
     returns UserWorkspace[] always (or []).
     logs for debug.
  */
  const fetchWorkspaces = useCallback(async (): Promise<UserWorkspace[]> => {
    console.log("[WorkspaceProvider] fetchWorkspaces start (status):", status);
    if (status === "loading") {
      console.log("[WorkspaceProvider] session still loading — skipping fetch");
      setIsLoading(true);
      return [];
    }

    if (status !== "authenticated") {
      console.log(
        "[WorkspaceProvider] user not authenticated — clearing state"
      );
      setWorkspaces([]);
      setActiveWorkspaceState(null);
      try {
        localStorage.removeItem("activeWorkspaceId");
      } catch {}
      setIsLoading(false);
      return [];
    }

    setIsLoading(true);
    try {
      const res = await apiClient.get<UserWorkspace[]>("/user/workspaces");
      const userWorkspaces = res.data || [];
      console.log(
        "[WorkspaceProvider] fetchWorkspaces result length =",
        userWorkspaces.length
      );

      // set state only if changed (simple check)
      setWorkspaces((prev) => {
        try {
          const prevLen = Array.isArray(prev) ? prev.length : 0;
          const newLen = Array.isArray(userWorkspaces)
            ? userWorkspaces.length
            : 0;
          if (prevLen === 0 && newLen === 0) {
            // keep same ref to avoid unnecessary re-renders
            return prev;
          }
          if (prevLen > 0 && newLen > 0) {
            const prevIds = prev.map((t) => t.workspaceId).join(",");
            const newIds = userWorkspaces.map((t) => t.workspaceId).join(",");
            if (prevIds === newIds && prevLen === newLen) {
              return prev;
            }
          }
        } catch (e) {
          // fallthrough to set
        }
        return userWorkspaces;
      });

      // determine active workspace
      const storedWorkspaceId = (() => {
        try {
          return localStorage.getItem("activeWorkspaceId");
        } catch {
          return null;
        }
      })();

      const active = storedWorkspaceId
        ? userWorkspaces.find(
            (uw) => uw.workspaceId.toString() === storedWorkspaceId
          ) || null
        : null;

      const currentActive = active || userWorkspaces[0] || null;
      setActiveWorkspaceState(currentActive);

      if (currentActive) {
        try {
          localStorage.setItem(
            "activeWorkspaceId",
            currentActive.workspaceId.toString()
          );
          localStorage.setItem("workspaceUserId", currentActive.id.toString());
          localStorage.setItem(
            "workspaceId",
            currentActive.workspaceId.toString()
          );
        } catch {}
      } else {
        try {
          localStorage.removeItem("activeWorkspaceId");
        } catch {}
      }

      return userWorkspaces;
    } catch (err) {
      console.error("[WorkspaceProvider] fetchWorkspaces error:", err);
      // clear state safely
      setWorkspaces((prev) => (prev.length === 0 ? prev : []));
      setActiveWorkspaceState((prev) => null);
      try {
        localStorage.removeItem("activeWorkspaceId");
      } catch {}
      return [];
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [status]);

  /* ===== automatic refetch when session becomes authenticated =====
     - immediate fetch + up to 5 retries with short backoff to cover cookie/token race
     - avoids infinite loop using authRefetchAttempts
  */
  useEffect(() => {
    let cancelled = false;
    const runAutoRefetch = async () => {
      if (status === "authenticated") {
        console.log(
          "[WorkspaceProvider] status became authenticated, starting auto-refetch"
        );
        authRefetchAttempts.current = 0;
        while (!cancelled && authRefetchAttempts.current < 5) {
          authRefetchAttempts.current += 1;
          const attempt = authRefetchAttempts.current;
          console.log(`[WorkspaceProvider] auto-refetch attempt ${attempt}`);
          const list = await fetchWorkspaces();
          if (Array.isArray(list) && list.length > 0) {
            console.log(
              "[WorkspaceProvider] auto-refetch succeeded, got items:",
              list.length
            );
            break;
          }
          const delayMs = Math.min(200 * attempt, 800);
          await new Promise((r) => setTimeout(r, delayMs));
        }
      } else if (status === "unauthenticated") {
        // reset attempts when user logs out
        console.log("[WorkspaceProvider] status unauthenticated, resetting");
        authRefetchAttempts.current = 0;
        // Keep isLoading true - don't show empty state until we know auth status is final
      } else if (status === "loading") {
        console.log("[WorkspaceProvider] status is loading");
        setIsLoading(true);
      }
    };

    runAutoRefetch();

    return () => {
      cancelled = true;
    };
  }, [status, fetchWorkspaces]);

  /* ===== setActiveWorkspace helper ===== */
  const setActiveWorkspace = (workspace: UserWorkspace | null) => {
    setActiveWorkspaceState(workspace);
    try {
      if (workspace) {
        localStorage.setItem(
          "activeWorkspaceId",
          workspace.workspaceId.toString()
        );
        localStorage.setItem("workspaceUserId", workspace.id.toString());
        localStorage.setItem("workspaceId", workspace.workspaceId.toString());
      } else {
        localStorage.removeItem("activeWorkspaceId");
        localStorage.removeItem("workspaceUserId");
        localStorage.removeItem("workspaceId");
      }
    } catch {}
  };

  /* ===== Provider render (do not block children) ===== */
  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        isLoading,
        refetchWorkspaces: fetchWorkspaces,
        addWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined)
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  return context;
};

// "use client";

// import axios from "axios";
// import { useSession } from "next-auth/react";
// import {
//   createContext,
//   ReactNode,
//   useCallback,
//   useContext,
//   useEffect,
//   useState,
// } from "react";

// // تایپ‌ها
// interface Role {
//   id: number;
//   name: string;
// }
// interface Workspace {
//   id: number;
//   name: string;
//   slug: string;
// }
// export interface UserWorkspace {
//   id: number;
//   workspaceId: number;
//   userId: number;
//   roleId: number;
//   workspace: Workspace;
//   role: Role;
// }
// interface WorkspaceContextType {
//   workspaces: UserWorkspace[];
//   activeWorkspace: UserWorkspace | null;
//   setActiveWorkspace: (workspace: UserWorkspace | null) => void;
//   isLoading: boolean;
//   refetchWorkspaces: () => Promise<UserWorkspace[]>;
//   addWorkspace: (workspace: UserWorkspace) => void;
// }

// const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
//   undefined
// );

// export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
//   const { status } = useSession();
//   const [workspaces, setWorkspaces] = useState<UserWorkspace[]>([]);
//   const [activeWorkspace, setActiveWorkspaceState] =
//     useState<UserWorkspace | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   // افزودن خوش‌بینانه یک ورک‌اسپیس به لیست محلی
//   const addWorkspace = useCallback((workspace: UserWorkspace) => {
//     setWorkspaces((prev) => {
//       if (!prev.find((ws) => ws.workspaceId === workspace.workspaceId)) {
//         return [workspace, ...prev];
//       }
//       return prev;
//     });
//     setActiveWorkspaceState((prev) => prev || workspace);
//     try {
//       localStorage.setItem(
//         "activeWorkspaceId",
//         workspace.workspaceId.toString()
//       );
//     } catch {}
//   }, []);

//   // fetchWorkspaces حالا لیست را برمی‌گرداند برای caller
//   const fetchWorkspaces = useCallback(async (): Promise<UserWorkspace[]> => {
//     // اگر هنوز وضعیت session در حال لود است، صبر کن تا useEffect بعدی اجرا شود
//     if (status === "loading") {
//       return [];
//     }

//     if (status === "authenticated") {
//       setIsLoading(true);
//       try {
//         const response = await axios.get<UserWorkspace[]>(
//           "/api/user/workspaces"
//         );
//         const userWorkspaces = response.data || [];
//         setWorkspaces(userWorkspaces);

//         const storedWorkspaceId = (() => {
//           try {
//             return localStorage.getItem("activeWorkspaceId");
//           } catch {
//             return null;
//           }
//         })();

//         const active = storedWorkspaceId
//           ? userWorkspaces.find(
//               (ws) => ws.workspaceId.toString() === storedWorkspaceId
//             ) || null
//           : null;

//         const currentActive = active || userWorkspaces[0] || null;
//         setActiveWorkspaceState(currentActive);

//         if (currentActive) {
//           try {
//             localStorage.setItem(
//               "activeWorkspaceId",
//               currentActive.workspaceId.toString()
//             );
//           } catch {}
//         } else {
//           try {
//             localStorage.removeItem("activeWorkspaceId");
//           } catch {}
//         }

//         return userWorkspaces;
//       } catch (error) {
//         console.error("Failed to fetch workspaces:", error);
//         try {
//           localStorage.removeItem("activeWorkspaceId");
//         } catch {}
//         setWorkspaces([]);
//         setActiveWorkspaceState(null);
//         return [];
//       } finally {
//         setIsLoading(false);
//       }
//     }

//     // unauthenticated
//     setWorkspaces([]);
//     setActiveWorkspaceState(null);
//     try {
//       localStorage.removeItem("activeWorkspaceId");
//     } catch {}
//     setIsLoading(false);
//     return [];
//   }, [status]);

//   useEffect(() => {
//     // فراخوانی اولیه
//     fetchWorkspaces();
//     // هدف: دوباره زمانی که status تغییر کند fetch جدید انجام شود.
//   }, [fetchWorkspaces]);

//   const setActiveWorkspace = (workspace: UserWorkspace | null) => {
//     setActiveWorkspaceState(workspace);
//     try {
//       if (workspace) {
//         localStorage.setItem(
//           "activeWorkspaceId",
//           workspace.workspaceId.toString()
//         );
//       } else {
//         localStorage.removeItem("activeWorkspaceId");
//       }
//     } catch {}
//   };

//   // توجه: دیگر ظاهراً نباید Provider صفحه را مسدود کند.
//   // همیشه children را برگردانیم — کامپوننت‌های مصرف‌کننده می‌توانند از isLoading استفاده کنند.
//   return (
//     <WorkspaceContext.Provider
//       value={{
//         workspaces,
//         activeWorkspace,
//         setActiveWorkspace,
//         isLoading,
//         refetchWorkspaces: fetchWorkspaces,
//         addWorkspace,
//       }}
//     >
//       {children}
//     </WorkspaceContext.Provider>
//   );
// };

// export const useWorkspace = () => {
//   const context = useContext(WorkspaceContext);
//   if (context === undefined)
//     throw new Error("useWorkspace must be used within a WorkspaceProvider");
//   return context;
// };

// "use client";

// import axios from "axios";
// import { useSession } from "next-auth/react";
// import {
//   createContext,
//   ReactNode,
//   useCallback,
//   useContext,
//   useEffect,
//   useState,
// } from "react";
// import Loading from "../Components/common/Loading";

// // ... (تایپ‌های شما بدون تغییر) ...
// interface Role {
//   id: number;
//   name: string;
// }
// interface Workspace {
//   id: number;
//   name: string;
//   slug: string;
// }
// export interface UserWorkspace {
//   id: number;
//   workspaceId: number;
//   userId: number;
//   roleId: number;
//   workspace: Workspace;
//   role: Role;
// }
// interface WorkspaceContextType {
//   workspaces: UserWorkspace[];
//   activeWorkspace: UserWorkspace | null;
//   setActiveWorkspace: (workspace: UserWorkspace | null) => void;
//   isLoading: boolean;
//   refetchWorkspaces: () => void;
// }

// const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
//   undefined
// );

// export const WorkspaceProvider = ({
//   children,
// }: // initialWorkspace,
// {
//   children: ReactNode;
//   //initialWorkspace?: Workspace;
// }) => {
//   const { status } = useSession();
//   const [workspaces, setWorkspaces] = useState<UserWorkspace[]>([]);
//   const [activeWorkspace, setActiveWorkspaceState] =
//     useState<UserWorkspace | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   //useState<Workspace | null>(initialWorkspace || null); // مقدار اولیه از پراپ گرفته می‌شود
//   //const [loading, setLoading] = useState<boolean>(!initialWorkspace); // اگر ورک‌اسپیس اولیه داشتیم، لودینگ false است

//   const fetchWorkspaces = useCallback(async () => {
//     // اگر در صفحه عمومی بودیم و ورک‌اسپیس اولیه داشتیم، دیگر واکشی نکن
//     // if (initialWorkspace) {
//     //   return;
//     // }

//     if (status === "authenticated") {
//       setIsLoading(true);
//       try {
//         const response = await axios.get<UserWorkspace[]>(
//           "/api/user/workspaces"
//         );
//         const userWorkspaces = response.data;
//         setWorkspaces(userWorkspaces);
//         const storedWorkspaceId = localStorage.getItem("activeWorkspaceId");
//         const active = storedWorkspaceId
//           ? userWorkspaces.find(
//               (ws) => ws.workspaceId.toString() === storedWorkspaceId
//             ) || null
//           : null;
//         const currentActive = active || userWorkspaces[0] || null;
//         setActiveWorkspaceState(currentActive);
//         if (currentActive)
//           localStorage.setItem(
//             "activeWorkspaceId",
//             currentActive.workspaceId.toString()
//           );
//         else localStorage.removeItem("activeWorkspaceId");
//       } catch (error) {
//         console.error("Failed to fetch workspaces:", error);
//         localStorage.removeItem("activeWorkspaceId");
//         setActiveWorkspaceState(null);
//       } finally {
//         setIsLoading(false);
//       }
//     }
//     if (status === "unauthenticated") {
//       setIsLoading(false);
//     }
//   }, [
//     status,
//    //  initialWorkspace
//     ]);

//   useEffect(() => {
//     fetchWorkspaces();
//   }, [fetchWorkspaces]);

//   const setActiveWorkspace = (workspace: UserWorkspace | null) => {
//     // ++ اصلاحیه کلیدی: حذف رفرش صفحه ++
//     // ما فقط وضعیت را در state و localStorage آپدیت می‌کنیم.
//     setActiveWorkspaceState(workspace);
//     if (workspace) {
//       localStorage.setItem(
//         "activeWorkspaceId",
//         workspace.workspaceId.toString()
//       );
//     } else {
//       localStorage.removeItem("activeWorkspaceId");
//     }
//     // window.location.reload(); <-- این خط حذف می‌شود
//   };

//   if (status === "loading" || isLoading) return <Loading />;

//   return (
//     <WorkspaceContext.Provider
//       value={{
//         workspaces,
//         activeWorkspace,
//         setActiveWorkspace,
//         isLoading,
//         refetchWorkspaces: fetchWorkspaces,
//       }}
//     >
//       {children}
//     </WorkspaceContext.Provider>
//   );
// };

// export const useWorkspace = () => {
//   const context = useContext(WorkspaceContext);
//   if (context === undefined)
//     throw new Error("useWorkspace must be used within a WorkspaceProvider");
//   return context;
// };
