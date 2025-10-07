"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useChat } from "../hooks/useChat";

interface Props {
  workspaceId: number;
  className?: string;
}

export default function PanelSupportButton({ workspaceId, className }: Props) {
  const { data: session, status } = useSession();
  const { repo } = useChat();
  const router = useRouter();

  const open = async () => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const userId = Number(session.user.id as any);
    const roomName = `Support#${workspaceId}#${userId}`;

    const found: any = await repo.getAll({
      page: 1,
      limit: 1,
      filters: { name: roomName },
    });
    const existing = found?.data?.[0];
    if (existing?.id) {
      router.push(`/dashboard/chat/${existing.id}`);
      return;
    }
    const created: any = await repo.create({ name: roomName });
    const newId = created?.data?.id || created?.id;
    if (newId) router.push(`/dashboard/chat/${newId}`);
  };

  return (
    <button
      type="button"
      className={className || "btn btn-ghost"}
      onClick={open}
    >
      گفتگو با پشتیبانی
    </button>
  );
}
