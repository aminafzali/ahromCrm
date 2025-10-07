"use client";

import ChatPane from "../../components/ChatPane";

export default function ChatRoomPage({ id }: { id: number }) {
  return (
    <div className="p-4 h-[calc(100vh-8rem)]">
      <ChatPane roomId={id} />
    </div>
  );
}
