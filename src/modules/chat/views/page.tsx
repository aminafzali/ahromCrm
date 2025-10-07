"use client";

import { useEffect, useState } from "react";
import RoomsList from "../components/RoomsList";
import { useChat } from "../hooks/useChat";

export default function ChatIndexPage() {
  const { repo } = useChat();
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    repo.getAll({ page: 1, limit: 100 }).then((res: any) => {
      setRooms(res?.data || res || []);
    });
  }, [repo]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">گفتگوها</h1>
      <RoomsList rooms={rooms} />
    </div>
  );
}
