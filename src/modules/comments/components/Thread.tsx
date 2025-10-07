"use client";

import { useEffect, useMemo, useState } from "react";
import { useComments } from "../hooks/useComments";

export default function CommentsThread({
  entityType,
  entityId,
}: {
  entityType: string;
  entityId: number;
}) {
  const { getAll, create, remove, update, like, unlike } = useComments();
  const [items, setItems] = useState<any[]>([]);
  const [body, setBody] = useState("");
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});

  const load = async () => {
    const res = await getAll({
      page: 1,
      limit: 100,
      filters: { entityType, entityId },
    });
    setItems(res?.data || []);
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

  return (
    <div className="space-y-3">
      <div className="font-bold">نظرات</div>
      <div className="flex gap-2">
        <input
          className="input input-bordered flex-1"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="نظر خود را بنویسید"
        />
        <button className="btn btn-primary text-white" onClick={submit}>
          ارسال
        </button>
      </div>
      <div className="space-y-2">
        {roots.map((c) => (
          <div key={c.id} className="p-2 rounded-lg border bg-white">
            <div className="text-sm">{c.body}</div>
            <div className="text-xs text-slate-500 mt-1 flex gap-3">
              <span>{new Date(c.createdAt).toLocaleString()}</span>
              <button className="link" onClick={() => like(c.id).then(load)}>
                پسندیدم
              </button>
              <button className="link" onClick={() => remove(c.id).then(load)}>
                حذف
              </button>
            </div>
            {/* پاسخ‌ها */}
            <div className="mt-2 pl-4 border-r space-y-2">
              {(childrenOf[c.id] || []).map((r) => (
                <div key={r.id} className="p-2 rounded bg-slate-50">
                  <div className="text-sm">{r.body}</div>
                  <div className="text-[11px] text-slate-500 mt-1 flex gap-3">
                    <span>{new Date(r.createdAt).toLocaleString()}</span>
                    <button
                      className="link"
                      onClick={() => like(r.id).then(load)}
                    >
                      پسندیدم
                    </button>
                    <button
                      className="link"
                      onClick={() => remove(r.id).then(load)}
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  className="input input-bordered flex-1"
                  value={replyMap[c.id] || ""}
                  onChange={(e) =>
                    setReplyMap((m) => ({ ...m, [c.id]: e.target.value }))
                  }
                  placeholder="پاسخ..."
                />
                <button
                  className="btn btn-ghost"
                  onClick={() => submitReply(c.id)}
                >
                  ارسال
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
