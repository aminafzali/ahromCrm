// // مسیر فایل: src/modules/teams/validation/schema.ts
import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(1, "نام تیم الزامی است."),
  description: z.string().optional(),
  // ✅ اصلاح: استفاده از z.preprocess برای تبدیل رشته خالی ("") به null
  parentId: z.preprocess(
    (val) => (val === "" ? null : val), // اگر رشته خالی بود، به null تبدیل کن
    z.coerce.number().optional().nullable() // سپس به عدد تبدیل کن (که برای null هم کار می‌کند)
  ),
  members: z.array(z.object({ id: z.number() })).optional(),
});

export const updateTeamSchema = createTeamSchema.partial();
// import { z } from "zod";

// export const createTeamSchema = z.object({
//   name: z.string().min(1, "نام تیم الزامی است."),
//   description: z.string().optional(),
//   parentId: z.coerce.number().optional().nullable(), // <-- این خط اضافه شد
//   members: z.array(z.object({ id: z.number() })).optional(),
// });

// export const updateTeamSchema = createTeamSchema.partial();
