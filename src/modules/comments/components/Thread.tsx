"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useComments } from "../hooks/useComments";

export default function CommentsThread({
  entityType,
  entityId,
}: {
  entityType: string;
  entityId: number;
}) {
  const { getAll, create, update, remove, like, unlike } = useComments();
  const [items, setItems] = useState<any[]>([]);
  const [body, setBody] = useState("");
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});
  const [showReplyInput, setShowReplyInput] = useState<Record<number, boolean>>(
    {}
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBody, setEditBody] = useState<string>("");

  // Convert entityType/entityId to new filter format
  const getFilterKey = useCallback((entityType: string): string | null => {
    const typeMap: Record<string, string> = {
      Task: "taskId",
      Knowledge: "knowledgeId",
      Document: "documentId",
      Project: "projectId",
    };
    return typeMap[entityType] || null;
  }, []);

  // Single load function that can be called from anywhere
  const load = useCallback(async () => {
    if (!entityType || !entityId) {
      setItems([]);
      return;
    }
    try {
      const numEntityId = Number(entityId);
      const filterKey = getFilterKey(entityType);

      if (!filterKey) {
        console.error("[CommentsThread] Invalid entityType:", entityType);
        setItems([]);
        return;
      }

      const filters: Record<string, number> = {
        [filterKey]: numEntityId,
      };

      console.log("[CommentsThread] Loading comments for:", {
        entityType,
        entityId: numEntityId,
        filterKey,
        filters,
      });

      const res = await getAll({
        page: 1,
        limit: 100,
        ...filters,
      });
      console.log("[CommentsThread] Loaded comments:", res?.data?.length || 0);
      setItems(res?.data || []);
    } catch (error) {
      console.error("[CommentsThread] Load error:", error);
      setItems([]);
    }
  }, [getAll, entityType, entityId, getFilterKey]);

  // Single useEffect that loads comments on mount or when entity changes
  useEffect(() => {
    if (!entityType || !entityId) {
      setItems([]);
      return;
    }

    let cancelled = false;

    const loadComments = async () => {
      if (cancelled) return;

      try {
        const numEntityId = Number(entityId);
        const filterKey = getFilterKey(entityType);

        if (!filterKey) {
          console.error("[CommentsThread] Invalid entityType:", entityType);
          if (!cancelled) setItems([]);
          return;
        }

        const filters: Record<string, number> = {
          [filterKey]: numEntityId,
        };

        console.log("[CommentsThread] useEffect: Loading comments for:", {
          entityType,
          entityId: numEntityId,
          filterKey,
          filters,
        });

        const res = await getAll({
          page: 1,
          limit: 100,
          ...filters,
        });

        if (!cancelled) {
          console.log(
            "[CommentsThread] useEffect: Loaded comments:",
            res?.data?.length || 0
          );
          setItems(res?.data || []);
        }
      } catch (error) {
        console.error("[CommentsThread] useEffect: Load error:", error);
        if (!cancelled) setItems([]);
      }
    };

    setItems([]); // Clear items first
    loadComments();

    return () => {
      cancelled = true;
    };
  }, [entityType, entityId, getAll, getFilterKey]);

  const submit = useCallback(async () => {
    const txt = body.trim();
    if (!txt) return;
    try {
      // Convert to new format for create
      const filterKey = getFilterKey(entityType);
      if (!filterKey) {
        console.error(
          "[CommentsThread] Invalid entityType for create:",
          entityType
        );
        return;
      }

      const createData: Record<string, any> = {
        [filterKey]: Number(entityId),
        body: txt,
      };

      await create(createData as any);
      setBody("");
      load();
    } catch (error) {
      console.error("[CommentsThread] Submit error:", error);
    }
  }, [body, entityType, entityId, create, load, getFilterKey]);

  const handleEdit = useCallback((comment: any) => {
    setEditingId(comment.id);
    setEditBody(comment.body);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditBody("");
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingId || !editBody.trim()) return;
    try {
      await update(editingId, { body: editBody.trim() } as any);
      setEditingId(null);
      setEditBody("");
      load();
    } catch (error) {
      console.error("[CommentsThread] Update error:", error);
    }
  }, [editingId, editBody, update, load]);

  const roots = useMemo(() => items.filter((c: any) => !c.parentId), [items]);
  const childrenOf = useMemo(
    () =>
      items.reduce((acc: Record<number, any[]>, c: any) => {
        if (c.parentId) {
          acc[c.parentId] = acc[c.parentId] || [];
          acc[c.parentId].push(c);
        }
        return acc;
      }, {}),
    [items]
  );

  const submitReply = useCallback(
    async (parentId: number) => {
      const txt = (replyMap[parentId] || "").trim();
      if (!txt) return;
      try {
        const filterKey = getFilterKey(entityType);
        if (!filterKey) {
          console.error(
            "[CommentsThread] Invalid entityType for reply:",
            entityType
          );
          return;
        }

        const createData: Record<string, any> = {
          [filterKey]: Number(entityId),
          body: txt,
          parent: { id: parentId },
        };

        await create(createData as any);
        setReplyMap((m) => ({ ...m, [parentId]: "" }));
        setShowReplyInput((prev) => ({ ...prev, [parentId]: false }));
        load();
      } catch (error) {
        console.error("[CommentsThread] SubmitReply error:", error);
      }
    },
    [replyMap, entityType, entityId, create, load, getFilterKey]
  );

  const toggleLike = useCallback(
    async (c: any, e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      try {
        if (c.liked) {
          await unlike(c.id);
        } else {
          await like(c.id);
        }
        // Reload after a short delay to ensure server has updated
        setTimeout(() => {
          load();
        }, 300);
      } catch (error) {
        console.error("[CommentsThread] ToggleLike error:", error);
        // Reload anyway to show current state
        load();
      }
    },
    [like, unlike, load]
  );

  // Ref to track which reply input should be focused
  const replyInputRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});

  // Auto-focus reply input when it appears
  useEffect(() => {
    Object.keys(showReplyInput).forEach((key) => {
      const commentId = Number(key);
      if (showReplyInput[commentId]) {
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
          const textarea = replyInputRefs.current[commentId];
          if (textarea) {
            textarea.focus();
          }
        });
      }
    });
  }, [showReplyInput]);

  const CommentCard = ({ c }: { c: any }) => (
    <div className="p-3 rounded-xl border bg-white">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold">
          {(c.author?.displayName || c.author?.user?.name || "U").charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
            <span className="font-medium">
              {c.author?.displayName || c.author?.user?.name || "کاربر"}
            </span>
            <span>•</span>
            <span>{new Date(c.createdAt).toLocaleString()}</span>
          </div>
          {editingId === c.id ? (
            <div className="space-y-2">
              <textarea
                className="w-full p-2 border rounded-lg text-sm bg-white"
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={3}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  ذخیره
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                >
                  لغو
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm leading-6">{c.body}</div>
          )}
          <div className="mt-2 flex items-center gap-3 text-slate-500">
            <button
              type="button"
              aria-label="like"
              className={`hover:text-rose-600 transition flex items-center gap-1 ${
                c.liked ? "text-rose-600" : ""
              }`}
              onClick={(e) => toggleLike(c, e)}
            >
              <DIcon
                icon={c.liked ? "fa-heart" : "fa-heart"}
                classCustom={`${c.liked ? "fa-solid" : "fa-regular"}`}
              />
              <span className="text-xs">
                {c._count?.likes ?? c.likeCount ?? 0}
              </span>
            </button>
            <button
              aria-label="reply"
              className="hover:text-blue-600 transition"
              onClick={() => {
                setShowReplyInput((prev) => ({
                  ...prev,
                  [c.id]: !prev[c.id],
                }));
                if (!showReplyInput[c.id]) {
                  setReplyMap((m) => ({ ...m, [c.id]: m[c.id] || "" }));
                }
              }}
            >
              <DIcon icon="fa-reply" />
            </button>
            <button
              aria-label="edit"
              className="hover:text-green-600 transition"
              onClick={() => handleEdit(c)}
            >
              <DIcon icon="fa-pen-to-square" />
            </button>
            <button
              aria-label="remove"
              className="hover:text-red-600 transition"
              onClick={async () => {
                try {
                  await remove(c.id);
                  load();
                } catch (error) {
                  console.error("[CommentsThread] Remove error:", error);
                }
              }}
            >
              <DIcon icon="fa-trash" />
            </button>
          </div>

          {/* replies */}
          <div className="mt-3 pl-4 border-r space-y-2">
            {(childrenOf[c.id] || []).map((r) => (
              <div key={r.id} className="p-2 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2 text-[11px] text-slate-600 mb-1">
                  <span className="font-medium">
                    {r.author?.displayName || r.author?.user?.name || "کاربر"}
                  </span>
                  <span>•</span>
                  <span>{new Date(r.createdAt).toLocaleString()}</span>
                </div>
                {editingId === r.id ? (
                  <div className="space-y-2">
                    <textarea
                      className="w-full p-2 border rounded-lg text-sm bg-white"
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={2}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        ذخیره
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                      >
                        لغو
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm">{r.body}</div>
                )}
                <div className="mt-1 flex items-center gap-3 text-slate-500">
                  <button
                    type="button"
                    aria-label="like"
                    className={`hover:text-rose-600 transition flex items-center gap-1 ${
                      r.liked ? "text-rose-600" : ""
                    }`}
                    onClick={(e) => toggleLike(r, e)}
                  >
                    <DIcon
                      icon={r.liked ? "fa-heart" : "fa-heart"}
                      classCustom={`${r.liked ? "fa-solid" : "fa-regular"}`}
                    />
                    <span className="text-xs">
                      {r._count?.likes ?? r.likeCount ?? 0}
                    </span>
                  </button>
                  <button
                    aria-label="edit"
                    className="hover:text-green-600 transition"
                    onClick={() => handleEdit(r)}
                  >
                    <DIcon icon="fa-pen-to-square" />
                  </button>
                  <button
                    aria-label="remove"
                    className="hover:text-red-600 transition"
                    onClick={async () => {
                      try {
                        await remove(r.id);
                        load();
                      } catch (error) {
                        console.error(
                          "[CommentsThread] Remove reply error:",
                          error
                        );
                      }
                    }}
                  >
                    <DIcon icon="fa-trash" />
                  </button>
                </div>
              </div>
            ))}
            {/* reply input - only show if reply button was clicked */}
            {showReplyInput[c.id] && (
              <div className="flex items-center gap-2 bg-gray-50 border rounded-lg px-2 py-1">
                <textarea
                  key={`reply-input-${c.id}-${showReplyInput[c.id]}`}
                  ref={(el) => {
                    if (el) {
                      replyInputRefs.current[c.id] = el;
                      // Focus immediately when ref is set
                      setTimeout(() => el.focus(), 0);
                    } else {
                      delete replyInputRefs.current[c.id];
                    }
                  }}
                  className="flex-1 min-w-0 text-sm bg-transparent outline-none resize-none"
                  value={replyMap[c.id] || ""}
                  onChange={(e) => {
                    setReplyMap((m) => ({ ...m, [c.id]: e.target.value }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submitReply(c.id);
                    }
                  }}
                  placeholder="پاسخ..."
                  rows={1}
                  style={{ minHeight: "2rem", maxHeight: "6rem" }}
                />
                <button
                  type="button"
                  aria-label="send-reply"
                  className="text-blue-600 hover:text-blue-700"
                  onClick={() => submitReply(c.id)}
                >
                  <DIcon icon="fa-paper-plane" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="font-bold">نظرات</div>
      <div className="flex items-center gap-2 bg-gray-50 border rounded-lg px-2 py-1">
        <textarea
          className="flex-1 min-w-0 text-sm bg-transparent outline-none resize-none"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="نظر خود را بنویسید (Enter برای ارسال، Shift+Enter برای خط جدید)"
          rows={1}
          style={{ minHeight: "2rem", maxHeight: "6rem" }}
        />
        <button
          type="button"
          aria-label="send"
          className="text-blue-600 hover:text-blue-700"
          onClick={submit}
        >
          <DIcon icon="fa-paper-plane" />
        </button>
      </div>
      <div className="space-y-3">
        {roots.map((c) => (
          <CommentCard key={`comment-${c.id}`} c={c} />
        ))}
      </div>
    </div>
  );
}
