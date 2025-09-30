import { z } from "zod";

export const createLabelSchema = z.object({
  id: z.number(),
});

export const createUserSchema = z.object({
  name: z.string().min(1, "نام الزامی است"),
  phone: z.string().length(11, "شماره تماس معتبر نیست"),
  address: z.string().optional(),
  labels: z.array(z.any()).optional(),
  groups: z.array(z.any()).optional(),
});

export const updateUserStatusSchema = z.object({
  status: z.string().min(1, "وضعیت الزامی است"),
});