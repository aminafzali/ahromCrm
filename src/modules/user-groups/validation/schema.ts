import { z } from "zod";

export const createUserGroupSchema = z.object({
  name: z.string().min(1, "نام گروه الزامی است"),
  description: z.string().optional(),
  labels: z.array(z.any()).optional(),
  users: z.array(z.any()).optional(),
});

export const updateUserGroupSchema = createUserGroupSchema;