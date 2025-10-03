import DIcon from "@/@Client/Components/common/DIcon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReminderCreateForm from "../../components/ReminderCreateForm";
import { useReminder } from "../../hooks/useReminder";

interface CreateReminderPageProps {
  requestId?: number;
  invoiceId?: number;
  paymentId?: number;
  taskId?: number;
  isAdmin?: boolean;
  backUrl?: boolean;
  backLabel?: string;
}

export default function CreateReminderPage({
  requestId,
  invoiceId,
  paymentId,
  taskId,
  isAdmin = false,
  backUrl = true,
  backLabel = "بازگشت",
}: CreateReminderPageProps) {
  const router = useRouter();
  const { create, submitting, error } = useReminder();

  const handleSubmit = async (data: any) => {
    try {
      const result: any = await create(data);

      if (isAdmin) {
        router.push(`/dashboard/reminders/${result.data.id}`);
      } else {
        router.push(`/panel/reminders/${result.data.id}`);
      }
    } catch (error) {
      console.error("Error creating reminder:", error);
    }
  };

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">ایجاد یادآور جدید</h1>

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

      <ReminderCreateForm
        onSubmit={handleSubmit}
        loading={submitting}
        requestId={requestId}
        invoiceId={invoiceId}
        paymentId={paymentId}
        taskId={taskId}
        backUrl={false}
      />
    </div>
  );
}
