// // مسیر فایل: src/modules/reminders/components/steps/ModuleSelectionStep.tsx

// import DIcon from "@/@Client/Components/common/DIcon";

// interface ModuleSelectionStepProps {
//   onSelect: (module: "requests" | "invoices") => void;
// }

// const moduleOptions = [
//   { name: "درخواست‌ها", slug: "requests", icon: "fa-file-alt" },
//   { name: "فاکتورها", slug: "invoices", icon: "fa-file-invoice-dollar" },
//   // در آینده می‌توانید ماژول‌های دیگر را اینجا اضافه کنید
// ];

// export default function ModuleSelectionStep({
//   onSelect,
// }: ModuleSelectionStepProps) {
//   return (
//     <div>
//       <h5 className="mb-3">این یادآور مربوط به کدام بخش است؟</h5>
//       <div className="row g-2">
//         {moduleOptions.map((module) => (
//           <div key={module.slug} className="col-md-6">
//             <button
//               type="button"
//               className="btn btn-outline-secondary w-100 p-3"
//               onClick={() => onSelect(module.slug as any)}
//             >
//               <DIcon icon={module.icon} className="h5 mb-0 me-2" />
//               <span>{module.name}</span>
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
