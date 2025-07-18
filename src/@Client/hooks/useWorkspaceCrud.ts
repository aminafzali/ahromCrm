// مسیر فایل: src/@Client/hooks/useWorkspaceCrud.ts
import { WorkspaceRepository } from "../repo/WorkspaceRepository";
import { useCrud } from "./useCrud";
export function useWorkspaceCrud() {
  const repo = new WorkspaceRepository();
  return useCrud(repo);
}
