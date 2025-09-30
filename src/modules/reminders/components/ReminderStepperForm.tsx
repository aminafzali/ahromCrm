// // مسیر فایل: src/modules/reminders/components/ReminderStepperForm.tsx

// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { FormProvider, useForm } from "react-hook-form";
// import { z } from "zod";
// import { useReminder } from "../hooks/useReminder";
// import { reminderSchema } from "../validation/schema";
// import DetailsFormStep from "./steps/DetailsFormStep";
// import EntitySelectionStep from "./steps/EntitySelectionStep";
// import ModuleSelectionStep from "./steps/ModuleSelectionStep";

// export default function ReminderStepperForm() {
//   const router = useRouter();
//   const { create, submitting } = useReminder();

//   const [step, setStep] = useState(1);
//   const [selectedModule, setSelectedModule] = useState<
//     "requests" | "invoices" | null
//   >(null);

//   const methods = useForm<z.infer<typeof reminderSchema>>({
//     resolver: zodResolver(reminderSchema),
//   });

//   const { handleSubmit, setValue } = methods;

//   const handleModuleSelect = (module: "requests" | "invoices") => {
//     setSelectedModule(module);
//     setValue("entityType", module === "requests" ? "Request" : "Invoice");
//     setStep(2);
//   };

//   const handleEntitySelect = (entity: any) => {
//     setValue("entityId", entity.id);
//     setValue("userId", entity.userId); // userId از آیتم انتخاب شده گرفته می‌شود
//     setStep(3);
//   };

//   const handleSave = async (data: z.infer<typeof reminderSchema>) => {
//     const result = await create(data);
//     if (result) {
//       router.push("/dashboard/reminders");
//     }
//   };

//   return (
//     // FormProvider به ما اجازه می‌دهد state فرم را بین کامپوننت‌های فرزند به اشتراک بگذاریم
//     <FormProvider {...methods}>
//       <form onSubmit={handleSubmit(handleSave)} noValidate>
//         {step === 1 && <ModuleSelectionStep onSelect={handleModuleSelect} />}
//         {step === 2 && selectedModule && (
//           <EntitySelectionStep
//             module={selectedModule}
//             onSelect={handleEntitySelect}
//           />
//         )}
//         {step === 3 && <DetailsFormStep />}

//         <div className="d-flex justify-content-end gap-2 pt-4 mt-4 border-top">
//           {step > 1 && (
//             <button
//               type="button"
//               className="btn btn-light"
//               onClick={() => setStep(step - 1)}
//               disabled={submitting}
//             >
//               مرحله قبل
//             </button>
//           )}
//           {step === 3 && (
//             <button
//               type="submit"
//               className="btn btn-primary"
//               disabled={submitting}
//             >
//               {submitting ? "در حال ذخیره..." : "ایجاد یادآور"}
//             </button>
//           )}
//         </div>
//       </form>
//     </FormProvider>
//   );
// }
