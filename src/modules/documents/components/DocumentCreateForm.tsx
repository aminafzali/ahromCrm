"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { useInvoice } from "@/modules/invoices/hooks/useInvoice";
import { useProject } from "@/modules/projects/hooks/useProject";
import { useRequest } from "@/modules/requests/hooks/useRequest";
import { useTask } from "@/modules/tasks/hooks/useTask";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { Button, Select } from "ndui-ahrom";
import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDocumentCategory } from "../../document-categories/hooks/useDocumentCategory";

interface Props {
  onCreated?: (created: any[]) => void;
  loading?: boolean;
}

export default function DocumentCreateForm({
  onCreated,
  loading = false,
}: Props) {
  const form = useForm();
  const { getAll: getAllCategories } = useDocumentCategory();
  const [files, setFiles] = useState<FileList | null>(null);
  const [type, setType] = useState<string>("image");
  const [categoryId, setCategoryId] = useState<string>("");
  const [entityType, setEntityType] = useState<string>("");
  const [entityId, setEntityId] = useState<string>("");
  const [categories, setCategories] = useState<
    { label: string; value: string }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showEntityPicker, setShowEntityPicker] = useState(false);
  const [searchCategory, setSearchCategory] = useState("");
  const [searchEntity, setSearchEntity] = useState("");
  const [uiError, setUiError] = useState<string | null>(null);

  // entity link dynamic options
  const { getAll: getAllProjects } = useProject();
  const { getAll: getAllTasks } = useTask();
  const { getAll: getAllWorkspaceUsers } = useWorkspaceUser();
  const { getAll: getAllInvoices } = useInvoice();
  const { getAll: getAllRequests } = useRequest();
  const [entityOptions, setEntityOptions] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllCategories({ page: 1, limit: 1000 });
        const opts = (res?.data || []).map((c: any) => ({
          label: c.name,
          value: String(c.id),
        }));
        setCategories(opts);
        console.debug("[DOC_FORM] categories loaded:", opts.length);
      } catch (e) {
        console.error("[DOC_FORM] categories load error", e);
      }
    })();
  }, [getAllCategories]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        let opts: { label: string; value: string }[] = [];
        if (entityType === "project") {
          const res = await getAllProjects({ page: 1, limit: 1000 });
          opts = (res?.data || []).map((p: any) => ({
            label: p.name,
            value: String(p.id),
          }));
        } else if (entityType === "task") {
          const res = await getAllTasks({ page: 1, limit: 1000 });
          opts = (res?.data || []).map((t: any) => ({
            label: t.title,
            value: String(t.id),
          }));
        } else if (entityType === "user") {
          const res = await getAllWorkspaceUsers({ page: 1, limit: 1000 });
          opts = (res?.data || []).map((u: any) => ({
            label: u.displayName || u.user?.name,
            value: String(u.id),
          }));
        } else if (entityType === "invoice") {
          const res = await getAllInvoices({ page: 1, limit: 1000 });
          opts = (res?.data || []).map((inv: any) => ({
            label: inv.numberName || `فاکتور #${inv.id}`,
            value: String(inv.id),
          }));
        } else if (entityType === "request") {
          const res = await getAllRequests({ page: 1, limit: 1000 });
          opts = (res?.data || []).map((r: any) => ({
            label: r.title || `درخواست #${r.id}`,
            value: String(r.id),
          }));
        }
        if (!ignore) {
          setEntityOptions(opts);
          setEntityId("");
          console.debug(
            "[DOC_FORM] entity options loaded:",
            entityType,
            opts.length
          );
        }
      } catch (e) {
        if (!ignore) {
          setEntityOptions([]);
          setEntityId("");
          console.warn(
            "[DOC_FORM] entity options load failed for",
            entityType,
            e
          );
        }
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [
    entityType,
    getAllProjects,
    getAllTasks,
    getAllWorkspaceUsers,
    getAllInvoices,
    getAllRequests,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.debug("[DOC_FORM] submit clicked");
    if (!files || files.length === 0) {
      console.warn("[DOC_FORM] no files selected");
      setUiError("لطفاً حداقل یک فایل انتخاب کنید");
      return;
    }
    setUiError(null);
    setSubmitting(true);
    try {
      const form = new FormData();
      Array.from(files).forEach((f) => form.append("files", f));
      if (type) form.append("type", type);
      if (categoryId) form.append("categoryId", String(Number(categoryId)));
      if (entityType) form.append("entityType", entityType);
      if (entityId) form.append("entityId", entityId);

      console.debug("[DOC_FORM] upload start", {
        files: files.length,
        type,
        categoryId,
        entityType,
        entityId,
      });
      const res = await fetch(`/api/documents/upload`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const msg = await res.text();
        console.error("[DOC_FORM] upload failed", res.status, msg);
        throw new Error("Upload failed");
      }
      const data = await res.json();
      console.debug("[DOC_FORM] upload success", data?.files?.length);
      onCreated?.(data.files || []);
      setFiles(null);
      setType("image");
      setCategoryId("");
      setEntityType("");
      setEntityId("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card bg-white border p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uiError && (
              <div className="md:col-span-2">
                <div className="alert alert-error">
                  <DIcon icon="fa-exclamation-triangle" cdi={false} />
                  <span>{uiError}</span>
                </div>
              </div>
            )}
            <div>
              <label className="label">
                <span className="label-text font-medium">فایل‌ها</span>
              </label>
              <input
                type="file"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="file-input file-input-bordered w-full"
              />
            </div>

            {/* پیش‌نمایش اطلاعات فایل‌ها مطابق اسکیمای مدل (read-only) */}
            {files && files.length > 0 && (
              <div className="md:col-span-2">
                <div className="overflow-auto border rounded-lg">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th className="whitespace-nowrap">originalName</th>
                        <th className="whitespace-nowrap">mimeType</th>
                        <th className="whitespace-nowrap">size (bytes)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(files).map((f, idx) => (
                        <tr key={idx}>
                          <td className="font-mono text-xs">{f.name}</td>
                          <td className="font-mono text-xs">
                            {(f as any).type || ""}
                          </td>
                          <td className="font-mono text-xs">{f.size}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs mt-2 text-gray-600">
                  این فیلدها در سمت سرور به صورت خودکار به مقادیر اسکیمای مدل
                  (originalName, filename, mimeType, size, url) تبدیل و ذخیره
                  می‌شوند.
                </p>
              </div>
            )}
            <Select
              name="type"
              label="نوع فایل"
              value={type}
              onChange={(e: any) => setType(e.target.value)}
              options={[
                { label: "تصویر", value: "image" as any },
                { label: "PDF", value: "pdf" as any },
                { label: "سند", value: "doc" as any },
                { label: "سایر", value: "other" as any },
              ]}
            />
            <div className="flex flex-col gap-2">
              <label className="label">
                <span className="label-text font-medium">دسته (اختیاری)</span>
              </label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCategoryPicker(true)}
                >
                  انتخاب دسته
                </Button>
                <span className="text-sm text-gray-600">
                  {categoryId
                    ? categories.find((c) => c.value === categoryId)?.label ||
                      "--"
                    : "انتخاب نشده"}
                </span>
                {categoryId && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setCategoryId("")}
                  >
                    پاک کردن
                  </Button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="label">
                <span className="label-text font-medium">
                  نوع موجودیت (اختیاری)
                </span>
              </label>
              <Select
                name="entityType"
                value={entityType}
                onChange={(e: any) => setEntityType(e.target.value)}
                options={[
                  { label: "انتخاب نشده", value: "" as any },
                  { label: "پروژه", value: "project" as any },
                  { label: "وظیفه", value: "task" as any },
                  { label: "کاربر", value: "user" as any },
                  { label: "فاکتور", value: "invoice" as any },
                  { label: "درخواست", value: "request" as any },
                ]}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="label">
                <span className="label-text font-medium">
                  مورد مرتبط (اختیاری)
                </span>
              </label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => entityType && setShowEntityPicker(true)}
                  disabled={!entityType}
                >
                  انتخاب مورد
                </Button>
                <span className="text-sm text-gray-600">
                  {entityId
                    ? entityOptions.find((o) => o.value === entityId)?.label ||
                      `#${entityId}`
                    : "انتخاب نشده"}
                </span>
                {entityId && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setEntityId("")}
                  >
                    پاک کردن
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category Picker Modal */}
        {showCategoryPicker && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">انتخاب دسته</h3>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setShowCategoryPicker(false)}
                >
                  بستن
                </Button>
              </div>
              <div className="mb-3">
                <input
                  className="input input-bordered w-full"
                  placeholder="جستجو..."
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                />
              </div>
              <div className="overflow-auto max-h-80">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>نام</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories
                      .filter((c) => c.label.includes(searchCategory))
                      .map((c) => (
                        <tr key={c.value} className="hover">
                          <td>{c.label}</td>
                          <td>
                            <Button
                              variant="ghost"
                              type="button"
                              onClick={() => {
                                setCategoryId(c.value);
                                setShowCategoryPicker(false);
                              }}
                            >
                              انتخاب
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Entity Picker Modal */}
        {showEntityPicker && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">انتخاب مورد مرتبط</h3>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setShowEntityPicker(false)}
                >
                  بستن
                </Button>
              </div>
              <div className="mb-3">
                <input
                  className="input input-bordered w-full"
                  placeholder="جستجو..."
                  value={searchEntity}
                  onChange={(e) => setSearchEntity(e.target.value)}
                />
              </div>
              <div className="overflow-auto max-h-96">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>عنوان/نام</th>
                      <th>شناسه</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entityOptions
                      .filter((o) => o.label?.toString().includes(searchEntity))
                      .map((o) => (
                        <tr key={o.value} className="hover">
                          <td>{o.label}</td>
                          <td className="font-mono">{o.value}</td>
                          <td>
                            <Button
                              variant="ghost"
                              type="button"
                              onClick={() => {
                                setEntityId(o.value);
                                setShowEntityPicker(false);
                              }}
                            >
                              انتخاب
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading || submitting || !files || files.length === 0}
            icon={<DIcon icon="fa-upload" cdi={false} classCustom="ml-2" />}
          >
            آپلود و ایجاد
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
