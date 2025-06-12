import { z } from "zod";

export const createNotificationSchema = z.object({
  userId: z.number().min(1, "شناسه کاربر الزامی است"),
  requestId: z.number().optional(),
  title: z.string().min(1, "عنوان اعلان الزامی است"),
  message: z.string().min(1, "متن پیام الزامی است"),
  isRead: z.boolean().default(false),
  sendSms: z.boolean().default(true),
});