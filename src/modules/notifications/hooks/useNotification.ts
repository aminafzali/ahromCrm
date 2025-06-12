import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { NotificationRepository } from "../repo/NotificationRepository";
import { NotificationWithRelations } from "../types";
import { createNotificationSchema } from "../validation/schema";

export function useNotification() {
  const notificationRepo = new NotificationRepository();
  const hook = useCrud<
    NotificationWithRelations,
    z.infer<typeof createNotificationSchema>,
    z.infer<typeof createNotificationSchema>,
    never
  >(notificationRepo);

  return {
    ...hook,
  };
}