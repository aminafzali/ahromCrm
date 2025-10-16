"use client";

import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { useEffect, useRef, useState } from "react";
import ChatWindow from "../components/ChatWindow";
import ContactsList from "../components/ContactsList";
import { useInternalChat } from "../hooks/useInternalChat";

export default function InternalChatPage() {
  const { activeWorkspace } = useWorkspace();
  const {
    repo,
    connect,
    disconnect,
    joinRoom,
    sendMessageRealtime,
    onMessage,
    sendReadReceipt,
    onReadReceipt,
    setUserOnline,
    onUserOnline,
    onUserOffline,
    emitEditMessage,
    emitDeleteMessage,
    onMessageEdited,
    onMessageDeleted,
  } = useInternalChat();

  const [users, setUsers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [selectedType, setSelectedType] = useState<"user" | "team" | null>(
    null
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [skipAutoScroll, setSkipAutoScroll] = useState(false);
  const [composerValue, setComposerValue] = useState("");
  const [composerMode, setComposerMode] = useState<"reply" | "edit" | null>(
    null
  );
  const [composerPreview, setComposerPreview] = useState<string | undefined>(
    undefined
  );
  const [replyToId, setReplyToId] = useState<number | undefined>(undefined);
  const [editMessageId, setEditMessageId] = useState<number | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<{ [key: number]: number }>(
    {}
  );
  const [autoScrollSignal, setAutoScrollSignal] = useState<number>(0);

  // merge helpers and locks
  const mergingRef = useRef(false);
  const lastMergeAtRef = useRef<number>(0);

  const mergeById = (
    prev: any[],
    updates: any[]
  ): { next: any[]; changed: boolean } => {
    if (!updates?.length) return { next: prev, changed: false };
    const map = new Map(updates.map((m: any) => [m.id, m]));
    let changed = false;
    const next = prev.map((m: any) => {
      const u = map.get(m.id);
      if (!u) return m;
      // shallow compare common fields to avoid needless set
      const same =
        m.body === u.body &&
        m.isRead === u.isRead &&
        m.isDeleted === u.isDeleted &&
        m.isEdited === u.isEdited;
      if (same) return m;
      changed = true;
      return { ...m, ...u };
    });
    return { next, changed };
  };

  // Load admin users and teams on mount
  useEffect(() => {
    loadContacts();
    connect();
    if (activeWorkspace?.id) {
      setUserOnline(activeWorkspace.id);
    }

    const offOnline = onUserOnline((e) => {
      setOnlineUsers((prev) =>
        Array.from(new Set([...(prev || []), e.userId]))
      );
    });
    const offOffline = onUserOffline((e) => {
      setOnlineUsers((prev) => (prev || []).filter((id) => id !== e.userId));
    });

    return () => {
      offOnline?.();
      offOffline?.();
      disconnect();
    };
  }, []);

  // Listen for new messages (dedupe by id)
  useEffect(() => {
    const cleanup = onMessage((message: any) => {
      if (message.roomId !== selectedRoom?.id) return;
      setMessages((prev) => {
        if (!prev?.length) return [message];
        if (prev.some((m) => m.id === message.id)) return prev; // already present
        return [...prev, message];
      });
    });
    return () => {
      if (cleanup) cleanup();
    };
  }, [selectedRoom?.id, onMessage]);

  // Listen for read receipts and merge only if needed
  useEffect(() => {
    const off = onReadReceipt((data: { roomId: number }) => {
      if (composerMode) return;
      if (selectedRoom?.id !== data.roomId) return;
      const now = Date.now();
      if (mergingRef.current || now - (lastMergeAtRef.current || 0) < 2000)
        return;
      mergingRef.current = true;
      repo
        .getMessages(data.roomId, { page, limit: MESSAGES_PAGE_LIMIT })
        .then((res: any) => {
          const updates: any[] = res?.data || [];
          setMessages((prev) => {
            const { next, changed } = mergeById(prev, updates);
            return changed ? next : prev;
          });
          lastMergeAtRef.current = Date.now();
        })
        .finally(() => {
          setTimeout(() => {
            mergingRef.current = false;
          }, 0);
        });
    });
    return () => {
      if (off) off();
    };
  }, [selectedRoom?.id, page, composerMode, onReadReceipt, repo]);

  // Listen for message edited/deleted realtime
  useEffect(() => {
    const offEdited = onMessageEdited?.((data: any) => {
      if (data?.roomId !== selectedRoom?.id) return;
      console.log("✏️ [Internal Chat Page] Realtime edited", data);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.messageId
            ? { ...m, body: data.body, isEdited: true }
            : m
        )
      );
    });
    const offDeleted = onMessageDeleted?.((data: any) => {
      if (data?.roomId !== selectedRoom?.id) return;
      console.log("🗑️ [Internal Chat Page] Realtime deleted", data);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.messageId ? { ...m, isDeleted: true } : m
        )
      );
    });
    return () => {
      if (offEdited) {
        offEdited();
      }
      if (offDeleted) {
        offDeleted();
      }
    };
  }, [selectedRoom?.id, onMessageEdited, onMessageDeleted]);

  /**
   * Load admin workspace users and teams
   * Only admin users in the current workspace are shown
   */
  const loadContacts = async () => {
    console.log("🔄 [Internal Chat Page] Loading contacts...");
    try {
      const response = await repo.getContacts();
      console.log("✅ [Internal Chat Page] Contacts loaded:", response);
      console.log(
        "👥 [Internal Chat Page] Admin users count:",
        response?.users?.length || 0
      );
      console.log(
        "👥 [Internal Chat Page] Teams count:",
        response?.teams?.length || 0
      );

      const { users: adminUsers, teams: userTeams } = response;
      setUsers(adminUsers || []);
      setTeams(userTeams || []);

      // Load unread counts for each user
      await loadUnreadCounts(adminUsers || []);

      console.log(
        "📊 [Internal Chat Page] State updated - Users:",
        adminUsers?.length || 0,
        "Teams:",
        userTeams?.length || 0
      );
    } catch (error) {
      console.error("❌ [Internal Chat Page] Error loading contacts:", error);
    }
  };

  /**
   * Load unread message counts for all contacts
   */
  const loadUnreadCounts = async (usersList: any[]) => {
    console.log("🔄 [Internal Chat Page] Loading unread counts...");
    try {
      const counts: { [key: number]: number } = {};

      // Get unread count for each user's room
      for (const user of usersList) {
        try {
          const count = await repo.getUnreadCount(user.id);
          if (count > 0) {
            counts[user.id] = count;
          }
        } catch (err) {
          console.warn(`Failed to get unread count for user ${user.id}:`, err);
        }
      }

      console.log("✅ [Internal Chat Page] Unread counts loaded:", counts);
      setUnreadCounts(counts);
    } catch (error) {
      console.error(
        "❌ [Internal Chat Page] Error loading unread counts:",
        error
      );
    }
  };

  // Messages pagination config and helpers
  const MESSAGES_PAGE_LIMIT = 50;

  const loadMessagesLatest = async (roomId: number): Promise<number> => {
    const headRes: any = await repo.getMessages(roomId, { page: 1, limit: 1 });
    const total = headRes?.total || 0;
    const lastPage = Math.max(1, Math.ceil(total / MESSAGES_PAGE_LIMIT));
    const latestRes: any = await repo.getMessages(roomId, {
      page: lastPage,
      limit: MESSAGES_PAGE_LIMIT,
    });
    setMessages(latestRes?.data || []);
    setPage(lastPage);
    setHasMore(lastPage > 1);
    return lastPage;
  };

  /**
   * Mark all messages in a room as read
   */
  const markMessagesAsRead = async (roomId: number) => {
    try {
      if ((window as any).__ic_read_lock__ === roomId) return;
      (window as any).__ic_read_lock__ = roomId;
      const result: any = await repo.markAsRead(roomId);
      if (result?.marked && result.marked > 0) {
        sendReadReceipt(roomId);
      }
      setTimeout(() => {
        if ((window as any).__ic_read_lock__ === roomId) {
          (window as any).__ic_read_lock__ = undefined;
        }
      }, 1500);
      if (selectedId) {
        setUnreadCounts((prev) => ({ ...prev, [selectedId]: 0 }));
        try {
          const newCount = await repo.getUnreadCount(selectedId);
          setUnreadCounts((prev) => ({ ...prev, [selectedId]: newCount }));
        } catch {
          setUnreadCounts((prev) => ({ ...prev, [selectedId]: 0 }));
        }
      }
    } catch (error) {
      console.error(
        "❌ [Internal Chat Page] Error marking messages as read:",
        error
      );
    }
  };

  const handleSelectUser = async (user: any) => {
    setLoading(true);
    try {
      const room: any = await repo.getOrCreateDirectRoom(user.id);
      setSelectedRoom(room);
      setSelectedType("user");
      setSelectedId(user.id);
      setUnreadCounts((prev) => ({ ...prev, [user.id]: 0 }));
      if (room?.id) {
        joinRoom(room.id);
        const lastPageComputed = await loadMessagesLatest(room.id);
        await markMessagesAsRead(room.id);
        setTimeout(() => setAutoScrollSignal(Date.now()), 0);
      }
    } catch (error) {
      console.error("❌ [Internal Chat Page] Error selecting user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTeam = async (team: any) => {
    setLoading(true);
    try {
      const room: any = await repo.getOrCreateTeamRoom(team.id);
      setSelectedRoom(room);
      setSelectedType("team");
      setSelectedId(team.id);
      if (room?.id) {
        joinRoom(room.id);
        const lastPageComputed = await loadMessagesLatest(room.id);
        await markMessagesAsRead(room.id);
        setTimeout(() => setAutoScrollSignal(Date.now()), 0);
      }
    } catch (error) {
      console.error("❌ [Internal Chat Page] Error selecting team:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (messageBody: string) => {
    if (!selectedRoom?.id) return;
    const tempId: string = `temp-${Date.now()}`;
    const isSelfChat =
      selectedType === "user" && selectedId === activeWorkspace?.id;
    try {
      if (composerMode === "edit" && editMessageId) {
        const updated = await repo.editMessage(editMessageId, messageBody);
        setMessages((prev) =>
          prev.map((m) => (m.id === editMessageId ? { ...m, ...updated } : m))
        );
        emitEditMessage?.(selectedRoom.id, editMessageId, messageBody);
        setComposerMode(null);
        setComposerValue("");
        setEditMessageId(undefined);
        return;
      }
      const tempMessage = {
        id: tempId,
        body: messageBody,
        senderId: activeWorkspace?.id || 0,
        sender: {
          id: activeWorkspace?.id || 0,
          displayName: activeWorkspace?.workspace?.name || "شما",
        },
        createdAt: new Date().toISOString(),
        isRead: isSelfChat,
        replyToId,
      };
      setMessages((prev) => [...prev, tempMessage]);
      sendMessageRealtime(
        selectedRoom.id,
        messageBody,
        tempId,
        activeWorkspace?.id
      );
      const savedMessage = await repo.sendMessage(selectedRoom.id, {
        body: messageBody,
        replyToId,
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? savedMessage : m))
      );
      setComposerMode(null);
      setComposerPreview(undefined);
      setReplyToId(undefined);
      setComposerValue("");
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      alert("خطا در ارسال پیام. لطفاً دوباره تلاش کنید.");
    }
  };

  // Handlers for reply/edit/delete
  const handleReply = (msg: any) => {
    setComposerMode("reply");
    setComposerPreview(msg.body?.slice(0, 60));
    setReplyToId(msg.id);
  };

  const handleEdit = async (msg: any) => {
    setComposerMode("edit");
    setComposerPreview(undefined);
    setComposerValue(msg.body || "");
    setReplyToId(undefined);
    setEditMessageId(msg.id);
  };

  const applyEdit = async () => {};

  const handleDelete = async (msg: any) => {
    try {
      await repo.deleteMessage(msg.id);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, isDeleted: true } : m))
      );
      emitDeleteMessage?.(selectedRoom!.id, msg.id);
    } catch {}
  };

  return (
    <div className="h-screen flex bg-gray-50">
      <div className="w-80 flex-shrink-0">
        <ContactsList
          users={users}
          teams={teams}
          selectedId={selectedId}
          selectedType={selectedType}
          onSelectUser={handleSelectUser}
          onSelectTeam={handleSelectTeam}
          onlineUsers={onlineUsers}
          unreadCounts={unreadCounts}
          currentUserId={activeWorkspace?.id}
        />
      </div>

      <ChatWindow
        room={selectedRoom}
        messages={messages}
        currentUserId={activeWorkspace?.id || 0}
        onSendMessage={handleSendMessage}
        onReplyMessage={handleReply}
        onEditMessage={handleEdit}
        onDeleteMessage={handleDelete}
        loading={loading}
        hasMore={hasMore}
        skipAutoScroll={skipAutoScroll}
        composerValue={composerValue}
        composerMode={composerMode}
        composerPreview={composerPreview}
        onComposerChange={setComposerValue}
        onComposerCancel={() => {
          setComposerMode(null);
          setComposerPreview(undefined);
          setReplyToId(undefined);
          setComposerValue("");
        }}
        onLoadMore={async () => {
          if (!selectedRoom?.id) return;
          const nextPage = page - 1;
          setSkipAutoScroll(true);
          const older = await repo.getMessages(selectedRoom.id, {
            page: nextPage,
            limit: 50,
          });
          if (older?.data?.length) {
            setMessages((prev) => [...older.data, ...prev]);
            setPage(nextPage);
            setHasMore(nextPage > 1);
          } else {
            setHasMore(false);
          }
          setTimeout(() => setSkipAutoScroll(false), 0);
        }}
        autoScrollSignal={autoScrollSignal}
        onNearBottom={async () => {
          if (!selectedRoom?.id) return;
          if (composerMode) return;
          const now = Date.now();
          if (mergingRef.current || now - (lastMergeAtRef.current || 0) < 2000)
            return;
          mergingRef.current = true;
          try {
            await markMessagesAsRead(selectedRoom.id);
            const refreshed = await repo.getMessages(selectedRoom.id, {
              page,
              limit: MESSAGES_PAGE_LIMIT,
            });
            const updates: any[] = refreshed?.data || [];
            setMessages((prev) => {
              const { next, changed } = mergeById(prev, updates);
              return changed ? next : prev;
            });
            lastMergeAtRef.current = Date.now();
          } catch (e) {
          } finally {
            setTimeout(() => {
              mergingRef.current = false;
            }, 0);
          }
        }}
      />
    </div>
  );
}
