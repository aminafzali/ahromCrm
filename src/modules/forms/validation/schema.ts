import { z } from "zod";

export const formFieldOptionSchema = z.object({
  label: z.string().min(1, "عنوان گزینه الزامی است"),
  value: z.string().min(1, "مقدار گزینه الزامی است"),
});

export const formFieldSchema = z.object({
  key: z.string().optional(),
  label: z.string().optional(),
  type: z.string().min(1, "نوع فیلد الزامی است"),
  input: z.boolean().optional(),
  required: z.boolean().optional(),
  validate: z.object({
    required: z.boolean().optional(),
    pattern: z.string().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  defaultValue: z.any().optional(),
  placeholder: z.string().optional(),
  description: z.string().optional(),
  multiple: z.boolean().optional(),
  values: z.array(formFieldOptionSchema).optional(),
});

export const formFieldSchema2 = z.object({
  type: z.any(),
  required: z.boolean().optional(),
});

export const createFormSchema = z.object({
  name: z.string().min(1, "نام فرم الزامی است"),
  description: z.string().optional()
});

export const updateFormSchema = createFormSchema.partial();

export const formSubmissionSchema = z.object({
  formId: z.number(),
  data: z.record(z.any()),
});