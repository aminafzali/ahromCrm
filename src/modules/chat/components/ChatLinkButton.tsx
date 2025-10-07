"use client";

import { useRouter } from "next/navigation";
import { useChat } from "../hooks/useChat";

interface Props {
  roomName: string;
  className?: string;
  children?: React.ReactNode;
}

export default function ChatLinkButton({
  roomName,
  className,
  children,
}: Props) {
  const { repo } = useChat();
  const router = useRouter();

  const open = async () => {
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
      className={className || "btn btn-outline"}
      onClick={open}
    >
      {children || "گفتگو"}
    </button>
  );
}
