// // src/modules/reminders/data/form.tsx

// import { FormField } from "@/@Client/types/form";
// import SelectUserForReminder from "../components/SelectUserForReminder";

// export const reminderFormFields: FormField[] = [
//   {
//     name: "title",
//     label: "عنوان یادآور",
//     type: "text", // نوع صحیح
//     placeholder: "مثلا: تماس با مشتری برای پیگیری فاکتور",
//     required: true,
//     className: "col-span-12",
//   },
//   {
//     name: "userId",
//     label: "برای کاربر",
//     type: "select", // ** اصلاحیه: استفاده از نوع 'select' **
//     required: true,
//     className: "col-span-12 md:col-span-6",
//     // پراپ render به CreateWrapper می‌گوید که به جای select پیش‌فرض، این کامپوننت را نمایش بده
//     render: (field) => (
//       <SelectUserForReminder
//         value={field.value}
//         onChange={(value) => field.onChange(value)}
//       />
//     ),
//   },
//   {
//     name: "dueDate",
//     label: "تاریخ و زمان یادآوری",
//     type: "date", // ** اصلاحیه: استفاده از نوع 'date' **
//     required: true,
//     className: "col-span-12 md:col-span-6",
//   },
//   {
//     name: "description",
//     label: "توضیحات (اختیاری)",
//     type: "textarea", // نوع صحیح
//     placeholder: "جزئیات بیشتر مانند شماره فاکتور یا علت یادآوری...",
//     className: "col-span-12",
//   },
// ];
