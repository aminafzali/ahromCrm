"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { useTeam } from "@/modules/teams/hooks/useTeam";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { Button, Input } from "ndui-ahrom";
import { useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";

interface ChatInterfaceProps {
  roomId?: number;
  roomName?: string;
}

export default function ChatInterface({
  roomId,
  roomName,
}: ChatInterfaceProps) {
  const { repo, join, sendMessageRealtime, onMessage, onTyping } = useChat();
  const { getAll: getAllUsers } = useWorkspaceUser();
  const { getAll: getAllTeams } = useTeam();

  const [activeTab, setActiveTab] = useState<
    "messages" | "documents" | "tasks"
  >("messages");
  const [messageText, setMessageText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load users and teams for sidebars
    const loadData = async () => {
      try {
        const [usersRes, teamsRes] = await Promise.all([
          getAllUsers({ page: 1, limit: 100 }),
          getAllTeams({ page: 1, limit: 100 }),
        ]);
        setUsers(usersRes?.data || []);
        setTeams(teamsRes?.data || []);
      } catch (error) {
        console.error("Error loading chat data:", error);
      }
    };
    loadData();
  }, [getAllUsers, getAllTeams]);

  useEffect(() => {
    if (roomId) {
      join(roomId);
      // Load messages for this room
      repo.messages(roomId).then((res: any) => {
        setMessages(res?.data || res || []);
      });
    }
  }, [roomId, join, repo]);

  useEffect(() => {
    // Set up real-time message listeners
    const unsubscribeMessage = onMessage((message: any) => {
      setMessages((prev) => [...prev, message]);
    });

    const unsubscribeTyping = onTyping((data: any) => {
      setTyping(data.isTyping);
    });

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
    };
  }, [onMessage, onTyping]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !roomId) return;

    // Send via real-time socket
    sendMessageRealtime(roomId, messageText.trim());
    setMessageText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50" dir="rtl">
      {/* Left Sidebar - Navigation */}
      <div className="w-16 bg-white border-l border-gray-200 flex flex-col items-center py-4 space-y-4">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <DIcon icon="fa-comments" classCustom="text-white" />
        </div>
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <DIcon icon="fa-list" classCustom="text-gray-600" />
        </div>
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <DIcon icon="fa-calendar" classCustom="text-gray-600" />
        </div>
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mt-auto">
          <DIcon icon="fa-plus" classCustom="text-gray-600" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="relative">
                <Input
                  name="search"
                  type="text"
                  placeholder="جستجو"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pr-10 w-64"
                />
                <DIcon
                  icon="fa-search"
                  classCustom="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 space-x-reverse"
              >
                <DIcon icon="fa-filter" classCustom="text-gray-600" />
                <span>فیلتر</span>
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 space-x-reverse border-b">
            {[
              { id: "messages", label: "پیام‌ها", icon: "fa-comments" },
              { id: "documents", label: "مستندات", icon: "fa-file" },
              { id: "tasks", label: "وظایف", icon: "fa-tasks" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 space-x-reverse pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <DIcon icon={tab.icon} classCustom="text-sm" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex">
          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message: any, index: number) => (
                <div
                  key={index}
                  className={`flex ${
                    message.sender?.id === 1 ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-start space-x-3 space-x-reverse max-w-xs lg:max-w-md ${
                      message.sender?.id === 1 ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {message.sender?.name?.charAt(0) || "U"}
                    </div>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.sender?.id === 1
                          ? "bg-blue-500 text-white"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      <div className="text-xs opacity-75 mb-1">
                        {message.sender?.name} -{" "}
                        {message.sender?.role || "کاربر"}
                      </div>
                      <div className="text-sm">
                        {message.content}
                        {message.content.length > 100 && (
                          <button className="text-xs opacity-75 mr-2 hover:underline">
                            ...بیشتر
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                      <div className="flex space-x-1 space-x-reverse">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3 space-x-reverse mb-3">
                <Button variant="ghost" size="sm">
                  <DIcon icon="fa-paperclip" classCustom="text-gray-600" />
                </Button>
                <Button variant="ghost" size="sm">
                  <DIcon icon="fa-image" classCustom="text-gray-600" />
                </Button>
                <Button variant="ghost" size="sm">
                  <DIcon icon="fa-smile" classCustom="text-gray-600" />
                </Button>
              </div>

              <div className="flex items-center space-x-3 space-x-reverse">
                <Input
                  name="message"
                  type="text"
                  placeholder="بنویسید"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <DIcon icon="fa-paper-plane" classCustom="text-white" />
                </Button>
              </div>

              {/* Knowledge Base Section */}
              <div className="mt-4 bg-purple-50 rounded-lg p-3">
                <div className="text-sm font-medium text-purple-800 mb-2">
                  منو / پایگاه دانش
                </div>
                <div className="flex space-x-2 space-x-reverse">
                  <Button
                    size="sm"
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    + نوشتن مقاله جدید
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="border border-purple-500 text-purple-500 hover:bg-purple-50"
                  >
                    اشتراک گذاری
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* People Section */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">افراد</h3>
                <Button variant="ghost" size="sm">
                  <DIcon icon="fa-arrow-right" classCustom="text-gray-600" />
                </Button>
              </div>
              <div className="text-sm text-gray-600 mb-3">همه</div>
              <div className="space-y-2">
                {users.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 space-x-reverse p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user.displayName?.charAt(0) ||
                          user.user?.name?.charAt(0) ||
                          "U"}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">
                        {user.displayName || user.user?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.role || "کاربر"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Groups Section */}
            <div className="p-4 flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">گروه‌ها</h3>
                <Button variant="ghost" size="sm">
                  <DIcon icon="fa-arrow-right" classCustom="text-gray-600" />
                </Button>
              </div>
              <div className="text-sm text-gray-600 mb-3">همه</div>
              <div className="space-y-2">
                {teams.slice(0, 4).map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center space-x-3 space-x-reverse p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                      <DIcon icon="fa-cube" classCustom="text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">
                        {team.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {team.department || "دپارتمان"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
