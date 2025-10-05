"use client";

import { useEffect, useState } from "react";
import CreateForm from "../components/CreateForm";
import TreeList from "../components/TreeList";
import { useDocumentCategory } from "../hooks/useDocumentCategory";

export default function DocumentCategoriesPage() {
  const { getAll, loading } = useDocumentCategory();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const res = await getAll({ page: 1, limit: 100 });
      setItems(res.data);
    })();
  }, [getAll]);

  const refresh = async () => {
    const res = await getAll({ page: 1, limit: 100 });
    setItems(res.data);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">دسته‌های اسناد</h1>
      <CreateForm onCreated={refresh} />
      {loading ? <div>در حال بارگذاری...</div> : <TreeList items={items} />}
    </div>
  );
}
