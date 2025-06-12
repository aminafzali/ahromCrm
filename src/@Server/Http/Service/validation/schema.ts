import { z } from "zod";

export const createReminderSchema = z.object({
  title: z.string().min(1, "عنوان یادآوری الزامی است"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "تاریخ یادآوری الزامی است"),
  entityId: z.number().min(1, "شناسه موجودیت الزامی است"),
  entityType: z.string().min(1, "نوع موجودیت الزامی است"),
  userId: z.number().min(1, "شناسه کاربر الزامی است"),
});