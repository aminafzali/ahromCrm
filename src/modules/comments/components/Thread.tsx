"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { useEffect, useMemo, useState } from "react";
import { useComments } from "../hooks/useComments";

export default function CommentsThread({
  entityType,
  entityId,
}: {
  entityType: string;
  entityId: number;
}) {
  const { getAll, create, remove, like, unlike } = useComments();
  const [items, setItems] = useState<any[]>([]);
  const [body, setBody] = useState("");
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});

  const load = async () => {
    try {
      const res = await getAll({
        page: 1,
        limit: 100,
        filters: { entityType, entityId },
      });
      setItems(res?.data || []);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId]);

  const submit = async () => {
    const txt = body.trim();
    if (!txt) return;
    await create({ entityType, entityId, body: txt } as any);
    setBody("");
    load();
  };

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

  const submitReply = async (parentId: number) => {
    const txt = (replyMap[parentId] || "").trim();
    if (!txt) return;
    await create({
      entityType,
      entityId,
      body: txt,
      parent: { id: parentId },
    } as any);
    setReplyMap((m) => ({ ...m, [parentId]: "" }));
    load();
  };

  const toggleLike = async (c: any) => {
    try {
      if (c.liked) await unlike(c.id);
      else await like(c.id);
      load();
    } catch {}
  };

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
          <div className="text-sm leading-6">{c.body}</div>
          <div className="mt-2 flex items-center gap-3 text-slate-500">
            <button
              aria-label="like"
              className={`hover:text-rose-600 transition flex items-center gap-1 ${
                c.liked ? "text-rose-600" : ""
              }`}
              onClick={() => toggleLike(c)}
            >
              <DIcon
                icon={c.liked ? "fa-heart" : "fa-heart"}
                classCustom={`${c.liked ? "fa-solid" : "fa-regular"}`}
              />
              <span className="text-xs">{c._count?.likes ?? 0}</span>
            </button>
            <button
              aria-label="reply"
              className="hover:text-blue-600 transition"
              onClick={() =>
                setReplyMap((m) => ({ ...m, [c.id]: m[c.id] || "" }))
              }
            >
              <DIcon icon="fa-reply" />
            </button>
            <button
              aria-label="remove"
              className="hover:text-red-600 transition"
              onClick={() => remove(c.id).then(load)}
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
                <div className="text-sm">{r.body}</div>
                <div className="mt-1 flex items-center gap-3 text-slate-500">
                  <button
                    aria-label="like"
                    className={`hover:text-rose-600 transition flex items-center gap-1 ${
                      r.liked ? "text-rose-600" : ""
                    }`}
                    onClick={() => toggleLike(r)}
                  >
                    <DIcon
                      icon={r.liked ? "fa-heart" : "fa-heart"}
                      classCustom={`${r.liked ? "fa-solid" : "fa-regular"}`}
                    />
                    <span className="text-xs">{r._count?.likes ?? 0}</span>
                  </button>
                  <button
                    aria-label="remove"
                    className="hover:text-red-600 transition"
                    onClick={() => remove(r.id).then(load)}
                  >
                    <DIcon icon="fa-trash" />
                  </button>
                </div>
              </div>
            ))}
            {/* reply input */}
            <div className="flex items-center gap-2 bg-gray-50 border rounded-lg px-2 py-1">
              <input
                className="flex-1 min-w-0 text-sm bg-transparent outline-none"
                value={replyMap[c.id] || ""}
                onChange={(e) =>
                  setReplyMap((m) => ({ ...m, [c.id]: e.target.value }))
                }
                placeholder="پاسخ..."
              />
              <button
                aria-label="send-reply"
                className="text-blue-600 hover:text-blue-700"
                onClick={() => submitReply(c.id)}
              >
                <DIcon icon="fa-paper-plane" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="font-bold">نظرات</div>
      <div className="flex items-center gap-2 bg-gray-50 border rounded-lg px-2 py-1">
        <input
          className="flex-1 min-w-0 text-sm bg-transparent outline-none"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="نظر خود را بنویسید"
        />
        <button
          aria-label="send"
          className="text-blue-600 hover:text-blue-700"
          onClick={submit}
        >
          <DIcon icon="fa-paper-plane" />
        </button>
      </div>
      <div className="space-y-3">
        {roots.map((c) => (
          <CommentCard key={c.id} c={c} />
        ))}
      </div>
    </div>
  );
}
