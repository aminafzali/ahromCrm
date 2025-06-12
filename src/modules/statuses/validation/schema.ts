import { z } from "zod";

export const createStatusSchema = z.object({
  name: z.string().min(1, "نام وضعیت الزامی است"),
  color: z.string().min(1, "رنگ الزامی است"),
});