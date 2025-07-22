import { z } from "zod";

export const createActualServiceSchema = z.object({
  name: z.string().min(1, "نام خدمت الزامی است."),
  price: z.coerce.number().min(0, "قیمت نمی‌تواند منفی باشد."),
  description: z.string().optional(),

  // --- شروع اصلاحات ---
  // به جای serviceTypeId، خود آبجکت serviceType را به عنوان ورودی می‌پذیریم
  // این دقیقاً همان چیزی است که کامپوننت dataTable شما از فرم برمی‌گرداند
  serviceType: z.object(
    { id: z.number() },
    { required_error: "انتخاب نوع خدمت الزامی است." }
  ),
  // --- پایان اصلاحات ---
});

// نیازی به transform نیست چون BaseService این کار را انجام می‌دهد.
// فقط مطمئن شوید updateSchema نیز منطق مشابهی دارد یا به درستی مدیریت می‌شود.
export const updateActualServiceSchema = createActualServiceSchema.partial();
