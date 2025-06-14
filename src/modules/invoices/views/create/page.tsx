import DIcon from "@/@Client/Components/common/DIcon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import InvoiceForm from "../../components/InvoiceForm";
import { useInvoice } from "../../hooks/useInvoice";

interface CreateInvoicePageProps {
  requestId?: number;
  isAdmin?: boolean;
  backUrl?: boolean;
  backLabel?: string;
}

export default function CreateInvoicePage({
  requestId,
  isAdmin = false,
  backUrl = true,
  backLabel = "بازگشت",
}: CreateInvoicePageProps) {
  const router = useRouter();
  const { create, submitting, error } = useInvoice();

  const handleSubmit = async (data: any) => {
    try {
      const result: any = await create(data);

      if (isAdmin) {
        router.push(`/dashboard/invoices/${result.data.id}`);
      } else {
        router.push(`/panel/invoices/${result.data.id}`);
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">ایجاد فاکتور جدید</h1>

      {backUrl && (
        <Link href="./" className="flex justify-start items-center mb-6">
          <button className="btn btn-ghost">
            <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
            {backLabel}
          </button>
        </Link>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <InvoiceForm onSubmit={handleSubmit} loading={submitting} />
    </div>
  );
}
