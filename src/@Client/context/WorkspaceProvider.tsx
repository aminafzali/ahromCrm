// مسیر فایل: src/@Client/context/WorkspaceProvider.tsx

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

// ... (تایپ‌های شما بدون تغییر) ...
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
interface WorkspaceContextType {
  workspaces: UserWorkspace[];
  activeWorkspace: UserWorkspace | null;
  setActiveWorkspace: (workspace: UserWorkspace | null) => void;
  isLoading: boolean;
  refetchWorkspaces: () => void;
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

  const fetchWorkspaces = useCallback(async () => {
    if (status === "authenticated") {
      setIsLoading(true);
      try {
        const response = await axios.get<UserWorkspace[]>(
          "/api/user/workspaces"
        );
        const userWorkspaces = response.data;
        setWorkspaces(userWorkspaces);
        const storedWorkspaceId = localStorage.getItem("activeWorkspaceId");
        const active = storedWorkspaceId
          ? userWorkspaces.find(
              (ws) => ws.workspaceId.toString() === storedWorkspaceId
            ) || null
          : null;
        const currentActive = active || userWorkspaces[0] || null;
        setActiveWorkspaceState(currentActive);
        if (currentActive)
          localStorage.setItem(
            "activeWorkspaceId",
            currentActive.workspaceId.toString()
          );
        else localStorage.removeItem("activeWorkspaceId");
      } catch (error) {
        console.error("Failed to fetch workspaces:", error);
        localStorage.removeItem("activeWorkspaceId");
        setActiveWorkspaceState(null);
      } finally {
        setIsLoading(false);
      }
    }
    if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const setActiveWorkspace = (workspace: UserWorkspace | null) => {
    // ++ اصلاحیه کلیدی: حذف رفرش صفحه ++
    // ما فقط وضعیت را در state و localStorage آپدیت می‌کنیم.
    setActiveWorkspaceState(workspace);
    if (workspace) {
      localStorage.setItem(
        "activeWorkspaceId",
        workspace.workspaceId.toString()
      );
    } else {
      localStorage.removeItem("activeWorkspaceId");
    }
    // window.location.reload(); <-- این خط حذف می‌شود
  };

  if (status === "loading" || isLoading) return <Loading />;

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

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined)
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  return context;
};
