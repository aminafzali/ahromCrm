import { z } from "zod";

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "توضیحات آیتم الزامی است"),
  quantity: z.number().min(1, "تعداد باید حداقل 1 باشد"),
  price: z.number().min(1000, "قیمت باید حداقل 1000 تومان باشد"),
  total: z.number().min(1000, "مبلغ کل باید حداقل 1000 تومان باشد"),
});

export const createInvoiceSchema = z.object({
  items: z
    .array(invoiceItemSchema)
    .min(1, "حداقل یک آیتم باید وجود داشته باشد")
    .optional(),
  tax: z.number().min(0, "مالیات نمی‌تواند منفی باشد"),
  taxPercent: z.number().min(0, "درصد مالیات نمی‌تواند منفی باشد"),
  discount: z.number().min(0, "تخفیف نمی‌تواند منفی باشد"),
  discountPercent: z.number().min(0, "درصد تخفیف نمی‌تواند منفی باشد"),
  subtotal: z.number(),
  total: z.number(),
  type: z.string(),
  name: z.string().optional(),
  requestId: z.number().optional(),
  workspaceUser: z.object(
    { id: z.number().optional() },
    { required_error: "انتخاب مشتری الزامی است." }
  ),
 // فیلدهای تاریخ را برای اعتبارسنجی اضافه می‌کنیم
  issueDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

export const updateInvoiceStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "CANCELLED"]),
  // paymentDate: z.date().optional(),
  note: z.string().optional(),
});
