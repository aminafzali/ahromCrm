import { z } from "zod";

export const createLabelSchema = z.object({
  name: z.string().min(1, "نام برچسب الزامی است"),
  color: z.string(),
});

export const updateLabelSchema = createLabelSchema;
