"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { Button } from "ndui-ahrom";
import { useEffect, useRef, useState } from "react";
import ChatInterface from "../components/ChatInterface";
import { useChat } from "../hooks/useChat";

export default function ChatIndexPage() {
  const { repo } = useChat();
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const autoSelectedRef = useRef(false);

  const repoRef = useRef(repo);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("🚀 ChatIndexPage: Loading chat rooms...");

        const res: any = await repoRef.current.getAll({ page: 1, limit: 100 });
        console.log("📡 ChatIndexPage: API response:", res);

        const roomsData = res?.data || res || [];
        setRooms(roomsData);
        console.log("📋 ChatIndexPage: Rooms loaded:", roomsData.length);

        // Auto-select first room if available
        if (roomsData.length > 0 && !autoSelectedRef.current) {
          setSelectedRoom(roomsData[0]);
          console.log("✅ ChatIndexPage: Auto-selected room:", roomsData[0]);
          autoSelectedRef.current = true;
        }
      } catch (err) {
        console.error("❌ ChatIndexPage: Error loading rooms:", err);
        setError("خطا در بارگذاری گفتگوها");
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
    // run once on mount
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-600 mb-2">گفتگوها</h1>
          <p className="text-gray-500">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <DIcon
            icon="fa-exclamation-triangle"
            classCustom="text-red-500 text-6xl mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-600 mb-2">خطا</h1>
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="primary">
            تلاش مجدد
          </Button>
        </div>
      </div>
    );
  }

  // Show chat interface if room is selected
  if (selectedRoom) {
    return (
      <ChatInterface
        roomId={selectedRoom.id}
        roomName={selectedRoom.title || selectedRoom.name}
      />
    );
  }

  // Show empty state when no rooms exist
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-6">
          <DIcon icon="fa-comments" classCustom="text-gray-400 text-8xl mb-4" />
          <h1 className="text-3xl font-bold text-gray-700 mb-2">گفتگوها</h1>
          <p className="text-gray-500 text-lg">هنوز هیچ گفتگویی وجود ندارد</p>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">برای شروع گفتگو، می‌توانید:</p>

          <div className="space-y-3 text-right">
            <div className="flex items-center justify-end space-x-3 space-x-reverse">
              <span className="text-sm text-gray-600">
                از صفحات پروژه‌ها یا تیم‌ها دکمه گفتگو را کلیک کنید
              </span>
              <DIcon icon="fa-arrow-left" classCustom="text-gray-400" />
            </div>
            <div className="flex items-center justify-end space-x-3 space-x-reverse">
              <span className="text-sm text-gray-600">
                از پنل کاربری دکمه پشتیبانی را کلیک کنید
              </span>
              <DIcon icon="fa-headset" classCustom="text-gray-400" />
            </div>
            <div className="flex items-center justify-end space-x-3 space-x-reverse">
              <span className="text-sm text-gray-600">
                از صفحات وظایف یا اسناد گفتگو را شروع کنید
              </span>
              <DIcon icon="fa-comment" classCustom="text-gray-400" />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Button
            onClick={() => (window.location.href = "/dashboard")}
            variant="ghost"
            className="text-blue-600 hover:text-blue-700"
          >
            <DIcon icon="fa-arrow-right" classCustom="ml-2" />
            بازگشت به داشبورد
          </Button>
        </div>
      </div>
    </div>
  );
}
