// // // // // مسیر فایل: src/modules/reminders/components/ReminderForm.tsx (نسخه اصلاح شده و بازطراحی شده)
"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import StandaloneDateTimePicker from "@/@Client/Components/ui/StandaloneDateTimePicker";
import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { columnsForAdmin as invoiceColumns } from "@/modules/invoices/data/table";
import { InvoiceRepository } from "@/modules/invoices/repo/InvoiceRepository";
import { useLabel } from "@/modules/labels/hooks/useLabel";
import { columnsForAdmin as requestColumns } from "@/modules/requests/data/table";
import { RequestRepository } from "@/modules/requests/repo/RequestRepository";
import { useUserGroup } from "@/modules/user-groups/hooks/useUserGroup";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "ndui-ahrom";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useReminder } from "../hooks/useReminder";
import { createReminderSchema } from "../validation/schema";
import SelectUserForReminder from "./SelectUserForReminder";

type SelectedEntity = {
  type: "Request" | "Invoice";
  id: number | null;
  name: string | null;
};

export default function ReminderForm() {
  // --- منطق کامپوننت (این بخش کاملاً دست‌نخورده باقی مانده است) ---
  const router = useRouter();
  const { create, submitting } = useReminder();
  const { getAll: getAllUserGroups } = useUserGroup();
  const { getAll: getAllLabels } = useLabel();
  const { getAll: getAllWorkspaceUsers } = useWorkspaceUser();

  const [modalContent, setModalContent] = useState<{
    type: "requests" | "invoices";
  } | null>(null);
  const [selectedUser, setSelectedUser] =
    useState<WorkspaceUserWithRelations | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(
    null
  );
  // گیرندگان و فیلترها برای ارسال گروهی
  const [recipients, setRecipients] = useState<{ workspaceUserId: number }[]>(
    []
  );
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [labels, setLabels] = useState<any[]>([]);
  const [workspaceUsers, setWorkspaceUsers] = useState<any[]>([]);
  const [groupIds, setGroupIds] = useState<number[]>([]);
  const [labelIds, setLabelIds] = useState<number[]>([]);
  const [q, setQ] = useState("");
  const [selectFiltered, setSelectFiltered] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof createReminderSchema>>({
    resolver: zodResolver(createReminderSchema),
    defaultValues: {
      title: "",
      description: "",
      workspaceUserId: 0,
      dueDate: undefined,
      entityId: undefined,
      entityType: undefined,
      notificationChannels: "ALL",
    },
  });

  useEffect(() => {
    register("entityId" as const);
    register("entityType" as const);
    register("workspaceUserId" as const);
    register("recipients" as const);
    register("filters" as const);
  }, [register]);

  const handleUserSelect = (user: WorkspaceUserWithRelations | null) => {
    setSelectedUser(user);
    setValue("workspaceUserId", user?.id ?? 0, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // واکشی داده‌های فیلتر و لیست کاربران برای انتخاب دستی گیرنده
  useEffect(() => {
    (async () => {
      const [ug, lb, wu] = await Promise.all([
        getAllUserGroups({ page: 1, limit: 1000 }).then((r) => r.data),
        getAllLabels({ page: 1, limit: 1000 }).then((r) => r.data),
        getAllWorkspaceUsers({ page: 1, limit: 1000 }).then((r) => r.data),
      ]);
      setUserGroups(ug || []);
      setLabels(lb || []);
      setWorkspaceUsers(wu || []);
    })();
  }, []); // eslint-disable-line

  const addRecipient = () =>
    setRecipients((prev) => [...prev, { workspaceUserId: 0 }]);
  const updateRecipient = (
    idx: number,
    patch: Partial<{ workspaceUserId: number }>
  ) =>
    setRecipients((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, ...patch } : r))
    );
  const removeRecipient = (idx: number) =>
    setRecipients((prev) => prev.filter((_, i) => i !== idx));

  const openEntitySelector = (type: "requests" | "invoices") => {
    setModalContent({ type });
  };

  const handleEntitySelect = (entity: any) => {
    if (!entity) return;
    const picked = Array.isArray(entity) ? entity[0] : entity;
    const id =
      picked?.id ??
      picked?._id ??
      picked?.requestId ??
      picked?.invoiceId ??
      null;

    if (!id) {
      console.warn("انتخاب شده ID ندارد:", picked);
      setModalContent(null);
      return;
    }

    const entityType =
      modalContent?.type === "requests" ? "Request" : "Invoice";
    const entityName =
      picked?.title ?? picked?.name ?? picked?.subject ?? `آیتم شماره ${id}`;

    setSelectedEntity({
      type: entityType as SelectedEntity["type"],
      id,
      name: entityName,
    });
    setValue("entityId", Number(id), {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("entityType", entityType, {
      shouldValidate: true,
      shouldDirty: true,
    });

    const wsUser =
      picked?.workspaceUser ??
      (picked?.workspaceUserId ? { id: picked.workspaceUserId } : null);
    if (wsUser) {
      if (wsUser.id && !wsUser.displayName) {
        setValue("workspaceUserId", Number(wsUser.id), {
          shouldValidate: true,
          shouldDirty: true,
        });
        setSelectedUser(null);
      } else {
        setSelectedUser(wsUser);
        setValue("workspaceUserId", Number(wsUser.id ?? 0), {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }
    setModalContent(null);
  };

  const handleSave = async (data: z.infer<typeof createReminderSchema>) => {
    try {
      // ست‌کردن recipients و filters از state به فرم قبل از ارسال
      if (recipients && recipients.length > 0) {
        (data as any).recipients = recipients.filter((r) => r.workspaceUserId);
      }
      if (selectFiltered) {
        (data as any).filters = { groupIds, labelIds, q, selectFiltered: true };
      }
      if (data.entityId !== null && data.entityId !== undefined) {
        data.entityId = Number(data.entityId);
      }
      if (data.workspaceUserId !== undefined) {
        data.workspaceUserId = Number(data.workspaceUserId);
      }
      const result = await create(data);
      if (result) {
        router.push("/dashboard/reminders");
      } else {
        console.error("Server returned falsy result on create");
        alert("ایجاد یادآور موفق نبود. مجدداً تلاش کنید.");
      }
    } catch (err) {
      console.error("خطا در ایجاد یادآور:", err);
      alert("خطا در ارسال به سرور. در کنسول بررسی کن.");
    }
  };

  const renderModalContent = () => {
    if (!modalContent) return null;
    const config =
      modalContent.type === "requests"
        ? { repo: new RequestRepository(), columns: requestColumns }
        : { repo: new InvoiceRepository(), columns: invoiceColumns };
    return (
      <IndexWrapper
        columns={config.columns}
        repo={config.repo}
        selectionMode="single"
        onSelect={handleEntitySelect}
        createUrl={false}
        showIconViews={false}
        defaultViewMode="table"
      />
    );
  };
  // --- پایان بخش منطق ---

  return (
    <>
      <div className="w-full bg-white shadow-md rounded-xl overflow-hidden">
        <div className="p-4 sm:p-2 md:p-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-0">
              ایجاد یادآور جدید
            </h3>
          </div>

          <form onSubmit={handleSubmit(handleSave)} noValidate>
            <div className="space-y-6 sm:space-y-8">
              {/* --- بخش ۱: اطلاعات اصلی --- */}
              <div>
                <h5 className="text-lg font-medium mb-4 text-right">
                  اطلاعات اصلی
                </h5>
                <div className="p-4 sm:p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium mb-2 text-right">
                        برای کاربر <span className="text-red-500">*</span>
                      </label>
                      {!selectedUser ? (
                        <SelectUserForReminder
                          onSelect={(user) => handleUserSelect(user)}
                        />
                      ) : (
                        <div className="flex items-center justify-end p-3 border border-gray-300 rounded-md bg-white">
                          <button
                            type="button"
                            className="ml-3 text-red-500 hover:text-red-700"
                            onClick={() => handleUserSelect(null)}
                          >
                            <DIcon icon="fa-times" cdi={false} />
                          </button>
                          <span className="text-sm sm:text-base flex-grow text-right">
                            {selectedUser?.displayName ?? selectedUser?.phone}
                          </span>
                        </div>
                      )}
                      {errors.workspaceUserId && (
                        <p className="text-red-500 text-xs mt-2 text-right">
                          {errors.workspaceUserId?.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <Controller
                        name="dueDate"
                        control={control}
                        render={({ field }) => (
                          <StandaloneDateTimePicker
                            label="تاریخ و زمان یادآوری"
                            value={field.value}
                            onChange={(date) =>
                              field.onChange(date?.iso ?? null)
                            }
                            name={field.name}
                            error={errors.dueDate?.message}
                          />
                        )}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium mb-2 text-right">
                        کانال اعلان
                      </label>
                      <select
                        className="border rounded p-2"
                        {...register("notificationChannels" as const)}
                      >
                        <option value="ALL">همه</option>
                        <option value="IN_APP">داخلی</option>
                        <option value="SMS">SMS</option>
                        <option value="EMAIL">ایمیل</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- بخش ۲: جزئیات تکمیلی --- */}
              <div>
                <h5 className="text-lg font-medium mb-4 text-right">
                  جزئیات تکمیلی (اختیاری)
                </h5>
                <div className="p-4 sm:p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium mb-2 text-right">
                        لینک به آیتم
                      </label>
                      <p className="text-xs text-gray-500 mb-3 text-right">
                        یادآور را به یک درخواست یا فاکتور خاص متصل کنید.
                      </p>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <button
                          type="button"
                          className="flex-shrink-0 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => {
                            setSelectedEntity(null);
                            setValue("entityId", undefined);
                            setValue("entityType", undefined);
                          }}
                          disabled={!selectedEntity}
                        >
                          <DIcon icon="fa-times" cdi={false} />
                        </button>
                        <input
                          type="text"
                          className="flex-grow px-4 py-2 border border-gray-300 rounded-md bg-white text-sm sm:text-base text-right"
                          readOnly
                          value={
                            selectedEntity
                              ? `${
                                  selectedEntity.type === "Request"
                                    ? "درخواست"
                                    : "فاکتور"
                                } #${selectedEntity.id ?? "N/A"} - ${
                                  selectedEntity.name ?? ""
                                }`
                              : "موردی انتخاب نشده است"
                          }
                        />
                        <button
                          type="button"
                          className="flex-shrink-0 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 whitespace-nowrap"
                          onClick={() => openEntitySelector("requests")}
                        >
                          انتخاب درخواست
                        </button>
                        <button
                          type="button"
                          className="flex-shrink-0 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 whitespace-nowrap"
                          onClick={() => openEntitySelector("invoices")}
                        >
                          انتخاب فاکتور
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- بخش ۲.۵: گیرندگان گروهی و فیلترها (اختیاری) --- */}
              <div>
                <h5 className="text-lg font-medium mb-4 text-right">
                  گیرندگان گروهی (اختیاری)
                </h5>
                <div className="p-4 sm:p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm">گروه‌ها</label>
                      <select
                        className="border rounded p-2"
                        multiple
                        value={groupIds.map(String)}
                        onChange={(e: any) =>
                          setGroupIds(
                            Array.from(e.target.selectedOptions).map((o: any) =>
                              parseInt(o.value, 10)
                            )
                          )
                        }
                      >
                        {(userGroups || []).map((g: any) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm">برچسب‌ها</label>
                      <select
                        className="border rounded p-2"
                        multiple
                        value={labelIds.map(String)}
                        onChange={(e: any) =>
                          setLabelIds(
                            Array.from(e.target.selectedOptions).map((o: any) =>
                              parseInt(o.value, 10)
                            )
                          )
                        }
                      >
                        {(labels || []).map((l: any) => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm">جستجو (نام/تلفن)</label>
                      <input
                        className="border rounded p-2"
                        value={q}
                        onChange={(e: any) => setQ(e.target.value)}
                      />
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectFiltered}
                        onChange={(e) => setSelectFiltered(e.target.checked)}
                      />
                      <span>انتخاب همه نتایج فیلتر</span>
                    </label>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h6 className="font-medium">گیرندگان انتخابی</h6>
                      <button
                        type="button"
                        className="px-3 py-1 border rounded-md"
                        onClick={addRecipient}
                      >
                        افزودن گیرنده
                      </button>
                    </div>
                    <div className="grid gap-3">
                      {recipients.map((r, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
                        >
                          <div className="flex flex-col">
                            <label className="mb-1 text-sm">کاربر</label>
                            <select
                              className="border rounded p-2"
                              value={String(r.workspaceUserId)}
                              onChange={(e: any) =>
                                updateRecipient(idx, {
                                  workspaceUserId: parseInt(e.target.value, 10),
                                })
                              }
                            >
                              <option value="0">انتخاب کنید</option>
                              {(workspaceUsers || []).map((u: any) => (
                                <option key={u.id} value={u.id}>
                                  {u.displayName ||
                                    u.user?.name ||
                                    u.user?.phone}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div></div>
                          <button
                            type="button"
                            className="px-3 py-1 border rounded-md"
                            onClick={() => removeRecipient(idx)}
                          >
                            حذف
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* --- بخش ۳: متن یادآوری --- */}
              <div>
                <h5 className="text-lg font-medium mb-4 text-right">
                  عنوان و توضیحات یادآوری
                </h5>
                <div className="p-4 sm:p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-6">
                    <div className="flex flex-col">
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium mb-2 text-right"
                      >
                        عنوان یادآور <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="title"
                        type="text"
                        className={`w-full px-4 py-2 border ${
                          errors.title ? "border-red-500" : "border-gray-300"
                        } rounded-md bg-white text-sm sm:text-base text-right focus:outline-none focus:ring-2 ${
                          errors.title
                            ? "focus:ring-red-500"
                            : "focus:ring-teal-500"
                        }`}
                        {...register("title")}
                      />
                      {errors.title && (
                        <p className="text-red-500 text-xs mt-2 text-right">
                          {errors.title?.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium mb-2 text-right"
                      >
                        توضیحات
                      </label>
                      <textarea
                        id="description"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-sm sm:text-base text-right resize-y min-h-[120px] focus:outline-none focus:ring-2 focus:ring-teal-500"
                        rows={4}
                        {...register("description")}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* --- دکمه‌های نهایی --- */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6 sm:mt-8">
              <button
                type="submit"
                className="px-5 py-2.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting || isSubmitting}
              >
                {submitting || isSubmitting ? (
                  <>
                    ``
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    در حال ذخیره...
                  </>
                ) : (
                  "ایجاد یادآور"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Modal
        size="2xl"
        isOpen={!!modalContent}
        onClose={() => setModalContent(null)}
        title={`انتخاب ${
          modalContent?.type === "requests" ? "درخواست" : "فاکتور"
        }`}
      >
        {renderModalContent()}
      </Modal>
    </>
  );
}

// // // مسیر فایل: src/modules/reminders/components/ReminderForm.tsx (نسخه نهایی و بازطراحی شده)
// "use client";

// import DIcon from "@/@Client/Components/common/DIcon";
// import StandaloneDateTimePicker from "@/@Client/Components/ui/StandaloneDateTimePicker";
// import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
// import { columnsForAdmin as invoiceColumns } from "@/modules/invoices/data/table";
// import { InvoiceRepository } from "@/modules/invoices/repo/InvoiceRepository";
// import { columnsForAdmin as requestColumns } from "@/modules/requests/data/table";
// import { RequestRepository } from "@/modules/requests/repo/RequestRepository";
// import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Modal } from "ndui-ahrom";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { Controller, useForm } from "react-hook-form";
// import { z } from "zod";
// import { useReminder } from "../hooks/useReminder";
// import { createReminderSchema } from "../validation/schema";
// import SelectUserForReminder from "./SelectUserForReminder";

// type SelectedEntity = {
//   type: "Request" | "Invoice";
//   id: number | null;
//   name: string | null;
// };

// export default function ReminderForm() {
//   const router = useRouter();
//   const { create, submitting } = useReminder();

//   const [modalContent, setModalContent] = useState<{
//     type: "requests" | "invoices";
//   } | null>(null);
//   const [selectedUser, setSelectedUser] =
//     useState<WorkspaceUserWithRelations | null>(null);
//   const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(
//     null
//   );

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     control,
//     resetField,
//     formState: { errors, isSubmitting },
//   } = useForm<z.infer<typeof createReminderSchema>>({
//     resolver: zodResolver(createReminderSchema),
//     defaultValues: {
//       title: "",
//       description: "",
//       workspaceUserId: 0,
//       dueDate: undefined,
//       entityId: undefined,
//       entityType: undefined,
//     },
//   });

//   useEffect(() => {
//     register("entityId" as const);
//     register("entityType" as const);
//     register("workspaceUserId" as const);
//   }, [register]);

//   const handleUserSelect = (user: WorkspaceUserWithRelations | null) => {
//     setSelectedUser(user);
//     setValue("workspaceUserId", user?.id ?? 0, {
//       shouldValidate: true,
//       shouldDirty: true,
//     });
//   };

//   const openEntitySelector = (type: "requests" | "invoices") => {
//     setModalContent({ type });
//   };

//   const handleEntitySelect = (entity: any) => {
//     if (!entity) return;
//     const picked = Array.isArray(entity) ? entity[0] : entity;
//     const id =
//       picked?.id ??
//       picked?._id ??
//       picked?.requestId ??
//       picked?.invoiceId ??
//       null;

//     if (!id) {
//       console.warn("انتخاب شده ID ندارد:", picked);
//       setModalContent(null);
//       return;
//     }

//     const entityType =
//       modalContent?.type === "requests" ? "Request" : "Invoice";
//     const entityName =
//       picked?.title ?? picked?.name ?? picked?.subject ?? `آیتم شماره ${id}`;

//     setSelectedEntity({
//       type: entityType as SelectedEntity["type"],
//       id,
//       name: entityName,
//     });
//     setValue("entityId", Number(id), {
//       shouldValidate: true,
//       shouldDirty: true,
//     });
//     setValue("entityType", entityType, {
//       shouldValidate: true,
//       shouldDirty: true,
//     });

//     const wsUser =
//       picked?.workspaceUser ??
//       (picked?.workspaceUserId ? { id: picked.workspaceUserId } : null);
//     if (wsUser) {
//       if (wsUser.id && !wsUser.displayName) {
//         setValue("workspaceUserId", Number(wsUser.id), {
//           shouldValidate: true,
//           shouldDirty: true,
//         });
//         setSelectedUser(null);
//       } else {
//         setSelectedUser(wsUser);
//         setValue("workspaceUserId", Number(wsUser.id ?? 0), {
//           shouldValidate: true,
//           shouldDirty: true,
//         });
//       }
//     }
//     setModalContent(null);
//   };

//   const handleSave = async (data: z.infer<typeof createReminderSchema>) => {
//     try {
//       if (data.entityId !== null && data.entityId !== undefined) {
//         data.entityId = Number(data.entityId);
//       }
//       if (data.workspaceUserId !== undefined) {
//         data.workspaceUserId = Number(data.workspaceUserId);
//       }
//       const result = await create(data);
//       if (result) {
//         router.push("/dashboard/reminders");
//       } else {
//         console.error("Server returned falsy result on create");
//         alert("ایجاد یادآور موفق نبود. مجدداً تلاش کنید.");
//       }
//     } catch (err) {
//       console.error("خطا در ایجاد یادآور:", err);
//       alert("خطا در ارسال به سرور. در کنسول بررسی کن.");
//     }
//   };

//   const renderModalContent = () => {
//     if (!modalContent) return null;
//     const config =
//       modalContent.type === "requests"
//         ? { repo: new RequestRepository(), columns: requestColumns }
//         : { repo: new InvoiceRepository(), columns: invoiceColumns };
//     return (
//       <IndexWrapper
//         columns={config.columns}
//         repo={config.repo}
//         selectionMode="single"
//         onSelect={handleEntitySelect}
//         createUrl={false}
//         showIconViews={false}
//         defaultViewMode="table"
//       />
//     );
//   };

//   return (
//     <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
//       <div className="card bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
//         <div className="p-6 sm:p-8">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
//             <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0 text-right">
//               ایجاد یادآور جدید
//             </h3>
//             <button
//               onClick={() => router.back()}
//               className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
//             >
//               <DIcon icon="fa-arrow-right" cdi={false} />
//               <span className="text-sm sm:text-base">بازگشت</span>
//             </button>
//           </div>

//           <form
//             onSubmit={handleSubmit(handleSave)}
//             noValidate
//             className="space-y-6 sm:space-y-8"
//           >
//             {/* بخش ۱: اطلاعات اصلی */}
//             <div className="space-y-4">
//               <h5 className="text-lg sm:text-xl font-semibold text-gray-800 text-right">
//                 اطلاعات اصلی
//               </h5>
//               <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
//                       برای کاربر <span className="text-red-500">*</span>
//                     </label>
//                     <Controller
//                       name="workspaceUserId"
//                       control={control}
//                       render={() => (
//                         <div>
//                           {!selectedUser ? (
//                             <SelectUserForReminder
//                               onSelect={(user) => handleUserSelect(user)}
//                             />
//                           ) : (
//                             <div className="flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg">
//                               <span className="text-sm sm:text-base text-gray-800">
//                                 {selectedUser?.displayName ??
//                                   selectedUser?.phone}
//                               </span>
//                               <button
//                                 type="button"
//                                 className="p-2 text-red-500 hover:text-red-600 transition-colors"
//                                 onClick={() => handleUserSelect(null)}
//                               >
//                                 <DIcon icon="fa-times" cdi={false} />
//                               </button>
//                             </div>
//                           )}
//                           {errors.workspaceUserId && (
//                             <p className="text-red-500 text-xs mt-2 text-right">
//                               {errors.workspaceUserId?.message}
//                             </p>
//                           )}
//                         </div>
//                       )}
//                     />
//                   </div>
//                   <div>
//                     <Controller
//                       name="dueDate"
//                       control={control}
//                       render={({ field }) => (
//                         <StandaloneDateTimePicker
//                           label="تاریخ و زمان یادآوری"
//                           value={field.value}
//                           onChange={(date) => field.onChange(date?.iso ?? null)}
//                           name={field.name}
//                           error={errors.dueDate?.message}
//                         />
//                       )}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* بخش ۲: جزئیات تکمیلی */}
//             <div className="space-y-4">
//               <h5 className="text-lg sm:text-xl font-semibold text-gray-800 text-right">
//                 جزئیات تکمیلی (اختیاری)
//               </h5>
//               <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
//                     لینک به آیتم
//                   </label>
//                   <p className="text-gray-500 text-xs mb-3 text-right">
//                     یادآور را به یک درخواست یا فاکتور خاص متصل کنید.
//                   </p>
//                   <div className="flex flex-col sm:flex-row gap-2">
//                     <button
//                       type="button"
//                       className="p-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg disabled:opacity-50 transition-colors"
//                       onClick={() => {
//                         setSelectedEntity(null);
//                         setValue("entityId", undefined);
//                         setValue("entityType", undefined);
//                       }}
//                       disabled={!selectedEntity}
//                     >
//                       <DIcon icon="fa-times" cdi={false} />
//                     </button>
//                     <input
//                       type="text"
//                       className="flex-1 p-3 bg-white border border-gray-300 rounded-lg text-sm text-right"
//                       readOnly
//                       value={
//                         selectedEntity
//                           ? `${
//                               selectedEntity.type === "Request"
//                                 ? "درخواست"
//                                 : "فاکتور"
//                             } #${selectedEntity.id ?? "N/A"} - ${
//                               selectedEntity.name ?? ""
//                             }`
//                           : "موردی انتخاب نشده است"
//                       }
//                     />
//                     <div className="flex gap-2">
//                       <button
//                         type="button"
//                         className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition-colors"
//                         onClick={() => openEntitySelector("requests")}
//                       >
//                         انتخاب درخواست
//                       </button>
//                       <button
//                         type="button"
//                         className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition-colors"
//                         onClick={() => openEntitySelector("invoices")}
//                       >
//                         انتخاب فاکتور
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* بخش ۳: متن یادآوری */}
//             <div className="space-y-4">
//               <h5 className="text-lg sm:text-xl font-semibold text-gray-800 text-right">
//                 عنوان و توضیحات یادآوری
//               </h5>
//               <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6">
//                 <div className="space-y-4">
//                   <div>
//                     <label
//                       htmlFor="title"
//                       className="block text-sm font-medium text-gray-700 mb-2 text-right"
//                     >
//                       عنوان یادآور <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       id="title"
//                       type="text"
//                       className={`w-full p-3 bg-white border border-gray-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-teal-500 ${
//                         errors.title ? "border-red-500" : ""
//                       }`}
//                       {...register("title")}
//                     />
//                     {errors.title && (
//                       <p className="text-red-500 text-xs mt-2 text-right">
//                         {errors.title?.message}
//                       </p>
//                     )}
//                   </div>
//                   <div>
//                     <label
//                       htmlFor="description"
//                       className="block text-sm font-medium text-gray-700 mb-2 text-right"
//                     >
//                       توضیحات
//                     </label>
//                     <textarea
//                       id="description"
//                       className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-teal-500"
//                       rows={4}
//                       {...register("description")}
//                     ></textarea>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* دکمه‌های نهایی */}
//             <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
//               <button
//                 type="submit"
//                 className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
//                 disabled={submitting || isSubmitting}
//               >
//                 {submitting || isSubmitting ? (
//                   <div className="flex items-center gap-2">
//                     <span
//                       className="spinner-border spinner-border-sm"
//                       aria-hidden="true"
//                     ></span>
//                     <span>در حال ذخیره...</span>
//                   </div>
//                 ) : (
//                   "ایجاد یادآور"
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       <Modal
//         size="2xl"
//         isOpen={!!modalContent}
//         onClose={() => setModalContent(null)}
//         title={`انتخاب ${
//           modalContent?.type === "requests" ? "درخواست" : "فاکتور"
//         }`}
//       >
//         {renderModalContent()}
//       </Modal>
//     </div>
//   );
// }

// "use client";

// import DIcon from "@/@Client/Components/common/DIcon";
// import StandaloneDateTimePicker from "@/@Client/Components/ui/StandaloneDateTimePicker";
// import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
// import { columnsForAdmin as invoiceColumns } from "@/modules/invoices/data/table";
// import { InvoiceRepository } from "@/modules/invoices/repo/InvoiceRepository";
// import { columnsForAdmin as requestColumns } from "@/modules/requests/data/table";
// import { RequestRepository } from "@/modules/requests/repo/RequestRepository";
// import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Modal } from "ndui-ahrom";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { Controller, useForm } from "react-hook-form";
// import { z } from "zod";
// import { useReminder } from "../hooks/useReminder";
// import { createReminderSchema } from "../validation/schema";
// import SelectUserForReminder from "./SelectUserForReminder";

// type SelectedEntity = {
//   type: "Request" | "Invoice";
//   id: number | null;
//   name: string | null;
// };

// export default function ReminderForm() {
//   // --- منطق کامپوننت (این بخش کاملاً دست‌نخورده باقی مانده است) ---
//   const router = useRouter();
//   const { create, submitting } = useReminder();

//   const [modalContent, setModalContent] = useState<{
//     type: "requests" | "invoices";
//   } | null>(null);
//   const [selectedUser, setSelectedUser] =
//     useState<WorkspaceUserWithRelations | null>(null);
//   const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(
//     null
//   );

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     control,
//     resetField,
//     formState: { errors, isSubmitting },
//   } = useForm<z.infer<typeof createReminderSchema>>({
//     resolver: zodResolver(createReminderSchema),
//     defaultValues: {
//       title: "",
//       description: "",
//       workspaceUserId: 0,
//       dueDate: undefined,
//       entityId: undefined,
//       entityType: undefined,
//     },
//   });

//   useEffect(() => {
//     register("entityId" as const);
//     register("entityType" as const);
//     register("workspaceUserId" as const);
//   }, [register]);

//   const handleUserSelect = (user: WorkspaceUserWithRelations | null) => {
//     setSelectedUser(user);
//     setValue("workspaceUserId", user?.id ?? 0, {
//       shouldValidate: true,
//       shouldDirty: true,
//     });
//   };

//   const openEntitySelector = (type: "requests" | "invoices") => {
//     setModalContent({ type });
//   };

//   const handleEntitySelect = (entity: any) => {
//     if (!entity) return;
//     const picked = Array.isArray(entity) ? entity[0] : entity;
//     const id =
//       picked?.id ??
//       picked?._id ??
//       picked?.requestId ??
//       picked?.invoiceId ??
//       null;

//     if (!id) {
//       console.warn("انتخاب شده ID ندارد:", picked);
//       setModalContent(null);
//       return;
//     }

//     const entityType =
//       modalContent?.type === "requests" ? "Request" : "Invoice";
//     const entityName =
//       picked?.title ?? picked?.name ?? picked?.subject ?? `آیتم شماره ${id}`;

//     setSelectedEntity({
//       type: entityType as SelectedEntity["type"],
//       id,
//       name: entityName,
//     });
//     setValue("entityId", Number(id), {
//       shouldValidate: true,
//       shouldDirty: true,
//     });
//     setValue("entityType", entityType, {
//       shouldValidate: true,
//       shouldDirty: true,
//     });

//     const wsUser =
//       picked?.workspaceUser ??
//       (picked?.workspaceUserId ? { id: picked.workspaceUserId } : null);
//     if (wsUser) {
//       if (wsUser.id && !wsUser.displayName) {
//         setValue("workspaceUserId", Number(wsUser.id), {
//           shouldValidate: true,
//           shouldDirty: true,
//         });
//         setSelectedUser(null);
//       } else {
//         setSelectedUser(wsUser);
//         setValue("workspaceUserId", Number(wsUser.id ?? 0), {
//           shouldValidate: true,
//           shouldDirty: true,
//         });
//       }
//     }
//     setModalContent(null);
//   };

//   const handleSave = async (data: z.infer<typeof createReminderSchema>) => {
//     try {
//       if (data.entityId !== null && data.entityId !== undefined) {
//         data.entityId = Number(data.entityId);
//       }
//       if (data.workspaceUserId !== undefined) {
//         data.workspaceUserId = Number(data.workspaceUserId);
//       }
//       const result = await create(data);
//       if (result) {
//         router.push("/dashboard/reminders");
//       } else {
//         console.error("Server returned falsy result on create");
//         alert("ایجاد یادآور موفق نبود. مجدداً تلاش کنید.");
//       }
//     } catch (err) {
//       console.error("خطا در ایجاد یادآور:", err);
//       alert("خطا در ارسال به سرور. در کنسول بررسی کن.");
//     }
//   };

//   const renderModalContent = () => {
//     if (!modalContent) return null;
//     const config =
//       modalContent.type === "requests"
//         ? { repo: new RequestRepository(), columns: requestColumns }
//         : { repo: new InvoiceRepository(), columns: invoiceColumns };
//     return (
//       <IndexWrapper
//         columns={config.columns}
//         repo={config.repo}
//         selectionMode="single"
//         onSelect={handleEntitySelect}
//         createUrl={false}
//         showIconViews={false}
//         defaultViewMode="table"
//       />
//     );
//   };
//   // --- پایان بخش منطق ---

//   return (
//     <>
//       <div className="card bg-white border-0 shadow-sm rounded-4">
//         <div className="card-body p-4 p-lg-5">
//           <div className="d-flex justify-content-between align-items-center mb-5">
//             <h3 className="card-title fw-bold mb-0">ایجاد یادآور جدید</h3>
//             {/* <button
//               onClick={() => router.back()}
//               className="btn btn-light btn-sm mt-4"
//             >
//               <DIcon icon="fa-arrow-right" cdi={false} classCustom="me-2" />
//               بازگشت
//             </button> */}
//           </div>

//           <form onSubmit={handleSubmit(handleSave)} noValidate>
//             <div className="row g-4">
//               <div className="flex flex-row p-2">
//                 {/* --- بخش ۱: اطلاعات اصلی --- */}
//                 <div className="col-12 m-2">
//                   <h5 className="mb-3 fw-medium">اطلاعات اصلی</h5>
//                   <div className="p-4 border rounded-md bg-gray-100 bg-opacity-50">
//                     <div className="row g-4">
//                       <div className="col-md-6 m-2">
//                         <Controller
//                           name="workspaceUserId"
//                           control={control}
//                           render={() => (
//                             <div>
//                               <label className="form-label">
//                                 برای کاربر{" "}
//                                 <span className="text-danger">*</span>
//                               </label>
//                               {!selectedUser ? (
//                                 <SelectUserForReminder
//                                   onSelect={(user) => handleUserSelect(user)}
//                                 />
//                               ) : (
//                                 <div className="d-flex align-items-center justify-content-between p-2 ps-3 border rounded-3 bg-white">
//                                   <span className="px-2">
//                                     {selectedUser?.displayName ??
//                                       selectedUser?.phone}
//                                   </span>
//                                   <button
//                                     type="button"
//                                     className="btn btn-sm btn-ghost-danger bg-teal-700"
//                                     onClick={() => handleUserSelect(null)}
//                                   >
//                                     <DIcon icon="fa-times" cdi={false} />
//                                   </button>
//                                 </div>
//                               )}
//                               {errors.workspaceUserId && (
//                                 <p className="text-danger mt-2 small">
//                                   {errors.workspaceUserId?.message}
//                                 </p>
//                               )}
//                             </div>
//                           )}
//                         />
//                       </div>

//                       <div className="col-md-6">
//                         <Controller
//                           name="dueDate"
//                           control={control}
//                           render={({ field }) => (
//                             <StandaloneDateTimePicker
//                               label="تاریخ و زمان یادآوری"
//                               value={field.value}
//                               onChange={(date) =>
//                                 field.onChange(date?.iso ?? null)
//                               }
//                               name={field.name}
//                               error={errors.dueDate?.message}
//                             />
//                           )}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* --- بخش ۲: جزئیات تکمیلی --- */}
//                 <div className="col-12 m-2">
//                   <h5 className="mb-3 fw-medium">جزئیات تکمیلی (اختیاری)</h5>
//                   <div className="p-4 border rounded-md bg-gray-100 bg-opacity-50">
//                     <div className="row g-4">
//                       <div className="col-12">
//                         <label className="form-label">لینک به آیتم</label>
//                         <p className="text-muted small mt-n2 mb-2">
//                           یادآور را به یک درخواست یا فاکتور خاص متصل کنید.
//                         </p>
//                         <div className="input-group">
//                           <button
//                             type="button"
//                             className="btn btn-light"
//                             onClick={() => {
//                               setSelectedEntity(null);
//                               setValue("entityId", undefined);
//                               setValue("entityType", undefined);
//                             }}
//                             disabled={!selectedEntity}
//                           >
//                             <DIcon icon="fa-times" cdi={false} />
//                           </button>
//                           <input
//                             type="text"
//                             className="form-control"
//                             readOnly
//                             value={
//                               selectedEntity
//                                 ? `${
//                                     selectedEntity.type === "Request"
//                                       ? "درخواست"
//                                       : "فاکتور"
//                                   } #${selectedEntity.id ?? "N/A"} - ${
//                                     selectedEntity.name ?? ""
//                                   }`
//                                 : "موردی انتخاب نشده است"
//                             }
//                           />
//                           <button
//                             type="button"
//                             className="btn btn-outline-secondary"
//                             onClick={() => openEntitySelector("requests")}
//                           >
//                             انتخاب درخواست
//                           </button>
//                           <button
//                             type="button"
//                             className="btn btn-outline-secondary"
//                             onClick={() => openEntitySelector("invoices")}
//                           >
//                             انتخاب فاکتور
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* --- بخش ۲: متن یادآوری  --- */}
//               <div className=" mt-4">
//                 <h5 className="mb-3 fw-medium">عنوان و توضیحات یادآوری</h5>
//                 <div className="p-4 border rounded-md bg-gray-100 bg-opacity-50">
//                   <div className="row g-4">
//                     <div className="col-12 mt-2">
//                       <label htmlFor="title" className="form-label">
//                         عنوان یادآور <span className=" text-danger">*</span>
//                       </label>
//                       <input
//                         id="title"
//                         type="text"
//                         className={`form-control form-control-lg m-2 p-2 border rounded-md border-gray-400 ${
//                           errors.title ? "is-invalid" : ""
//                         }`}
//                         {...register("title")}
//                       />
//                       <div className="invalid-feedback p-2 text-red-500">
//                         {errors.title?.message}
//                       </div>
//                     </div>

//                     <div className="">
//                       <label htmlFor="description" className="form-label">
//                         توضیحات
//                       </label>
//                       <textarea
//                         id="description"
//                         className="form-control form-control-lg m-2 p-2 border rounded-md border-gray-400"
//                         rows={3}
//                         {...register("description")}
//                       ></textarea>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* --- دکمه‌های نهایی --- */}
//             <div className="d-flex justify-content-end gap-2 pt-4 mx-2 mt-3 border-top">
//               <button
//                 type="submit"
//                 className="btn btn-primary px-4"
//                 disabled={submitting || isSubmitting}
//               >
//                 {submitting || isSubmitting ? (
//                   <>
//                     <span
//                       className="spinner-border spinner-border-sm mx-2 p-3"
//                       aria-hidden="true"
//                     ></span>
//                     در حال ذخیره...
//                   </>
//                 ) : (
//                   "ایجاد یادآور"
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       <Modal
//         size="2xl"
//         isOpen={!!modalContent}
//         onClose={() => setModalContent(null)}
//         title={`انتخاب ${
//           modalContent?.type === "requests" ? "درخواست" : "فاکتور"
//         }`}
//       >
//         {renderModalContent()}
//       </Modal>
//     </>
//   );
// }

// // // مسیر فایل: src/modules/reminders/components/ReminderForm.tsx (نسخه بهبود یافته)
// // "use client";

// // import DIcon from "@/@Client/Components/common/DIcon";
// // import StandaloneDateTimePicker from "@/@Client/Components/ui/StandaloneDateTimePicker";
// // import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
// // import { columnsForAdmin as invoiceColumns } from "@/modules/invoices/data/table";
// // import { InvoiceRepository } from "@/modules/invoices/repo/InvoiceRepository";
// // import { columnsForAdmin as requestColumns } from "@/modules/requests/data/table";
// // import { RequestRepository } from "@/modules/requests/repo/RequestRepository";
// // import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
// // import { zodResolver } from "@hookform/resolvers/zod";
// // import { Modal } from "ndui-ahrom";
// // import { useRouter } from "next/navigation";
// // import { useEffect, useState } from "react";
// // import { Controller, useForm } from "react-hook-form";
// // import { z } from "zod";
// // import { useReminder } from "../hooks/useReminder";
// // import { createReminderSchema } from "../validation/schema";
// // import SelectUserForReminder from "./SelectUserForReminder";

// // type SelectedEntity = {
// //   type: "Request" | "Invoice";
// //   id: number | null;
// //   name: string | null;
// // };

// // export default function ReminderForm() {
// //   const router = useRouter();
// //   const { create, submitting } = useReminder();

// //   const [modalContent, setModalContent] = useState<{
// //     type: "requests" | "invoices";
// //   } | null>(null);
// //   const [selectedUser, setSelectedUser] =
// //     useState<WorkspaceUserWithRelations | null>(null);
// //   const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(
// //     null
// //   );

// //   const {
// //     register,
// //     handleSubmit,
// //     setValue,
// //     control,
// //     resetField,
// //     formState: { errors, isSubmitting },
// //   } = useForm<z.infer<typeof createReminderSchema>>({
// //     resolver: zodResolver(createReminderSchema),
// //     defaultValues: {
// //       title: "",
// //       description: "",
// //       workspaceUserId: 0,
// //       dueDate: undefined,
// //       entityId: undefined,
// //       entityType: undefined,
// //     },
// //   });

// //   // حتما فیلدهای پنهان را ثبت می‌کنیم تا در خروجی فرم باشند
// //   useEffect(() => {
// //     register("entityId" as const);
// //     register("entityType" as const);
// //     register("workspaceUserId" as const);
// //   }, [register]);

// //   // تابع مقاوم برای ست‌کردن کاربر
// //   const handleUserSelect = (user: WorkspaceUserWithRelations | null) => {
// //     setSelectedUser(user);
// //     // اگر null شد مقدار صفر یا null بفرست
// //     setValue("workspaceUserId", user?.id ?? 0, {
// //       shouldValidate: true,
// //       shouldDirty: true,
// //     });
// //   };

// //   const openEntitySelector = (type: "requests" | "invoices") => {
// //     setModalContent({ type });
// //   };

// //   // تابعی که از IndexWrapper می‌آید ممکن است شیء یا آرایه بدهد — اینجا چند حالت را پوشش می‌دهیم
// //   const handleEntitySelect = (entity: any) => {
// //     if (!entity) return;

// //     // اگر آرایه است، اولین عضو را بگیر
// //     const picked = Array.isArray(entity) ? entity[0] : entity;

// //     // تلاش برای پیدا کردن id در شکل‌های مختلف داده
// //     const id =
// //       picked?.id ??
// //       picked?._id ??
// //       picked?.requestId ??
// //       picked?.invoiceId ??
// //       null;

// //     if (!id) {
// //       // اگر id پیدا نشد، لاگ بزن و خارج شو (یا نشان بده)
// //       console.warn("انتخاب شده ID ندارد:", picked);
// //       setModalContent(null);
// //       return;
// //     }

// //     // تعیین نوع انتیتی (نمایشی داخل فرم) بر اساس modalContent
// //     const entityType =
// //       modalContent?.type === "requests" ? "Request" : "Invoice";

// //     // عنوان/نام آیتم را از فیلدهای رایج بگیر
// //     const entityName =
// //       picked?.title ?? picked?.name ?? picked?.subject ?? `آیتم شماره ${id}`;

// //     // ست کردن state و فرم (ضمانت اینکه داده‌ها در submit ارسال می‌شوند)
// //     setSelectedEntity({
// //       type: entityType as SelectedEntity["type"],
// //       id,
// //       name: entityName,
// //     });
// //     setValue("entityId", Number(id), {
// //       shouldValidate: true,
// //       shouldDirty: true,
// //     });
// //     setValue("entityType", entityType, {
// //       shouldValidate: true,
// //       shouldDirty: true,
// //     });

// //     // اگر آیتم انتخاب‌شده کاربر مرتبط دارد، آن را هم ست کن
// //     // ممکن است api برگشتی فیلد workspaceUser یا workspaceUserId داشته باشد
// //     const wsUser =
// //       picked?.workspaceUser ??
// //       (picked?.workspaceUserId ? { id: picked.workspaceUserId } : null);
// //     if (wsUser) {
// //       // اگر فقط id داریم، باید یک lookup یا حداقل setValue انجام دهیم
// //       if (wsUser.id && !wsUser.displayName) {
// //         // فقط id در دسترس است؛ تنظیم فرم به id کافیست (نمایش کاربر ممکن است از قبل با select انجام شود)
// //         setValue("workspaceUserId", Number(wsUser.id), {
// //           shouldValidate: true,
// //           shouldDirty: true,
// //         });
// //         // اگر بخواهی، می‌توانیم با یک repo کاربر را واکشی کنیم تا displayName را نشان دهیم — در اینجا فرض می‌کنیم SelectUserForReminder می‌تواند این id را دریافت کند.
// //         // برای سادگی: setSelectedUser(null) و فقط id فرم را قرار می‌دهیم.
// //         setSelectedUser(null);
// //       } else {
// //         // اگر شیء کامل کاربر است:
// //         setSelectedUser(wsUser);
// //         setValue("workspaceUserId", Number(wsUser.id ?? 0), {
// //           shouldValidate: true,
// //           shouldDirty: true,
// //         });
// //       }
// //     }

// //     setModalContent(null);
// //   };

// //   const handleSave = async (data: z.infer<typeof createReminderSchema>) => {
// //     try {
// //       // اطمینان از نوع‌ها: اگر entityId هست آن را به عدد تبدیل کن
// //       if (data.entityId !== null && data.entityId !== undefined) {

// //         data.entityId = Number(data.entityId);
// //       }
// //       if (data.workspaceUserId !== undefined) {

// //         data.workspaceUserId = Number(data.workspaceUserId);
// //       }

// //       const result = await create(data);
// //       if (result) {
// //         // موفق -> بازگشت به لیست یا صفحه‌ای که می‌خوای
// //         router.push("/dashboard/reminders");
// //       } else {
// //         // اگر create false یا undefined برگشت، پیام خطا (می‌تونی Toast بذاری)
// //         console.error("Server returned falsy result on create");
// //         alert("ایجاد یادآور موفق نبود. مجدداً تلاش کنید.");
// //       }
// //     } catch (err) {
// //       console.error("خطا در ایجاد یادآور:", err);
// //       alert("خطا در ارسال به سرور. در کنسول بررسی کن.");
// //     }
// //   };

// //   const renderModalContent = () => {
// //     if (!modalContent) return null;
// //     const config =
// //       modalContent.type === "requests"
// //         ? { repo: new RequestRepository(), columns: requestColumns }
// //         : { repo: new InvoiceRepository(), columns: invoiceColumns };
// //     return (
// //       <IndexWrapper
// //         columns={config.columns}
// //         repo={config.repo}
// //         selectionMode="single"
// //         onSelect={handleEntitySelect}
// //         createUrl={false}
// //         showIconViews={false}
// //         defaultViewMode="table"
// //       />
// //     );
// //   };

// //   return (
// //     <>
// //       <div className="card bg-white border-0 shadow-sm rounded-4">
// //         <div className="card-body p-4 p-lg-5">
// //           <div className="d-flex justify-content-between align-items-center mb-5">
// //             <h3 className="card-title fw-bold mb-0">ایجاد یادآور جدید</h3>
// //             <button
// //               onClick={() => router.back()}
// //               className="btn btn-light btn-sm"
// //             >
// //               <DIcon icon="fa-arrow-right" cdi={false} classCustom="me-2" />
// //               بازگشت
// //             </button>
// //           </div>

// //           <form onSubmit={handleSubmit(handleSave)} noValidate>
// //             <div className="row g-4">
// //               <div className="col-12">
// //                 <label htmlFor="title" className="form-label">
// //                   عنوان یادآور <span className="text-danger">*</span>
// //                 </label>
// //                 <input
// //                   id="title"
// //                   type="text"
// //                   className={`form-control form-control-lg ${
// //                     errors.title ? "is-invalid" : ""
// //                   }`}
// //                   {...register("title")}
// //                 />
// //                 <div className="invalid-feedback">{errors.title?.message}</div>
// //               </div>

// //               <div className="col-12">
// //                 <div className="row g-4 align-items-start">
// //                   <div className="col-md-6">
// //                     <Controller
// //                       name="workspaceUserId"
// //                       control={control}
// //                       render={({ field }) => (
// //                         <div>
// //                           <label className="form-label">
// //                             برای کاربر <span className="text-danger">*</span>
// //                           </label>
// //                           {!selectedUser ? (
// //                             <SelectUserForReminder
// //                               onSelect={(user) => handleUserSelect(user)}
// //                               // اگر بخواهی می‌توانیم prop اضافه کنیم تا Select بر اساس id مقداردهی اولیه شود
// //                             />
// //                           ) : (
// //                             <div className="d-flex align-items-center justify-content-between p-2 ps-3 border rounded-3 bg-light">
// //                               <span>
// //                                 {selectedUser?.displayName ??
// //                                   selectedUser?.phone ??
// //                                   "کاربر"}
// //                               </span>
// //                               <button
// //                                 type="button"
// //                                 className="btn btn-sm btn-ghost-danger"
// //                                 onClick={() => handleUserSelect(null)}
// //                               >
// //                                 <DIcon icon="fa-times" cdi={false} />
// //                               </button>
// //                             </div>
// //                           )}
// //                           {errors.workspaceUserId && (
// //                             <p className="text-danger mt-2 small">
// //                               {errors.workspaceUserId?.message}
// //                             </p>
// //                           )}
// //                         </div>
// //                       )}
// //                     />
// //                   </div>

// //                   <div className="col-md-6">
// //                     <Controller
// //                       name="dueDate"
// //                       control={control}
// //                       render={({ field }) => (
// //                         <StandaloneDateTimePicker
// //                           label="تاریخ و زمان یادآوری"
// //                           value={field.value}
// //                           onChange={(date) => field.onChange(date?.iso ?? null)}
// //                           name={field.name}
// //                           error={errors.dueDate?.message}
// //                         />
// //                       )}
// //                     />
// //                   </div>
// //                 </div>
// //               </div>

// //               <div className="col-12">
// //                 <div className="border-top pt-4 mt-2">
// //                   <h5 className="fw-medium">لینک به (اختیاری)</h5>
// //                   <p className="text-muted small">
// //                     می‌توانید این یادآور را به یک درخواست یا فاکتور خاص متصل
// //                     کنید.
// //                   </p>
// //                 </div>
// //               </div>

// //               <div className="col-12">
// //                 <label className="form-label">آیتم انتخاب شده</label>
// //                 <div className="input-group">
// //                   <button
// //                     type="button"
// //                     className="btn btn-light"
// //                     onClick={() => {
// //                       setSelectedEntity(null);
// //                       setValue("entityId", undefined);
// //                       setValue("entityType", undefined);
// //                     }}
// //                     disabled={!selectedEntity}
// //                   >
// //                     <DIcon icon="fa-times" cdi={false} />
// //                   </button>
// //                   <input
// //                     type="text"
// //                     className="form-control"
// //                     readOnly
// //                     value={
// //                       selectedEntity
// //                         ? `${
// //                             selectedEntity.type === "Request"
// //                               ? "درخواست"
// //                               : "فاکتور"
// //                           } #${selectedEntity.id ?? "N/A"} - ${
// //                             selectedEntity.name ?? ""
// //                           }`
// //                         : "موردی انتخاب نشده است"
// //                     }
// //                   />
// //                   <button
// //                     type="button"
// //                     className="btn btn-outline-secondary"
// //                     onClick={() => openEntitySelector("requests")}
// //                   >
// //                     انتخاب درخواست
// //                   </button>
// //                   <button
// //                     type="button"
// //                     className="btn btn-outline-secondary"
// //                     onClick={() => openEntitySelector("invoices")}
// //                   >
// //                     انتخاب فاکتور
// //                   </button>
// //                 </div>
// //               </div>

// //               <div className="col-12">
// //                 <label htmlFor="description" className="form-label">
// //                   توضیحات (اختیاری)
// //                 </label>
// //                 <textarea
// //                   id="description"
// //                   className="form-control"
// //                   rows={3}
// //                   {...register("description")}
// //                 ></textarea>
// //               </div>
// //             </div>

// //             {/* فیلدهای مخفی که حتما ارسال شوند */}
// //             <input type="hidden" {...register("entityId" as const)} />
// //             <input type="hidden" {...register("entityType" as const)} />

// //             <div className="d-flex justify-content-end gap-2 pt-4 mt-5 border-top">
// //               <button
// //                 type="button"
// //                 className="btn btn-light"
// //                 onClick={() => router.back()}
// //                 disabled={submitting || isSubmitting}
// //               >
// //                 انصراف
// //               </button>
// //               <button
// //                 type="submit"
// //                 className="btn btn-primary px-4"
// //                 disabled={submitting || isSubmitting}
// //               >
// //                 {submitting || isSubmitting ? (
// //                   <>
// //                     <span
// //                       className="spinner-border spinner-border-sm me-2"
// //                       aria-hidden="true"
// //                     ></span>
// //                     در حال ذخیره...
// //                   </>
// //                 ) : (
// //                   "ایجاد یادآور"
// //                 )}
// //               </button>
// //             </div>
// //           </form>
// //         </div>
// //       </div>

// //       <Modal
// //         size="2xl"
// //         isOpen={!!modalContent}
// //         onClose={() => setModalContent(null)}
// //         title={`انتخاب ${
// //           modalContent?.type === "requests" ? "درخواست" : "فاکتور"
// //         }`}
// //       >
// //         {renderModalContent()}
// //       </Modal>
// //     </>
// //   );
// // }

// // "use client";

// // import DIcon from "@/@Client/Components/common/DIcon";
// // import StandaloneDateTimePicker from "@/@Client/Components/ui/StandaloneDateTimePicker";
// // import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
// // import { columnsForAdmin as invoiceColumns } from "@/modules/invoices/data/table";
// // import { InvoiceRepository } from "@/modules/invoices/repo/InvoiceRepository";
// // import { columnsForAdmin as requestColumns } from "@/modules/requests/data/table";
// // import { RequestRepository } from "@/modules/requests/repo/RequestRepository";
// // import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
// // import { zodResolver } from "@hookform/resolvers/zod";
// // import { Modal } from "ndui-ahrom";
// // import { useRouter } from "next/navigation";
// // import { useState } from "react";
// // import { Controller, useForm } from "react-hook-form";
// // import { z } from "zod";
// // import { useReminder } from "../hooks/useReminder";
// // import { createReminderSchema } from "../validation/schema";
// // import SelectUserForReminder from "./SelectUserForReminder";

// // export default function ReminderForm() {
// //   const router = useRouter();
// //   const { create, submitting } = useReminder();

// //   const [modalContent, setModalContent] = useState<{
// //     type: "requests" | "invoices";
// //   } | null>(null);
// //   const [selectedUser, setSelectedUser] =
// //     useState<WorkspaceUserWithRelations | null>(null);
// //   const [selectedEntity, setSelectedEntity] = useState<{
// //     type: string;
// //     id: number;
// //     name: string;
// //   } | null>(null);

// //   const {
// //     register,
// //     handleSubmit,
// //     setValue,
// //     control,
// //     resetField,
// //     formState: { errors },
// //   } = useForm<z.infer<typeof createReminderSchema>>({
// //     resolver: zodResolver(createReminderSchema),
// //   });

// //   const handleUserSelect = (user: WorkspaceUserWithRelations | null) => {
// //     setSelectedUser(user);
// //     setValue("workspaceUserId", user?.id || 0, { shouldValidate: true });
// //   };

// //   const openEntitySelector = (type: "requests" | "invoices") => {
// //     setModalContent({ type });
// //   };

// //   const handleEntitySelect = (entity: any) => {
// //     if (!entity) return;

// //     const entityType =
// //       modalContent?.type === "requests" ? "Request" : "Invoice";
// //     // اگر عنوان وجود نداشت، از یک متن جایگزین استفاده می‌کنیم
// //     const entityName = entity.title || `آیتم شماره ${entity.id}`;

// //     setSelectedEntity({ type: entityType, id: entity.id, name: entityName });
// //     setValue("entityId", entity.id, { shouldValidate: true });
// //     setValue("entityType", entityType, { shouldValidate: true });

// //     if (entity.workspaceUser) {
// //       handleUserSelect(entity.workspaceUser);
// //     }

// //     setModalContent(null);
// //   };

// //   const handleSave = async (data: z.infer<typeof createReminderSchema>) => {
// //     const result = await create(data);
// //     if (result) {
// //       router.push("/dashboard/reminders");
// //     }
// //   };

// //   const renderModalContent = () => {
// //     if (!modalContent) return null;
// //     const config =
// //       modalContent.type === "requests"
// //         ? { repo: new RequestRepository(), columns: requestColumns }
// //         : { repo: new InvoiceRepository(), columns: invoiceColumns };
// //     return (
// //       <IndexWrapper
// //         columns={config.columns}
// //         repo={config.repo}
// //         selectionMode="single"
// //         onSelect={handleEntitySelect}
// //         createUrl={false}
// //         showIconViews={false}
// //         defaultViewMode="table"
// //       />
// //     );
// //   };

// //   return (
// //     <>
// //       <div className="card bg-white border-0 shadow-sm rounded-4">
// //         <div className="card-body p-4 p-lg-5">
// //           <div className="d-flex justify-content-between align-items-center mb-5">
// //             <h3 className="card-title fw-bold mb-0">ایجاد یادآور جدید</h3>
// //             <button
// //               onClick={() => router.back()}
// //               className="btn btn-light btn-sm"
// //             >
// //               <DIcon icon="fa-arrow-right" cdi={false} classCustom="me-2" />
// //               بازگشت
// //             </button>
// //           </div>

// //           <form onSubmit={handleSubmit(handleSave)} noValidate>
// //             <div className="row g-4">
// //               {/* --- بخش اطلاعات اصلی --- */}
// //               <div className="col-12">
// //                 <label htmlFor="title" className="form-label">
// //                   عنوان یادآور <span className="text-danger">*</span>
// //                 </label>
// //                 <input
// //                   id="title"
// //                   type="text"
// //                   className={`form-control form-control-lg ${
// //                     errors.title ? "is-invalid" : ""
// //                   }`}
// //                   {...register("title")}
// //                 />
// //                 <div className="invalid-feedback">{errors.title?.message}</div>
// //               </div>

// //               {/* کانتینر برای هم‌تراز کردن فیلدهای این سطر */}
// //               <div className="col-12">
// //                 <div className="row g-4 align-items-start">
// //                   <div className="col-md-6">
// //                     <Controller
// //                       name="workspaceUserId"
// //                       control={control}
// //                       render={({ field }) => (
// //                         <div>
// //                           <label className="form-label">
// //                             برای کاربر <span className="text-danger">*</span>
// //                           </label>
// //                           {!selectedUser ? (
// //                             <SelectUserForReminder
// //                               onSelect={(user) => handleUserSelect(user)}
// //                             />
// //                           ) : (
// //                             <div className="d-flex align-items-center justify-content-between p-2 ps-3 border rounded-3 bg-light">
// //                               <span>
// //                                 {selectedUser?.displayName ||
// //                                   selectedUser?.phone}
// //                               </span>
// //                               <button
// //                                 type="button"
// //                                 className="btn btn-sm btn-ghost-danger"
// //                                 onClick={() => handleUserSelect(null)}
// //                               >
// //                                 <DIcon icon="fa-times" cdi={false} />
// //                               </button>
// //                             </div>
// //                           )}
// //                           {errors.workspaceUserId && (
// //                             <p className="text-danger mt-2 small">
// //                               {errors.workspaceUserId?.message}
// //                             </p>
// //                           )}
// //                         </div>
// //                       )}
// //                     />
// //                   </div>

// //                   <div className="col-md-6">
// //                     <Controller
// //                       name="dueDate"
// //                       control={control}
// //                       render={({ field }) => (
// //                         <StandaloneDateTimePicker
// //                           label="تاریخ و زمان یادآوری"
// //                           value={field.value}
// //                           onChange={(date) => field.onChange(date?.iso || null)}
// //                           name={field.name}
// //                           error={errors.dueDate?.message}
// //                         />
// //                       )}
// //                     />
// //                   </div>
// //                 </div>
// //               </div>

// //               {/* --- بخش لینک به آیتم (اختیاری) --- */}
// //               <div className="col-12">
// //                 <div className="border-top pt-4 mt-2">
// //                   <h5 className="fw-medium">لینک به (اختیاری)</h5>
// //                   <p className="text-muted small">
// //                     می‌توانید این یادآور را به یک درخواست یا فاکتور خاص متصل
// //                     کنید.
// //                   </p>
// //                 </div>
// //               </div>

// //               <div className="col-12">
// //                 <label className="form-label">آیتم انتخاب شده</label>
// //                 <div className="input-group">
// //                   <button
// //                     type="button"
// //                     className="btn btn-light"
// //                     onClick={() => {
// //                       setSelectedEntity(null);
// //                       resetField("entityId");
// //                       resetField("entityType");
// //                     }}
// //                     disabled={!selectedEntity}
// //                   >
// //                     <DIcon icon="fa-times" cdi={false} />
// //                   </button>
// //                   <input
// //                     type="text"
// //                     className="form-control"
// //                     readOnly
// //                     // رفع باگ نمایش undefined و بهبود متن
// //                     value={
// //                       selectedEntity
// //                         ? `${
// //                             selectedEntity.type === "Request"
// //                               ? "درخواست"
// //                               : "فاکتور"
// //                           } #${selectedEntity.id || "N/A"} - ${
// //                             selectedEntity.name
// //                           }`
// //                         : "موردی انتخاب نشده است"
// //                     }
// //                   />
// //                   <button
// //                     type="button"
// //                     className="btn btn-outline-secondary"
// //                     onClick={() => openEntitySelector("requests")}
// //                   >
// //                     انتخاب درخواست
// //                   </button>
// //                   <button
// //                     type="button"
// //                     className="btn btn-outline-secondary"
// //                     onClick={() => openEntitySelector("invoices")}
// //                   >
// //                     انتخاب فاکتور
// //                   </button>
// //                 </div>
// //               </div>

// //               <div className="col-12">
// //                 <label htmlFor="description" className="form-label">
// //                   توضیحات (اختیاری)
// //                 </label>
// //                 <textarea
// //                   id="description"
// //                   className="form-control"
// //                   rows={3}
// //                   {...register("description")}
// //                 ></textarea>
// //               </div>
// //             </div>

// //             {/* --- دکمه‌های عملیات --- */}
// //             <div className="d-flex justify-content-end gap-2 pt-4 mt-5 border-top">
// //               <button
// //                 type="button"
// //                 className="btn btn-light"
// //                 onClick={() => router.back()}
// //                 disabled={submitting}
// //               >
// //                 انصراف
// //               </button>
// //               <button
// //                 type="submit"
// //                 className="btn btn-primary px-4"
// //                 disabled={submitting}
// //               >
// //                 {submitting ? (
// //                   <>
// //                     <span
// //                       className="spinner-border spinner-border-sm me-2"
// //                       aria-hidden="true"
// //                     ></span>
// //                     در حال ذخیره...
// //                   </>
// //                 ) : (
// //                   "ایجاد یادآور"
// //                 )}
// //               </button>
// //             </div>
// //           </form>
// //         </div>
// //       </div>

// //       {/* --- مودال انتخاب آیتم --- */}
// //       <Modal
// //         size="2xl"
// //         isOpen={!!modalContent}
// //         onClose={() => setModalContent(null)}
// //         title={`انتخاب ${
// //           modalContent?.type === "requests" ? "درخواست" : "فاکتور"
// //         }`}
// //       >
// //         {renderModalContent()}
// //       </Modal>
// //     </>
// //   );
// // }
