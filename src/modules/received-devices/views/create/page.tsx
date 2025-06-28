import DIcon from "@/@Client/Components/common/DIcon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReceivedDevice2Form from "../../components/ReceivedDevice2Form";
import { useReceivedDevice } from "../../hooks/useReceivedDevice";

interface CreateReceivedDevicePageProps {
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
}: CreateReceivedDevicePageProps) {
  const router = useRouter();
  const { create, submitting, error } = useReceivedDevice();

  const handleSubmit = async (data: any) => {
    try {
      const result: any = await create(data);

      if (isAdmin) {
        router.push(`/dashboard/received-devices/${result.data.id}`);
      } else {
        // TODO: این خط نیاز به بررسی دارد
        router.push(`/panel/received-devices/${result.data.id}`);
      }
    } catch (error) {
      console.error("Error creating received-device:", error);
    }
  };

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">ایجاد دستگاه های دریافتی جدید</h1>

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

      <ReceivedDevice2Form onSubmit={handleSubmit} loading={submitting} />
    </div>
  );
}
