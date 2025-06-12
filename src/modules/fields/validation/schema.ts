import { z } from "zod";

export const createLabelSchema = z.object({
  label: z.string().min(1, "برچسب الزامی است"),
  type: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
});

export const updateLabelSchema = createLabelSchema;