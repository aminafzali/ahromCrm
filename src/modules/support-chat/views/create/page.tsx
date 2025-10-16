"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { Button } from "ndui-ahrom";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSupportChat } from "../../hooks/useSupportChat";

interface CreateTicketPageProps {
  backUrl?: string;
  isAdmin?: boolean;
}

export default function CreateTicketPage({
  backUrl = "/dashboard/support-chat",
  isAdmin = false,
}: CreateTicketPageProps) {
  const router = useRouter();
  const { repo } = useSupportChat();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [priority, setPriority] = useState<string>("MEDIUM");
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const cats = await repo.getCategories();
      setCategories(cats || []);
    } catch (error) {
      console.error("❌ [Create Ticket] Error loading categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !description.trim()) {
      alert("لطفاً موضوع و توضیحات را وارد کنید");
      return;
    }

    try {
      setLoading(true);
      console.log("📤 [Create Ticket] Creating ticket...");

      const newTicket = await repo.createCustomerTicket({
        subject: subject.trim(),
        description: description.trim(),
        categoryId,
        priority,
      });

      console.log("✅ [Create Ticket] Ticket created:", newTicket.id);
      alert("تیکت با موفقیت ایجاد شد");
      router.push(`/dashboard/support-chat/${newTicket.id}`);
    } catch (error: any) {
      console.error("❌ [Create Ticket] Error:", error);
      alert(error?.message || "خطا در ایجاد تیکت");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push(backUrl)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <DIcon icon="fa-arrow-right" classCustom="text-xl text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">ایجاد تیکت جدید</h1>
          <p className="text-sm text-gray-500">
            سوال یا مشکل خود را با ما در میان بگذارید
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 p-6">
          {/* Subject */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              موضوع <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="موضوع تیکت را وارد کنید"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              توضیحات <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات کامل مشکل یا سوال خود را بنویسید"
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                دسته‌بندی
              </label>
              <select
                value={categoryId?.toString() || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setCategoryId(value ? parseInt(value) : undefined);
                }}
                disabled={loadingCategories}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              >
                <option value="">انتخاب دسته‌بندی</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                اولویت
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              >
                <option value="LOW">کم</option>
                <option value="MEDIUM">متوسط</option>
                <option value="HIGH">بالا</option>
                <option value="URGENT">فوری</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(backUrl)}
            disabled={loading}
          >
            انصراف
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || !subject.trim() || !description.trim()}
            icon={
              loading ? (
                <DIcon icon="fa-spinner" classCustom="animate-spin ml-2" />
              ) : (
                <DIcon icon="fa-check" classCustom="ml-2" />
              )
            }
          >
            {loading ? "در حال ارسال..." : "ایجاد تیکت"}
          </Button>
        </div>
      </form>
    </div>
  );
}
