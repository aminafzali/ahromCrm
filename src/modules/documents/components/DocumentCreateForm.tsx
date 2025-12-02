// مسیر فایل: src/modules/documents/components/DocumentCreateForm.tsx
"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Select23 from "@/@Client/Components/ui/select23";
import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { useInvoice } from "@/modules/invoices/hooks/useInvoice";
import { useProject } from "@/modules/projects/hooks/useProject";
import { useRequest } from "@/modules/requests/hooks/useRequest";
import { useTask } from "@/modules/tasks/hooks/useTask";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { Button } from "ndui-ahrom";
import React, { useEffect, useRef, useState } from "react";
import { useDocumentCategory } from "../../document-categories/hooks/useDocumentCategory";

interface Props {
  onCreated?: (created: any[]) => void;
  onError?: (error: any) => void;
  loading?: boolean;
  defaultValues?: Partial<{
    type: string;
    categoryId: string | number;
    entityType: string;
    entityId: string | number;
    taskId: string | number;
  }>;
}

export default function DocumentCreateForm({
  onCreated,
  onError,
  loading = false,
  defaultValues,
}: Props) {
  const { getAll: getAllCategories } = useDocumentCategory();
  const { activeWorkspace } = useWorkspace();
  const [files, setFiles] = useState<FileList | null>(null);
  const [type, setType] = useState<string>(
    (defaultValues?.type as string) || ""
  );
  const [categoryId, setCategoryId] = useState<string>(
    defaultValues?.categoryId != null ? String(defaultValues.categoryId) : ""
  );
  const [entityType, setEntityType] = useState<string>(
    (defaultValues?.entityType as string) || ""
  );
  const [entityId, setEntityId] = useState<string>(
    defaultValues?.entityId != null ? String(defaultValues.entityId) : ""
  );
  const [categories, setCategories] = useState<
    { label: string; value: string }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showEntityPicker, setShowEntityPicker] = useState(false);
  const [searchCategory, setSearchCategory] = useState("");
  const [searchEntity, setSearchEntity] = useState("");
  const [uiError, setUiError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // entity link dynamic options
  const { getAll: getAllProjects } = useProject();
  const { getAll: getAllTasks } = useTask();
  const { getAll: getAllWorkspaceUsers } = useWorkspaceUser();
  const { getAll: getAllInvoices } = useInvoice();
  const { getAll: getAllRequests } = useRequest();
  const [entityOptions, setEntityOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const lastLoadedEntityTypeRef = useRef<string | null>(null);
  const lastLoggedOptionsLenRef = useRef<number>(-1);

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
        // جلوگیری از لوپ: اگر نوع موجودیت تغییری نکرده، بارگذاری مجدد نکن
        if (lastLoadedEntityTypeRef.current === entityType) return;
        // اگر نوع انتخاب نشده، گزینه‌ها را خالی و شناسه را پاک کن
        if (!entityType) {
          setEntityOptions([]);
          setEntityId("");
          lastLoadedEntityTypeRef.current = entityType;
          return;
        }
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
          lastLoadedEntityTypeRef.current = entityType;
          if (lastLoggedOptionsLenRef.current !== opts.length) {
            console.debug(
              "[DOC_FORM] entity options loaded:",
              entityType,
              opts.length
            );
            lastLoggedOptionsLenRef.current = opts.length;
          }
        }
      } catch (e) {
        if (!ignore) {
          setEntityOptions([]);
          setEntityId("");
          lastLoadedEntityTypeRef.current = entityType;
          if (lastLoggedOptionsLenRef.current !== 0) {
            console.warn(
              "[DOC_FORM] entity options load failed for",
              entityType,
              e
            );
            lastLoggedOptionsLenRef.current = 0;
          }
        }
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [entityType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("[DOC_FORM] submit clicked", {
      filesCount: files?.length || 0,
      defaultValues,
    });
    if (!files || files.length === 0) {
      console.warn("[DOC_FORM] no files selected");
      setUiError("لطفاً حداقل یک فایل انتخاب کنید");
      return;
    }
    setUiError(null);
    setSubmitting(true);
    try {
      const form = new FormData();
      Array.from(files).forEach((f) => {
        form.append("files", f);
        console.log("[DOC_FORM] appended file", {
          name: f.name,
          size: f.size,
          type: (f as any).type,
        });
      });
      if (type) form.append("type", type);
      if (categoryId) form.append("categoryId", String(Number(categoryId)));
      if (entityType) form.append("entityType", entityType);
      if (entityId) form.append("entityId", String(entityId));
      if (
        defaultValues?.taskId !== undefined &&
        defaultValues?.taskId !== null
      ) {
        form.append("taskId", String(defaultValues.taskId));
        console.log("[DOC_FORM] appended taskId", defaultValues.taskId);
      }

      console.log("[DOC_FORM] upload start", {
        files: files.length,
        type,
        categoryId,
        entityType,
        entityId,
        taskId: defaultValues?.taskId,
      });
      const wsId = activeWorkspace?.workspaceId
        ? String(activeWorkspace.workspaceId)
        : null;
      console.log(
        "[DOC_FORM] resolved workspaceId from context:",
        wsId || "(none)"
      );

      const headers: Record<string, string> = {};
      if (wsId) headers["x-workspace-id"] = String(wsId);

      console.log("[DOC_FORM] sending request to /api/documents/upload", {
        headers,
        hasFiles: files.length > 0,
      });
      const res = await fetch(`/api/documents/upload`, {
        method: "POST",
        body: form,
        headers,
      });
      console.log("[DOC_FORM] response received", {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
      });
      if (!res.ok) {
        const msg = await res.text();
        console.error("[DOC_FORM] upload failed", {
          status: res.status,
          statusText: res.statusText,
          message: msg,
        });
        const err = new Error("Upload failed");
        try {
          onError?.(msg || err);
        } catch (e) {
          console.error("[DOC_FORM] onError callback failed", e);
        }
        throw err;
      }
      const data = await res.json();
      console.log("[DOC_FORM] upload success", {
        filesCount: data?.files?.length || 0,
        files: data?.files,
        fullResponse: data,
      });
      if (data?.files && Array.isArray(data.files) && data.files.length > 0) {
        console.log("[DOC_FORM] calling onCreated callback", {
          filesToPass: data.files,
        });
        onCreated?.(data.files || []);
      } else {
        console.warn("[DOC_FORM] no files in response or empty array", data);
      }
      // فقط فایل‌ها را پاک می‌کنیم، بقیه فیلدها را نگه می‌داریم
      setFiles(null);
      // نوع فایل را فقط اگر خالی بود reset می‌کنیم
      if (!type) setType("image");
    } catch (error: any) {
      console.error("[DOC_FORM] upload error", {
        error,
        message: error?.message,
        stack: error?.stack,
      });
      setUiError(error?.message || "خطا در آپلود فایل");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="card bg-white border p-4 rounded-xl shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          {uiError && (
            <div className="md:col-span-2">
              <div className="alert alert-error">
                <DIcon icon="fa-exclamation-triangle" cdi={false} />
                <span>{uiError}</span>
              </div>
            </div>
          )}
          {/* راست: دکمه انتخاب فایل + نمایش نام فایل چسبیده */}
          <div className="col-span-1">
            <label className="label">
              <span className="label-text font-medium">انتخاب فایل</span>
            </label>
            <div className="flex w-full">
              <Button
                type="button"
                variant="primary"
                className="bg-teal-800 border-teal-900 hover:bg-teal-700 hover:border-teal-800 text-white rounded-r-md rounded-l-none"
                onClick={() => fileInputRef.current?.click()}
                icon={
                  <DIcon
                    icon="fa-file-arrow-up"
                    cdi={false}
                    classCustom="ml-2"
                  />
                }
              >
                انتخاب فایل
              </Button>
              <div className="flex-1 border border-slate-300 rounded-l-md rounded-r-none px-3 py-2 text-sm text-slate-700 bg-white overflow-hidden text-ellipsis whitespace-nowrap">
                {files && files.length > 0
                  ? files.length === 1
                    ? files[0].name
                    : `${files[0].name} +${files.length - 1}`
                  : "فایلی انتخاب نشده"}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => {
                  const fl = e.target.files;
                  console.debug("[DOC_FORM] files selected", fl?.length || 0);
                  setFiles(fl);
                  if (fl && fl.length > 0) {
                    const mime = (fl[0] as any).type || "";
                    const fileName = fl[0].name || "";
                    const ext = fileName.split(".").pop()?.toLowerCase() || "";
                    let t = "other";
                    if (mime === "image/svg+xml" || ext === "svg") {
                      t = "svg";
                    } else if (mime.startsWith("image/")) {
                      t = "image";
                    } else if (mime === "application/pdf" || ext === "pdf") {
                      t = "pdf";
                    } else if (
                      mime.includes("word") ||
                      mime.includes("msword") ||
                      mime.includes("officedocument") ||
                      ext === "doc" ||
                      ext === "docx"
                    ) {
                      t = "doc";
                    }
                    setType(t);
                  } else {
                    setType("");
                  }
                }}
                className="hidden"
              />
            </div>
          </div>

          {/* چپ: دسته‌بندی */}
          <div className="flex flex-col gap-2">
            <label className="label">
              <span className="label-text font-medium">دسته (اختیاری)</span>
            </label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  console.debug("[DOC_FORM] open category picker");
                  setShowCategoryPicker(true);
                }}
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
            <div className="text-xs text-gray-500">
              یک دسته برای سند انتخاب کنید (اختیاری).
            </div>
          </div>

          {/* نمایش نوع فایل به صورت فقط خواندنی وقتی فایل انتخاب شده */}
          {files && files.length > 0 && (
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    نوع فایل (غیرقابل تغییر)
                  </span>
                </label>
                <input
                  className="input input-bordered w-full bg-slate-50"
                  value={type || "نامشخص"}
                  readOnly
                />
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className="label">
              <span className="label-text font-medium">
                نوع موجودیت (اختیاری)
              </span>
            </label>
            <Select23
              name="entityType"
              label="نوع موجودیت"
              value={entityType}
              onChange={(e) => {
                console.debug("[DOC_FORM] entityType change", e.target.value);
                setEntityType(e.target.value);
              }}
              options={[
                { label: "انتخاب نشده", value: "" as any },
                { label: "پروژه", value: "project" as any },
                { label: "وظیفه", value: "task" as any },
                { label: "کاربر", value: "user" as any },
                { label: "فاکتور", value: "invoice" as any },
                { label: "درخواست", value: "request" as any },
              ]}
            />
            <div className="text-xs text-gray-500 -mt-2">
              در صورت نیاز سند را به یک موجودیت مرتبط کنید.
            </div>
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
                variant="primary"
                onClick={() => {
                  console.debug("[DOC_FORM] open entity picker", {
                    entityType,
                  });
                  if (entityType) setShowEntityPicker(true);
                }}
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
            <div className="text-xs text-gray-500">
              ابتدا نوع موجودیت را انتخاب کنید سپس مورد را برگزینید.
            </div>
          </div>
        </div>

        {/* توضیحات پس از دسته‌بندی */}
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
          onClick={() => console.debug("[DOC_FORM] submit button clicked")}
          variant="primary"
          className="bg-teal-600 border-teal-600 hover:bg-teal-700 hover:border-teal-700 text-white"
          icon={
            <DIcon icon="fa-cloud-arrow-up" cdi={false} classCustom="ml-2" />
          }
        >
          آپلود و ایجاد
        </Button>
      </div>
    </form>
  );
}
