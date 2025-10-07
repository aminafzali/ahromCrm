"use client";

import { useParams } from "next/navigation";
import ChatInterface from "../../components/ChatInterface";

export default function ChatViewPage() {
  const params = useParams();
  const { id } = (params as { id?: string }) || {};

  if (!id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">
            اتاق گفتگو یافت نشد
          </h1>
          <p className="text-gray-500">
            لطفاً از لیست گفتگوها یک اتاق را انتخاب کنید
          </p>
        </div>
      </div>
    );
  }

  return <ChatInterface roomId={Number(id)} />;
}
