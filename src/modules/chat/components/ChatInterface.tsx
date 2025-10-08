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
  const [users, setUsers] = useState<any[]>([]); // visible list in People
  const [orgUsers, setOrgUsers] = useState<any[]>([]); // admins only
  const [teams, setTeams] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [typing, setTyping] = useState(false);
  const [mobilePeopleOpen, setMobilePeopleOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // scroll management
  const listRef = useRef<HTMLDivElement>(null);
  const userAtBottomRef = useRef<boolean>(true);
  const [tabMenuOpen, setTabMenuOpen] = useState(false);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    userAtBottomRef.current = distanceFromBottom < 80;
  };

  useEffect(() => {
    // connect only once
    connect();
  }, []);

  useEffect(() => {
    // Load users and teams for sidebars based on user role
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
          // Admins: show customers in People, admins in Org, and all teams
          setUsers(allUsers.filter((u: any) => u.role?.name !== "Admin"));
          setOrgUsers(allUsers.filter((u: any) => u.role?.name === "Admin"));
          setTeams(allTeams);
        } else {
          // Regular users: only members of Support team (not the team itself)
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
      // Load messages for this room
      repo
        .messages(roomId)
        .then((res: any) => {
          // Support API shapes: {data: items} or {data: {data: items}}
          const itemsRaw = res?.data?.data ?? res?.data ?? res ?? [];
          const items = Array.isArray(itemsRaw)
            ? itemsRaw
                .slice()
                .sort(
                  (a: any, b: any) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                )
            : [];
          setMessages(items);
        })
        .catch(() => {});
    }
  }, [roomId]);

  useEffect(() => {
    // Set up real-time message listeners
    const unsubscribeMessage = onMessage((message: any) => {
      // guard: only append if message belongs to current room
      if (
        message?.roomId &&
        roomId &&
        Number(message.roomId) !== Number(roomId)
      ) {
        return;
      }
      const safeMsg = {
        ...message,
        createdAt: message?.createdAt || new Date().toISOString(),
      };
      setMessages((prev) =>
        [...prev, safeMsg].sort(
          (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      );
    });

    const unsubscribeTyping = onTyping((data: any) => {
      setTyping(Boolean(data?.isTyping));
    });

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
    };
  }, [roomId]);

  // Fallback polling when realtime is disconnected
  useEffect(() => {
    const intervalId: ReturnType<typeof setInterval> | undefined = undefined;
    const poll = async () => {
      if (!roomId) return;
      try {
        const res: any = await repo.messages(roomId);
        const itemsRaw = res?.data?.data ?? res?.data ?? res ?? [];
        const items = Array.isArray(itemsRaw)
          ? itemsRaw
              .slice()
              .sort(
                (a: any, b: any) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              )
          : [];
        setMessages(items);
      } catch {}
    };
    // poll every 3s as fallback
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [roomId]);

  useEffect(() => {
    if (userAtBottomRef.current) {
      const el = listRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  // initial load on room change (immediate fetch)
  useEffect(() => {
    const fetchNow = async () => {
      if (!roomId) return;
      try {
        const res: any = await repo.messages(roomId);
        const itemsRaw = res?.data?.data ?? res?.data ?? res ?? [];
        const items = Array.isArray(itemsRaw)
          ? itemsRaw
              .slice()
              .sort(
                (a: any, b: any) =>
                  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              )
          : [];
        setMessages(items);
        // jump to bottom without smooth on first load
        setTimeout(() => {
          const el = listRef.current;
          if (el) el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
        }, 0);
      } catch {}
    };
    fetchNow();
  }, [roomId]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !roomId) return;
    const body = messageText.trim();
    setMessageText("");
    // optimistic append
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
      // send via REST to persist
      await repo.send(roomId, { body });
      // also emit realtime (if socket connected)
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

  return (
    <div className="flex h-screen bg-gray-50" dir="rtl">
      {/* Left Sidebar - Navigation removed per request */}
      <div className="hidden"></div>

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
              {/* Mobile toggle for People sidebar */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobilePeopleOpen(true)}
              >
                <DIcon icon="fa-users" classCustom="text-gray-700" />
                <span className="mr-2">افراد</span>
              </Button>
              {/* Filter hidden on mobile */}
              <Button
                variant="ghost"
                className="hidden md:inline-flex items-center space-x-2 space-x-reverse"
              >
                <DIcon icon="fa-filter" classCustom="text-gray-600" />
                <span>فیلتر</span>
              </Button>
            </div>
          </div>

          {/* Tabs - desktop; Selector - mobile (attached) */}
          <div className="border-b">
            <div className="md:hidden">
              <button
                onClick={() => setTabMenuOpen((v) => !v)}
                className="w-full flex items-center justify-between border-x border-t rounded-t-lg rounded-b-none bg-white px-3 py-2 text-[15px] font-medium"
              >
                <span className="flex items-center gap-2">
                  <DIcon icon={activeTab === "messages" ? "fa-comments" : activeTab === "documents" ? "fa-file" : activeTab === "tasks" ? "fa-tasks" : "fa-book"} classCustom="text-gray-600" />
                  {activeTab === "messages" ? "پیام‌ها" : activeTab === "documents" ? "مستندات" : activeTab === "tasks" ? "وظایف" : "پایگاه دانش"}
                </span>
                <DIcon icon="fa-chevron-down" classCustom={`transition ${tabMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {tabMenuOpen && (
                <div className="bg-white border-x border-b">
                  {[
                    { id: "messages", label: "پیام‌ها", icon: "fa-comments" },
                    { id: "documents", label: "مستندات", icon: "fa-file" },
                    { id: "tasks", label: "وظایف", icon: "fa-tasks" },
                    { id: "knowledge", label: "پایگاه دانش", icon: "fa-book" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setTabMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-right ${
                        activeTab === tab.id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"
                      }`}
                    >
                      <DIcon icon={tab.icon} classCustom="text-gray-600" />
                      <span className="text-[15px]">{tab.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="hidden md:flex space-x-6 space-x-reverse overflow-x-auto no-scrollbar px-1 -mx-1">
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
            {/* Messages */}
            <div ref={listRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    className={`flex items-start space-x-3 space-x-reverse max-w-xs lg:max-w-md ${
                      message.sender?.id === activeWorkspace?.id
                        ? "flex-row-reverse"
                        : "flex-row"
                    }`}
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {(
                        message.sender?.displayName || message.sender?.name
                      )?.charAt(0) || "U"}
                    </div>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.sender?.id === activeWorkspace?.id
                          ? "bg-blue-500 text-white"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      <div className="text-xs opacity-75 mb-1">
                        {message.sender?.displayName || message.sender?.name} -{" "}
                        {message.sender?.role?.name || "کاربر"}
                      </div>
                      <div className="text-sm">
                        {message.body}
                        {message.body?.length > 100 && (
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
            <div className="bg-white border-t border-gray-200 p-3 md:p-4 sticky bottom-0">
              {/* Mobile bottom quick menu */}
              <div className="md:hidden flex items-center justify-between gap-2 mb-2">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value as any)}
                  className="block flex-1 rounded-lg border p-2 text-sm"
                >
                  <option value="documents">مستندات</option>
                  <option value="tasks">وظایف</option>
                  <option value="knowledge">پایگاه دانش</option>
                </select>
                <Button variant="ghost" size="sm">
                  <DIcon icon="fa-circle-info" classCustom="text-gray-600" />
                </Button>
              </div>

              <div className="flex items-center gap-2 mb-3">
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

              <div className="flex items-center gap-2">
                <Input
                  name="message"
                  type="text"
                  placeholder="بنویسید"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 min-w-0"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!roomId || !messageText.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <DIcon icon="fa-paper-plane" classCustom="text-white" />
                </Button>
              </div>

              {/* Removed knowledge quick section as requested */}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden md:flex w-80 bg-white border-r border-gray-200 flex-col">
            {/* People Section */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">
                  {activeWorkspace?.role?.name === "Admin"
                    ? "مشتریان"
                    : "پشتیبانی"}
                </h3>
                <Button variant="ghost" size="sm">
                  <DIcon icon="fa-arrow-right" classCustom="text-gray-600" />
                </Button>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {activeWorkspace?.role?.name === "Admin"
                  ? "همه مشتریان"
                  : "تیم پشتیبانی"}
              </div>
              <div className="space-y-2">
                {users.slice(0, 20).map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center space-x-3 space-x-reverse p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
                      roomName === `User#${user.id}`
                        ? "bg-blue-50 border border-blue-200"
                        : ""
                    }`}
                    onClick={async () => {
                      try {
                        // try to find existing room instead of always creating
                        const list: any = await repo.getAll({
                          page: 1,
                          limit: 100,
                        });
                        const roomsData = list?.data || list || [];
                        const existing = roomsData.find((r: any) => {
                          const t = r.title || "";
                          return (
                            t === `User#${user.id}` ||
                            t.startsWith(`Support#${user.id}#`)
                          );
                        });
                        if (existing) {
                          router.push(`/dashboard/chat/${existing.id}`);
                        } else {
                          const created: any = await repo.create({
                            name: `User#${user.id}`,
                          });
                          const rid = created?.id || created?.data?.id;
                          if (rid) router.push(`/dashboard/chat/${rid}`);
                        }
                      } catch (e) {
                        console.error("open user chat failed", e);
                      }
                    }}
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
                        {user.role?.name || "کاربر"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Org Users Section - Only for Admins */}
            {activeWorkspace?.role?.name === "Admin" && (
              <div className="p-4 flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">
                    کاربران سازمانی
                  </h3>
                  <Button variant="ghost" size="sm">
                    <DIcon icon="fa-arrow-right" classCustom="text-gray-600" />
                  </Button>
                </div>
                <div className="text-sm text-gray-600 mb-3">ادمین‌ها</div>
                <div className="space-y-2">
                  {orgUsers.slice(0, 20).map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center space-x-3 space-x-reverse p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
                        roomName === `User#${user.id}`
                          ? "bg-blue-50 border border-blue-200"
                          : ""
                      }`}
                      onClick={async () => {
                        try {
                          // prefer existing room
                          const list: any = await repo.getAll({
                            page: 1,
                            limit: 100,
                          });
                          const roomsData = list?.data || list || [];
                          const existing = roomsData.find((r: any) => {
                            const t = r.title || "";
                            return (
                              t === `User#${user.id}` ||
                              t.startsWith(`Support#${user.id}#`)
                            );
                          });
                          if (existing) {
                            router.push(`/dashboard/chat/${existing.id}`);
                          } else {
                            const created: any = await repo.create({
                              name: `User#${user.id}`,
                            });
                            const rid = created?.id || created?.data?.id;
                            if (rid) router.push(`/dashboard/chat/${rid}`);
                          }
                        } catch (e) {
                          console.error("open org user chat failed", e);
                        }
                      }}
                    >
                      <div className="relative">
                        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.displayName?.charAt(0) ||
                            user.user?.name?.charAt(0) ||
                            "A"}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">
                          {user.displayName || user.user?.name}
                        </div>
                        <div className="text-xs text-gray-500">Admin</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Teams section after org users */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">گروه‌ها</h3>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    تیم‌های داخلی
                  </div>
                  <div className="space-y-2">
                    {teams.slice(0, 20).map((team) => (
                      <div
                        key={team.id}
                        className="flex items-center space-x-3 space-x-reverse p-2 rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={async () => {
                          try {
                            const list: any = await repo.getAll({
                              page: 1,
                              limit: 100,
                            });
                            const roomsData = list?.data || list || [];
                            const existing = roomsData.find(
                              (r: any) => r.title === `Team#${team.id}`
                            );
                            if (existing) {
                              router.push(`/dashboard/chat/${existing.id}`);
                            } else {
                              const created: any = await repo.create({
                                name: `Team#${team.id}`,
                              });
                              const rid = created?.id || created?.data?.id;
                              if (rid) router.push(`/dashboard/chat/${rid}`);
                            }
                          } catch (e) {
                            console.error("open team chat failed", e);
                          }
                        }}
                      >
                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                          <DIcon
                            icon="fa-people-group"
                            classCustom="text-gray-600"
                          />
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
            )}
          </div>
        </div>
      </div>
      {/* Mobile People Drawer */}
      {mobilePeopleOpen && (
        <div className="md:hidden fixed inset-0 z-[1000]">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobilePeopleOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">افراد</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobilePeopleOpen(false)}
              >
                <DIcon icon="fa-xmark" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <div className="text-sm text-gray-600 mb-3">
                {activeWorkspace?.role?.name === "Admin"
                  ? "مشتریان"
                  : "تیم پشتیبانی"}
              </div>
              <div className="space-y-2">
                {users.slice(0, 30).map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center space-x-3 space-x-reverse p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
                      roomName === `User#${user.id}`
                        ? "bg-blue-50 border border-blue-200"
                        : ""
                    }`}
                    onClick={async () => {
                      try {
                        // prefer existing room
                        const list: any = await repo.getAll({
                          page: 1,
                          limit: 100,
                        });
                        const roomsData = list?.data || list || [];
                        const existing = roomsData.find((r: any) => {
                          const t = r.title || "";
                          return (
                            t === `User#${user.id}` ||
                            t.startsWith(`Support#${user.id}#`)
                          );
                        });
                        const rid = existing?.id;
                        if (rid) {
                          setMobilePeopleOpen(false);
                          router.push(`/dashboard/chat/${rid}`);
                        } else {
                          const created: any = await repo.create({
                            name: `User#${user.id}`,
                          });
                          const newId = created?.id || created?.data?.id;
                          if (newId) {
                            setMobilePeopleOpen(false);
                            router.push(`/dashboard/chat/${newId}`);
                          }
                        }
                      } catch (e) {
                        console.error("open user chat failed", e);
                      }
                    }}
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
                        {user.role?.name || "کاربر"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {activeWorkspace?.role?.name === "Admin" && (
                <>
                  <div className="text-sm text-gray-600 mt-6 mb-2">
                    کاربران سازمانی
                  </div>
                  <div className="space-y-2">
                    {orgUsers.slice(0, 30).map((user) => (
                      <div
                        key={user.id}
                        className={`flex items-center space-x-3 space-x-reverse p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
                          roomName === `User#${user.id}`
                            ? "bg-blue-50 border border-blue-200"
                            : ""
                        }`}
                        onClick={async () => {
                          try {
                            const list: any = await repo.getAll({
                              page: 1,
                              limit: 100,
                            });
                            const roomsData = list?.data || list || [];
                            const existing = roomsData.find(
                              (r: any) => (r.title || "") === `User#${user.id}`
                            );
                            const rid = existing?.id;
                            if (rid) {
                              setMobilePeopleOpen(false);
                              router.push(`/dashboard/chat/${rid}`);
                            } else {
                              const created: any = await repo.create({
                                name: `User#${user.id}`,
                              });
                              const newId = created?.id || created?.data?.id;
                              if (newId) {
                                setMobilePeopleOpen(false);
                                router.push(`/dashboard/chat/${newId}`);
                              }
                            }
                          } catch (e) {
                            console.error("open org user chat failed", e);
                          }
                        }}
                      >
                        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.displayName?.charAt(0) ||
                            user.user?.name?.charAt(0) ||
                            "A"}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800">
                            {user.displayName || user.user?.name}
                          </div>
                          <div className="text-xs text-gray-500">Admin</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-sm text-gray-600 mt-6 mb-2">گروه‌ها</div>
                  <div className="space-y-2">
                    {teams.slice(0, 30).map((team) => (
                      <div
                        key={team.id}
                        className={`flex items-center space-x-3 space-x-reverse p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
                          roomName === `Team#${team.id}`
                            ? "bg-blue-50 border border-blue-200"
                            : ""
                        }`}
                        onClick={async () => {
                          try {
                            const list: any = await repo.getAll({
                              page: 1,
                              limit: 100,
                            });
                            const roomsData = list?.data || list || [];
                            const existing = roomsData.find(
                              (r: any) => (r.title || "") === `Team#${team.id}`
                            );
                            if (existing) {
                              setMobilePeopleOpen(false);
                              router.push(`/dashboard/chat/${existing.id}`);
                            } else {
                              const created: any = await repo.create({
                                name: `Team#${team.id}`,
                              });
                              const rid = created?.id || created?.data?.id;
                              if (rid) {
                                setMobilePeopleOpen(false);
                                router.push(`/dashboard/chat/${rid}`);
                              }
                            }
                          } catch (e) {
                            console.error("open team chat failed", e);
                          }
                        }}
                      >
                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                          <DIcon
                            icon="fa-people-group"
                            classCustom="text-gray-600"
                          />
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
