// // // مسیر فایل: src/modules/tasks/validation/schema.ts
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "عنوان وظیفه الزامی است."),
  description: z.string().optional().nullable(),
  project: z.object({ id: z.number() }),
  status: z.object({ id: z.number() }),
  priority: z.string().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  assignedUsers: z.array(z.object({ id: z.number() })).optional(),
  assignedTeams: z.array(z.object({ id: z.number() })).optional(), // <-- این خط اضافه شد
});

export const updateTaskSchema = createTaskSchema.partial();
// import { z } from "zod";

// // یک schema پایه برای موجودیت‌های مرتبط که فقط id آنها برای ما مهم است
// const relatedEntitySchema = z
//   .object({
//     id: z.coerce.number(),
//   })
//   .passthrough(); // passthrough به Zod اجازه می‌دهد فیلدهای اضافی را نادیده بگیرد

// export const createTaskSchema = z.object({
//   title: z.string().min(1, "عنوان وظیفه الزامی است."),
//   description: z.string().optional().nullable(),
//   project: relatedEntitySchema,
//   status: relatedEntitySchema,
//   priority: z.string().optional(),
//   startDate: z.string().nullable().optional(),
//   endDate: z.string().nullable().optional(),
//   assignedUsers: z.array(relatedEntitySchema).optional(),
//   assignedTeams: z.array(relatedEntitySchema).optional(),
// });

// // برای آپدیت، تمام فیلدها اختیاری هستند
// export const updateTaskSchema = createTaskSchema.partial();

// import { z } from "zod";

// export const createTaskSchema = z.object({
//   title: z.string().min(1, "عنوان وظیفه الزامی است."),
//   description: z.string().optional(),
//   priority: z.string().optional(),
//   startDate: z.string().optional().nullable(),
//   endDate: z.string().optional().nullable(),
//   project: z.object(
//     { id: z.coerce.number() },
//     { required_error: "انتخاب پروژه الزامی است." }
//   ),
//   status: z.object(
//     { id: z.coerce.number() },
//     { required_error: "انتخاب وضعیت الزامی است." }
//   ),
//   assignedUsers: z.array(z.object({ id: z.number() })).optional(),
//   assignedTeams: z.array(z.object({ id: z.number() })).optional(),
// });

// export const updateTaskSchema = z.object({
//   title: z.string().min(1, "عنوان وظیفه الزامی است.").optional(),
//   description: z.string().optional(),
//   priority: z.string().optional(),
//   startDate: z.date().optional().nullable(),
//   endDate: z.date().optional().nullable(),
//   project: z.object({ id: z.coerce.number() }).optional(),
//   status: z.object({ id: z.coerce.number() }).optional(),
//   assignedUsers: z.array(z.object({ id: z.number() })).optional(),
//   assignedTeams: z.array(z.object({ id: z.number() })).optional(),
//   statusId: z.number().optional(),
// });
