"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NewTicketForm from "../../../components/forms/NewTicketForm";
import { useSupportChat } from "../../../hooks/useSupportChat";

interface UpdateSupportTicketPageProps {
  id: number;
  isAdmin?: boolean;
  backUrl: string;
}

export default function UpdatePage({
  id,
  backUrl = "/dashboard/support-chat",
}: UpdateSupportTicketPageProps) {
  const router = useRouter();
  const { repo } = useSupportChat();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTicket();
  }, [id]);

  const loadTicket = async () => {
    try {
      const data = await repo.getTicketById(id);
      setTicket(data);
    } catch (error) {
      console.error("Error loading ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (updatedTicket: any) => {
    try {
      // Note: Update method needs to be implemented in repository
      router.push(backUrl);
    } catch (err) {
      console.error("Error updating ticket:", err);
    }
  };

  const handleCancel = () => {
    router.push(backUrl);
  };

  if (loading) {
    return <Loading />;
  }

  if (!ticket) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">تیکت یافت نشد</p>
        <Link href={backUrl}>
          <button className="btn btn-primary mt-4">بازگشت</button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          ویرایش تیکت #{ticket.ticketNumber}
        </h1>
        <Link href={backUrl} className="flex justify-start items-center">
          <button className="btn btn-ghost">
            <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
            بازگشت
          </button>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 p-6">
        <NewTicketForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}
