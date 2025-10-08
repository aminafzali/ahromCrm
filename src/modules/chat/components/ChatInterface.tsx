"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { useTeam } from "@/modules/teams/hooks/useTeam";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { Button, Input } from "ndui-ahrom";
import { useRouter } from "next/navigation";
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
  const { repo, join, sendMessageRealtime, onMessage, onTyping, connect } =
    useChat();
  const router = useRouter();
  const { getAll: getAllUsers } = useWorkspaceUser();
  const { getAll: getAllTeams } = useTeam();
  const { activeWorkspace } = useWorkspace();

  const [activeTab, setActiveTab] = useState<
    "messages" | "documents" | "tasks" | "knowledge"
  >("messages");
  const [messageText, setMessageText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [peopleSearchText, setPeopleSearchText] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [orgUsers, setOrgUsers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [typing, setTyping] = useState(false);
  const [mobilePeopleOpen, setMobilePeopleOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const peopleListRef = useRef<HTMLDivElement>(null);
  const userAtBottomRef = useRef<boolean>(true);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    userAtBottomRef.current = distanceFromBottom < 80;
  };

  useEffect(() => {
    connect();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUserRole = activeWorkspace?.role?.name;

        const [usersRes, teamsRes] = await Promise.all([
          getAllUsers({ page: 1, limit: 200 }),
          getAllTeams({ page: 1, limit: 200 }),
        ]);

        const allUsers = usersRes?.data || [];
        const allTeams = teamsRes?.data || [];

        if (currentUserRole === "Admin") {
          setUsers(allUsers.filter((u: any) => u.role?.name !== "Admin"));
          setOrgUsers(allUsers.filter((u: any) => u.role?.name === "Admin"));
          setTeams(allTeams);
        } else {
          const supportTeam = allTeams.find((t: any) => t.name === "پشتیبانی");
          const supportMembers = supportTeam
            ? allUsers.filter(
                (user: any) =>
                  Array.isArray(user.userGroups) &&
                  user.userGroups.some((g: any) => g.id === supportTeam.id)
              )
            : [];
          setUsers(supportMembers);
          setOrgUsers([]);
          setTeams([]);
        }
      } catch (error) {
        console.error("Error loading chat data:", error);
      }
    };
    loadData();
  }, [activeWorkspace?.id]);

  useEffect(() => {
    if (roomId) {
      join(roomId);
      const fetchNow = async () => {
        try {
          const res: any = await repo.messages(roomId, { page: 1, limit: 50 });
          const items = (res?.data?.data ?? res?.data ?? res ?? []) as any[];
          setMessages(
            Array.isArray(items)
              ? items
                  .slice()
                  .sort(
                    (a: any, b: any) =>
                      new Date(a.createdAt).getTime() -
                      new Date(b.createdAt).getTime()
                  )
              : []
          );
          setTimeout(() => {
            const el = listRef.current;
            if (el) el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
          }, 0);
        } catch {}
      };
      fetchNow();
    }
  }, [roomId]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !roomId) return;
    const body = messageText.trim();
    setMessageText("");
    setMessages((prev) => [
      ...prev,
      {
        body,
        sender: {
          id: activeWorkspace?.id,
          displayName: activeWorkspace?.role?.name || "شما",
          name: activeWorkspace?.role?.name || "شما",
          role: activeWorkspace?.role,
        },
        roomId,
        createdAt: new Date(),
      },
    ]);
    try {
      await repo.send(roomId, { body });
      sendMessageRealtime(roomId, body);
    } catch (e) {
      console.error("chat send failed", e);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUserClick = async (user: any) => {
    try {
      const roomName = `User#${user.id}#${activeWorkspace?.id}`;
      const list: any = await repo.getAll({ page: 1, limit: 100 });
      const rooms = list?.data || list || [];
      let existingRoom = rooms.find((r: any) => r.title === roomName);

      if (!existingRoom) {
        existingRoom = await repo.create({ name: roomName });
        existingRoom = existingRoom?.data || existingRoom;
      }

      if (existingRoom?.id) {
        router.push(`/dashboard/chat/${existingRoom.id}`);
      }
    } catch (error) {
      console.error("Error creating/opening chat room:", error);
    }
  };

  const handleTeamClick = async (team: any) => {
    try {
      const roomName = `Team#${team.id}#${activeWorkspace?.id}`;
      const list: any = await repo.getAll({ page: 1, limit: 100 });
      const rooms = list?.data || list || [];
      let existingRoom = rooms.find((r: any) => r.title === roomName);

      if (!existingRoom) {
        existingRoom = await repo.create({ name: roomName });
        existingRoom = existingRoom?.data || existingRoom;
      }

      if (existingRoom?.id) {
        router.push(`/dashboard/chat/${existingRoom.id}`);
      }
    } catch (error) {
      console.error("Error creating/opening team chat room:", error);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter((user: any) =>
    (user.displayName || user.user?.name || "")
      .toLowerCase()
      .includes(peopleSearchText.toLowerCase())
  );

  const filteredOrgUsers = orgUsers.filter((user: any) =>
    (user.displayName || user.user?.name || "")
      .toLowerCase()
      .includes(peopleSearchText.toLowerCase())
  );

  const filteredTeams = teams.filter((team: any) =>
    team.name.toLowerCase().includes(peopleSearchText.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" dir="rtl">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              {/* Search moved to top */}
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

              {/* Mobile People button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobilePeopleOpen(true)}
              >
                <DIcon icon="fa-users" classCustom="text-gray-700" />
                <span className="mr-2">افراد</span>
              </Button>
            </div>

            {/* Desktop People button */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:inline-flex items-center space-x-2 space-x-reverse"
              onClick={() => setMobilePeopleOpen(true)}
            >
              <DIcon icon="fa-users" classCustom="text-gray-700" />
              <span>افراد</span>
            </Button>
          </div>

          {/* Tabs - Desktop only */}
          <div className="hidden md:block border-b mt-4">
            <div className="flex space-x-6 space-x-reverse overflow-x-auto no-scrollbar px-1 -mx-1">
              {[
                { id: "messages", label: "پیام‌ها", icon: "fa-comments" },
                { id: "documents", label: "مستندات", icon: "fa-file" },
                { id: "tasks", label: "وظایف", icon: "fa-tasks" },
                { id: "knowledge", label: "پایگاه دانش", icon: "fa-book" },
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
                  <span className="font-medium whitespace-nowrap">
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 min-h-0 flex">
          {/* Messages Area */}
          <div className="flex-1 min-h-0 flex flex-col">
            {/* Mobile Tab Selector */}
            <div className="md:hidden bg-white border-b border-gray-200 p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <DIcon icon="fa-comments" classCustom="text-gray-600" />
                <span className="font-medium">پیام‌ها</span>
              </div>
              <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                <DIcon icon="fa-smile" classCustom="text-gray-600" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={listRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.map((message: any, index: number) => (
                <div
                  key={index}
                  className={`flex ${
                    message.sender?.id === activeWorkspace?.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender?.id === activeWorkspace?.id
                        ? "bg-blue-500 text-white"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <div className="text-sm">{message.body}</div>
                    <div
                      className={`text-xs mt-1 ${
                        message.sender?.id === activeWorkspace?.id
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString("fa-IR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg">
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
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Input
                  name="message"
                  type="text"
                  placeholder="پیام خود را بنویسید..."
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
            </div>
          </div>
        </div>
      </div>

      {/* People Sidebar - Desktop */}
      <div className="hidden md:block w-80 bg-white border-l border-gray-200 flex-shrink-0">
        <div className="h-full flex flex-col">
          {/* People Header */}
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">افراد</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobilePeopleOpen(false)}
              >
                <DIcon icon="fa-xmark" classCustom="text-gray-500" />
              </Button>
            </div>

            {/* Search in People */}
            <div className="relative">
              <Input
                name="peopleSearch"
                type="text"
                placeholder="جستجو در افراد..."
                value={peopleSearchText}
                onChange={(e) => setPeopleSearchText(e.target.value)}
                className="pr-10"
              />
              <DIcon
                icon="fa-search"
                classCustom="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* People List */}
          <div
            ref={peopleListRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {/* Customers */}
            {filteredUsers.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  مشتریان
                </h4>
                {filteredUsers.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 space-x-reverse p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                      {(user.displayName || user.user?.name || "U").charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {user.displayName || user.user?.name || "نامشخص"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.role?.name || "کاربر"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Organizational Users */}
            {filteredOrgUsers.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  کاربران سازمانی
                </h4>
                {filteredOrgUsers.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 space-x-reverse p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                      {(user.displayName || user.user?.name || "U").charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {user.displayName || user.user?.name || "نامشخص"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.role?.name || "کاربر"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Teams */}
            {filteredTeams.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  تیم‌ها
                </h4>
                {filteredTeams.map((team: any) => (
                  <div
                    key={team.id}
                    className="flex items-center space-x-3 space-x-reverse p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => handleTeamClick(team)}
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-medium text-green-600">
                      <DIcon icon="fa-users" classCustom="text-xs" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {team.name}
                      </div>
                      <div className="text-xs text-gray-500">تیم</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile People Drawer */}
      {mobilePeopleOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setMobilePeopleOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="h-full flex flex-col">
              {/* Mobile People Header */}
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">افراد</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobilePeopleOpen(false)}
                  >
                    <DIcon icon="fa-xmark" classCustom="text-gray-500" />
                  </Button>
                </div>

                {/* Search in People */}
                <div className="relative">
                  <Input
                    name="peopleSearch"
                    type="text"
                    placeholder="جستجو در افراد..."
                    value={peopleSearchText}
                    onChange={(e) => setPeopleSearchText(e.target.value)}
                    className="pr-10"
                  />
                  <DIcon
                    icon="fa-search"
                    classCustom="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>

              {/* Mobile People List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Same content as desktop but in mobile drawer */}
                {filteredUsers.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">
                      مشتریان
                    </h4>
                    {filteredUsers.map((user: any) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-3 space-x-reverse p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => {
                          handleUserClick(user);
                          setMobilePeopleOpen(false);
                        }}
                      >
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                          {(user.displayName || user.user?.name || "U").charAt(
                            0
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {user.displayName || user.user?.name || "نامشخص"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.role?.name || "کاربر"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {filteredOrgUsers.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">
                      کاربران سازمانی
                    </h4>
                    {filteredOrgUsers.map((user: any) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-3 space-x-reverse p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => {
                          handleUserClick(user);
                          setMobilePeopleOpen(false);
                        }}
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                          {(user.displayName || user.user?.name || "U").charAt(
                            0
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {user.displayName || user.user?.name || "نامشخص"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.role?.name || "کاربر"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {filteredTeams.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">
                      تیم‌ها
                    </h4>
                    {filteredTeams.map((team: any) => (
                      <div
                        key={team.id}
                        className="flex items-center space-x-3 space-x-reverse p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => {
                          handleTeamClick(team);
                          setMobilePeopleOpen(false);
                        }}
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-medium text-green-600">
                          <DIcon icon="fa-users" classCustom="text-xs" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {team.name}
                          </div>
                          <div className="text-xs text-gray-500">تیم</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
