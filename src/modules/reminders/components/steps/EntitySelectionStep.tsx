// // مسیر فایل: src/modules/reminders/components/steps/EntitySelectionStep.tsx

// import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
// import { columns as invoiceColumns } from "@/modules/invoices/data/table";
// import { InvoiceRepository } from "@/modules/invoices/repo/InvoiceRepository";
// import { columns as requestColumns } from "@/modules/requests/data/table";
// import { RequestRepository } from "@/modules/requests/repo/RequestRepository";

// interface EntitySelectionStepProps {
//   module: "requests" | "invoices";
//   onSelect: (entity: any) => void;
// }

// export default function EntitySelectionStep({
//   module,
//   onSelect,
// }: EntitySelectionStepProps) {
//   const handleSelect = (selectedItems: any[]) => {
//     if (selectedItems && selectedItems.length > 0) {
//       onSelect(selectedItems[0]);
//     }
//   };

//   const getModuleConfig = () => {
//     switch (module) {
//       case "requests":
//         return {
//           repo: new RequestRepository(),
//           columns: requestColumns,
//           title: "انتخاب درخواست",
//         };
//       case "invoices":
//         return {
//           repo: new InvoiceRepository(),
//           columns: invoiceColumns,
//           title: "انتخاب فاکتور",
//         };
//       default:
//         return null;
//     }
//   };

//   const config = getModuleConfig();

//   if (!config) {
//     return <p className="text-danger">ماژول انتخاب شده معتبر نیست.</p>;
//   }

//   return (
//     <div>
//       <h5 className="mb-3">{config.title}</h5>
//       <IndexWrapper
//         columns={config.columns}
//         repo={config.repo}
//         selectionMode="single"
//         onSelect={handleSelect}
//         createUrl={false}
//         showIconViews={false}
//         defaultViewMode="table"
//       />
//     </div>
//   );
// }
