"use client";

import RichTextEditor from "@/@Client/Components/ui/RichTextEditor";
import Select3 from "@/@Client/Components/ui/Select3";
import { useKnowledgeCategory } from "@/modules/knowledge-categories/hooks/useKnowledgeCategory";
import { Button, Input } from "ndui-ahrom";
import { useEffect, useState } from "react";
import {
  createKnowledgeSchema,
  updateKnowledgeSchema,
} from "../validation/schema";

export default function KnowledgeForm({
  onSubmit,
  loading = false,
  initialData,
}: {
  onSubmit: (data: any) => void;
  loading?: boolean;
  initialData?: any;
}) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [categoryId, setCategoryId] = useState<number | undefined>(
    initialData?.category?.id
  );

  const { getAll: getAllCategories } = useKnowledgeCategory();
  const [categoryOptions, setCategoryOptions] = useState<
    { label: string; value: number }[]
  >([]);

  useEffect(() => {
    getAllCategories({ page: 1, limit: 1000 }).then((res) => {
      setCategoryOptions(
        (res?.data || []).map((c: any) => ({ label: c.name, value: c.id }))
      );
    });
  }, [getAllCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      slug,
      excerpt: excerpt || undefined,
      content,
      status,
      category: categoryId ? { id: categoryId } : undefined,
    };
    const schema = initialData ? updateKnowledgeSchema : createKnowledgeSchema;
    const res = schema.safeParse(payload);
    if (!res.success) return;
    onSubmit(res.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white rounded-lg p-4 border space-y-4">
        <Input
          name="title"
          label="عنوان"
          value={title}
          onChange={(e: any) => setTitle(e.target.value)}
          required
        />
        <Input
          name="slug"
          label="اسلاگ"
          value={slug}
          onChange={(e: any) => setSlug(e.target.value)}
          required
        />
        <Input
          name="excerpt"
          label="خلاصه"
          value={excerpt}
          onChange={(e: any) => setExcerpt(e.target.value)}
        />
        <div>
          <label className="label">
            <span className="label-text">محتوا</span>
          </label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="محتوای دانش را اینجا بنویسید..."
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Select3
            name="status"
            label="وضعیت"
            value={status}
            onChange={(e: any) => setStatus(e?.target ? e.target.value : e)}
            options={[
              { label: "پیش‌نویس", value: "DRAFT" },
              { label: "انتشار", value: "PUBLISHED" },
              { label: "آرشیو", value: "ARCHIVED" },
            ]}
          />
          <Select3
            name="category"
            label="دسته"
            value={categoryId}
            onChange={(e: any) =>
              setCategoryId(
                e?.target?.value ? Number(e.target.value) : Number(e)
              )
            }
            options={categoryOptions}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={loading} loading={loading}>
          {initialData ? "ذخیره" : "ایجاد"}
        </Button>
      </div>
    </form>
  );
}
