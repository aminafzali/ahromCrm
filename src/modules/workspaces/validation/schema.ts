// مسیر فایل: src/modules/workspaces/validation/schema.ts

import { z } from "zod";

// اسکیمای دقیق برای فرم ساخت و ویرایش ورک‌اسپیس
export const workspaceSchema = z.object({
  name: z
    .string()
    .min(3, { message: "نام ورک‌اسپیس باید حداقل ۳ کاراکتر باشد." }),
  slug: z
    .string()
    .min(3, { message: "اسلاگ باید حداقل ۳ کاراکتر باشد." })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message:
        "اسلاگ فقط می‌تواند شامل حروف کوچک انگلیسی، اعداد و خط تیره (-) باشد.",
    }),
});
