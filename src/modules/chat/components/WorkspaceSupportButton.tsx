"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useChat } from "../hooks/useChat";

interface Props {
  workspaceId: number;
  slug?: string;
  className?: string;
}

export default function WorkspaceSupportButton({
  workspaceId,
  slug,
  className,
}: Props) {
  const { status, data: session } = useSession();
  const { repo } = useChat();
  const router = useRouter();

  const openSupport = async () => {
    // Public room per workspace on website
    const roomName = `Support#${workspaceId}`;

    // If not logged in, ask to login before redirecting to chat
    if (status !== "authenticated" || !session?.user?.id) {
      await signIn(undefined, { callbackUrl: "/dashboard/chat" });
      return;
    }

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

  const isAuthed = status === "authenticated";
  const label = isAuthed ? "گفتگو با پشتیبانی" : "ورود و شروع گفتگو";

  return (
    <button
      type="button"
      className={className || "btn btn-primary"}
      onClick={openSupport}
    >
      {label}
    </button>
  );
}
