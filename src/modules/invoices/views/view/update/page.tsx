// "use client";

// import DIcon from "@/@Client/Components/common/DIcon";
// import Loading from "@/@Client/Components/common/Loading";
// import NotFound from "@/@Client/Components/common/NotFound";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import InvoiceForm from "../../../components/InvoiceForm";
// import { useInvoice } from "../../../hooks/useInvoice";

// interface UpdateInvoicePageProps {
//   id: number;
// }

// export default function UpdateInvoicePage({ id }: UpdateInvoicePageProps) {
//   const router = useRouter();
//   const {
//     getById,
//     update,
//     submitting: loading,
//     error,
//     success,
//     loading: dataLoading,
//     statusCode,
//   } = useInvoice();
//   const [invoiceData, setInvoiceData] = useState<any>(null);

//   useEffect(() => {
//     fetchData();
//   }, [id]);

//   const fetchData = async () => {
//     try {
//       const data = await getById(id);
//       setInvoiceData(data);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   const handleSubmit = async (data: any) => {
//     try {
//       await update(id, data);
//       router.push("/dashboard/invoices");
//     } catch (error) {
//       console.error("Error updating invoice:", error);
//     }
//   };

//   if (dataLoading) return <Loading />;
//   if (statusCode === 404) return <NotFound />;

//   return (
//     <>
//       <h2 className="text-xl font-bold mb-4">ویرایش فاکتور</h2>

//       <Link href="./" className="flex justify-start items-center mb-6">
//         <button className="btn btn-ghost">
//           <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
//           {"بازگشت"}
//         </button>
//       </Link>
//       <InvoiceForm
//         onSubmit={handleSubmit}
//         defaultValues={invoiceData}
//         loading={loading}
//       />
//     </>
//   );
// }
