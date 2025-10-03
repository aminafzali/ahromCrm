import DIcon from "@/@Client/Components/common/DIcon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NotificationCreateForm from "../../components/NotificationCreateForm";
import { useNotification } from "../../hooks/useNotification";

interface CreateNotificationPageProps {
  requestId?: number;
  invoiceId?: number;
  paymentId?: number;
  reminderId?: number;
  isAdmin?: boolean;
  backUrl?: boolean;
  backLabel?: string;
}

export default function CreateNotificationPage({
  requestId,
  invoiceId,
  paymentId,
  reminderId,
  isAdmin = false,
  backUrl = true,
  backLabel = "بازگشت",
}: CreateNotificationPageProps) {
  const router = useRouter();
  const { create, submitting, error } = useNotification();

  const handleSubmit = async (data: any) => {
    try {
      const result: any = await create(data);

      if (isAdmin) {
        router.push(`/dashboard/notifications/${result.data.id}`);
      } else {
        router.push(`/panel/notifications/${result.data.id}`);
      }
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">ایجاد اعلان جدید</h1>

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

      <NotificationCreateForm
        onSubmit={handleSubmit}
        loading={submitting}
        requestId={requestId}
        invoiceId={invoiceId}
        paymentId={paymentId}
        reminderId={reminderId}
        backUrl={false}
      />
    </div>
  );
}
