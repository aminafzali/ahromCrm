// // مسیر فایل: src/modules/reminders/components/steps/DetailsFormStep.tsx

// import { useFormContext } from "react-hook-form";

// export default function DetailsFormStep() {
//   const {
//     register,
//     formState: { errors },
//   } = useFormContext();

//   const notificationChannels = [
//     { value: "ALL", label: "همه کانال‌ها" },
//     { value: "IN_APP", label: "داخل برنامه" },
//     { value: "SMS", label: "پیامک" },
//     { value: "EMAIL", label: "ایمیل" },
//   ];

//   return (
//     <div className="space-y-4">
//       <h5 className="mb-3">جزئیات یادآور را وارد کنید</h5>
//       <div className="form-group">
//         <label htmlFor="title" className="form-label">
//           عنوان یادآور <span className="text-danger">*</span>
//         </label>
//         <input
//           id="title"
//           type="text"
//           className={`form-control ${errors.title ? "is-invalid" : ""}`}
//           {...register("title")}
//         />
//         {errors.title && (
//           <div className="invalid-feedback">
//             {errors.title.message as string}
//           </div>
//         )}
//       </div>

//       <div className="form-group">
//         <label htmlFor="dueDate" className="form-label">
//           تاریخ و زمان یادآوری <span className="text-danger">*</span>
//         </label>
//         <input
//           id="dueDate"
//           type="datetime-local"
//           className={`form-control ${errors.dueDate ? "is-invalid" : ""}`}
//           {...register("dueDate")}
//         />
//         {errors.dueDate && (
//           <div className="invalid-feedback">
//             {errors.dueDate.message as string}
//           </div>
//         )}
//       </div>

//       <div className="form-group">
//         <label htmlFor="notificationChannels" className="form-label">
//           ارسال از طریق
//         </label>
//         <select
//           id="notificationChannels"
//           className="form-control"
//           {...register("notificationChannels")}
//         >
//           {notificationChannels.map((channel) => (
//             <option key={channel.value} value={channel.value}>
//               {channel.label}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="form-group">
//         <label htmlFor="description" className="form-label">
//           توضیحات (اختیاری)
//         </label>
//         <textarea
//           id="description"
//           className="form-control"
//           rows={3}
//           {...register("description")}
//         ></textarea>
//       </div>
//     </div>
//   );
// }
