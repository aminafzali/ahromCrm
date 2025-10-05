import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { NotificationRepository } from "../repo/NotificationRepository";
import { NotificationWithRelations } from "../types";
import { createNotificationSchema } from "../validation/schema";

export function useNotification() {
  const { activeWorkspace } = useWorkspace();
  const notificationRepo = new NotificationRepository();
  const hook = useCrud<
    NotificationWithRelations,
    z.infer<typeof createNotificationSchema>,
    z.infer<typeof createNotificationSchema>,
    never
  >(notificationRepo);

  const fetchNextNotificationNumber = async () => {
    try {
      if (!activeWorkspace?.id) {
        throw new Error("Workspace ID is not available.");
      }
      // workspaceId را به صورت دستی به تابع پاس می‌دهیم
      const data = await notificationRepo.getNextNotificationNumber(
        activeWorkspace.id
      );
      return data;
    } catch (error) {
      console.error("Failed to fetch next notification number", error);
      return { notificationNumber: 1, notificationNumberName: "NO-2025100001" };
    }
  };

  const getGroupedNotifications = async (params: any) => {
    try {
      if (!activeWorkspace?.id) {
        throw new Error("Workspace ID is not available.");
      }

      const response = await fetch(
        `/api/notifications/grouped?${new URLSearchParams({
          ...params,
          workspaceId: activeWorkspace.id.toString(),
        })}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch grouped notifications");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching grouped notifications:", error);
      throw error;
    }
  };

  return {
    ...hook,
    fetchNextNotificationNumber,
    getGroupedNotifications,
  };
}
