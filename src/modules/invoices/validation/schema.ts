import {
  InvoicePaymentStatus,
  InvoiceStatus,
  InvoiceType,
} from "@prisma/client";
import { z } from "zod";

// اسکیمای آیتم‌های فاکتور
export const invoiceItemSchema = z.object({
  itemName: z.string().min(1, "نام آیتم الزامی است"),
  description: z.string().min(1, "توضیحات آیتم الزامی است"),
  quantity: z.number().min(1, "تعداد باید حداقل 1 باشد"),
  unitPrice: z.number().min(1000, "قیمت باید حداقل 1000 تومان باشد"),
  total: z.number().min(1000, "مبلغ کل باید حداقل 1000 تومان باشد"),
});
// اسکیمای پایه برای فیلدهای مشترک فاکتور
const baseInvoiceSchema = z.object({
  name: z.string().optional().nullable(),
  requestId: z.number().optional().nullable(),
  referenceInvoiceId: z.number().optional().nullable(),
  workspaceUser: z.object(
    { id: z.number() },
    { required_error: "انتخاب مشتری الزامی است." }
  ),
  type: z.nativeEnum(InvoiceType),
  items: z
    .array(invoiceItemSchema)
    .min(1, "حداقل یک آیتم باید وجود داشته باشد"),
  subtotal: z.number(),
  total: z.number(),
  tax: z.number().min(0).optional(),
  taxPercent: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  discountPercent: z.number().min(0).optional(),
  issueDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

// FIX: اسکیمای ساخت فاکتور جدید، حالا شماره فاکتور را از کلاینت دریافت می‌کند
export const createInvoiceSchema = baseInvoiceSchema.extend({
  invoiceNumber: z.number({ required_error: "شماره فاکتور الزامی است." }),
  invoiceNumberName: z
    .string({ required_error: "نام شماره فاکتور الزامی است." })
    .min(1, "نام شماره فاکتور الزامی است."),
});

// اسکیمای ویرایش فاکتور (تمام فیلدها اختیاری هستند)
export const updateInvoiceSchema = baseInvoiceSchema.partial().extend({
  invoiceStatus: z.nativeEnum(InvoiceStatus).optional(),
});

// اسکیمای تغییر وضعیت کلی فاکتور
export const updateInvoiceStatusSchema = z.object({
  invoiceStatus: z.nativeEnum(InvoiceStatus),
  note: z.string().optional(),
});

// اسکیمای تغییر وضعیت پرداخت فاکتور
export const updateInvoicePaymentStatusSchema = z.object({
  paymentStatus: z.nativeEnum(InvoicePaymentStatus),
  paymentDate: z.string().optional().nullable(),
  note: z.string().optional(),
});

// import { z } from "zod";

// export const createInvoiceSchema = z.object({
//   items: z
//     .array(invoiceItemSchema)
//     .min(1, "حداقل یک آیتم باید وجود داشته باشد")
//     .optional(),
//   tax: z.number().min(0, "مالیات نمی‌تواند منفی باشد"),
//   taxPercent: z.number().min(0, "درصد مالیات نمی‌تواند منفی باشد"),
//   discount: z.number().min(0, "تخفیف نمی‌تواند منفی باشد"),
//   discountPercent: z.number().min(0, "درصد تخفیف نمی‌تواند منفی باشد"),
//   subtotal: z.number(),
//   total: z.number(),
//   type: z.string(),
//   name: z.string().optional(),
//   requestId: z.number().optional(),
//   referenceInvoiceId: z.number().optional(),
//   workspaceUser: z.object(
//     { id: z.number().optional() },
//     { required_error: "انتخاب مشتری الزامی است." }
//   ),
//   // فیلدهای تاریخ را برای اعتبارسنجی اضافه می‌کنیم
//   issueDate: z.string().optional().nullable(),
//   dueDate: z.string().optional().nullable(),
//   invoiceNumber: z.number(),
// });

// export const updateInvoiceStatusSchema = z.object({
//   status: z.enum(["PENDING", "PAID", "CANCELLED"]),
//   // paymentDate: z.date().optional(),
//   note: z.string().optional(),
// });
