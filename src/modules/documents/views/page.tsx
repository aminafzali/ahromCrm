"use client";

import { useEffect, useState } from "react";
import UploadForm from "../components/UploadForm";
import { useDocument } from "../hooks/useDocument";

export default function DocumentsPage() {
  const { getAll, loading, remove } = useDocument();
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [entityType, setEntityType] = useState("");
  const [entityId, setEntityId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    (async () => {
      const res = await getAll({ page: 1, limit: 20 });
      setItems(res.data);
    })();
  }, [getAll]);

  const refresh = async () => {
    const filters: any = {};
    if (search) filters.search = search;
    if (type) filters.type = type;
    if (entityType) filters.entityType = entityType;
    if (entityId) filters.entityId = Number(entityId);
    if (categoryId) filters.categoryId = Number(categoryId);
    const res = await getAll({ page: 1, limit: 20, ...filters });
    setItems(res.data);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">مدیریت اسناد</h1>
      <div className="grid md:grid-cols-5 gap-2">
        <input
          className="border p-2"
          placeholder="جستجو"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="entityType"
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="entityId"
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button className="bg-gray-200 px-3 py-1 rounded" onClick={refresh}>
          اعمال فیلتر
        </button>
        <button
          className="bg-gray-100 px-3 py-1 rounded"
          onClick={() => {
            setSearch("");
            setType("");
            setEntityType("");
            setEntityId("");
            setCategoryId("");
          }}
        >
          پاکسازی
        </button>
      </div>
      <UploadForm
        onUploaded={() => {
          refresh();
        }}
      />
      {loading ? (
        <div>در حال بارگذاری...</div>
      ) : (
        <div className="border rounded">
          <table className="w-full">
            <thead>
              <tr className="text-right">
                <th className="p-2">نام</th>
                <th className="p-2">نوع</th>
                <th className="p-2">اندازه</th>
                <th className="p-2">دانلود</th>
                <th className="p-2">حذف</th>
              </tr>
            </thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="p-2">{d.originalName}</td>
                  <td className="p-2">{d.mimeType}</td>
                  <td className="p-2">{d.size}</td>
                  <td className="p-2">
                    <a
                      className="text-blue-600"
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      دانلود
                    </a>
                  </td>
                  <td className="p-2">
                    <button
                      className="text-red-600"
                      onClick={async () => {
                        await remove(d.id);
                        refresh();
                      }}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
