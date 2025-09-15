import { z } from "zod";

export const TeamSchema = z.object({
  name: z.string().min(2, { message: "نام تیم باید حداقل 2 کاراکتر باشد." }),
  description: z.string().optional().nullable(),
  members: z
    .array(z.number())
    .min(1, { message: "تیم باید حداقل یک عضو داشته باشد." }),
});
