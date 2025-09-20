import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(1, "نام تیم الزامی است."),
  description: z.string().optional(),
  parentId: z.coerce.number().optional().nullable(), // <-- این خط اضافه شد
  members: z.array(z.object({ id: z.number() })).optional(),
});

export const updateTeamSchema = createTeamSchema.partial();
