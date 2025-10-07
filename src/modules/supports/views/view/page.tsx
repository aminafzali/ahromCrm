"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import ChatLinkButton from "@/modules/chat/components/ChatLinkButton";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSupports } from "../../hooks/useSupports";

export default function SupportsDetailPage() {
  const params = useParams() as { id?: string } | null;
  const id = Number(params?.id);
  const router = useRouter();
  const { getById, loading, error, statusCode, remove } = useSupports();
  const [ticket, setTicket] = useState<any | null>(null);

  useEffect(() => {
    if (id) load();
  }, [id]);

  const load = async () => {
    const data = await getById(id);
    if (data) setTicket(data);
  };

  const handleDelete = async () => {
    await remove(id);
    router.push("/dashboard/supports");
  };

  if (!id) return <NotFound />;
  if (loading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  const display = ticket
    ? {
        عنوان: ticket.title,
        وضعیت: ticket.status,
        اولویت: ticket.priority,
        نوع: ticket.type,
        "نمایش به کاربر": ticket.visibleToUser ? "بله" : "خیر",
        "زمان تماس": ticket.contactAt
          ? new Date(ticket.contactAt).toLocaleString("fa-IR")
          : "-",
        "زمان موعد": ticket.dueAt
          ? new Date(ticket.dueAt).toLocaleString("fa-IR")
          : "-",
        کاربر: ticket.user?.displayName || ticket.user?.user?.name || "-",
        "ادمین پیگیر":
          ticket.assignedAdmin?.displayName ||
          ticket.assignedAdmin?.user?.name ||
          "-",
        تیم: ticket.assignedTeam?.name || "-",
        دسته: ticket.category?.name || "-",
      }
    : {};

  return (
    <div className="p-2 md:p-4">
      <DetailPageWrapper
        data={display}
        title="جزئیات تیکت"
        loading={loading}
        error={error}
        onDelete={handleDelete}
        editUrl={`/dashboard/supports/${id}/update`}
      />
      {id ? (
        <div className="mt-4 flex justify-end">
          <ChatLinkButton
            roomName={`SupportTicket#${id}`}
            className="btn btn-outline"
          >
            گفتگو برای این تیکت
          </ChatLinkButton>
        </div>
      ) : null}
    </div>
  );
}
