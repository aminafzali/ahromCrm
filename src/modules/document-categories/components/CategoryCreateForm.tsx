"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { Button, Input, Select } from "ndui-ahrom";
import React, { useEffect, useState } from "react";
import { useDocumentCategory } from "../hooks/useDocumentCategory";

export default function CategoryCreateForm({
  onCreated,
}: {
  onCreated?: () => void;
}) {
  const { getAll, create, submitting } = useDocumentCategory();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [options, setOptions] = useState<{ label: string; value: number }[]>(
    []
  );

  useEffect(() => {
    (async () => {
      const res = await getAll({ page: 1, limit: 1000 });
      setOptions(
        (res?.data || []).map((c: any) => ({ label: c.name, value: c.id }))
      );
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create({
      name,
      description,
      parent: parentId ? { id: Number(parentId) } : undefined,
    } as any);
    setName("");
    setDescription("");
    setParentId("");
    onCreated?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="card bg-white border p-4 space-y-3">
        <div className="grid md:grid-cols-3 gap-3 items-end">
          <Input
            name="name"
            label="نام"
            value={name}
            onChange={(e: any) => setName(e.target.value)}
            required
          />
          <Input
            name="description"
            label="توضیح"
            value={description}
            onChange={(e: any) => setDescription(e.target.value)}
          />
          <Select
            name="parentId"
            label="والد (اختیاری)"
            value={parentId}
            onChange={(e: any) => setParentId(e.target.value)}
            options={[{ label: "بدون والد", value: "" as any }, ...options]}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={submitting}
          icon={<DIcon icon="fa-plus" cdi={false} classCustom="ml-2" />}
        >
          ایجاد دسته
        </Button>
      </div>
    </form>
  );
}
