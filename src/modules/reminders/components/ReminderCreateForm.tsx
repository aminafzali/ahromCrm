"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import StandaloneDateTimePicker from "@/@Client/Components/ui/StandaloneDateTimePicker";
import { Button, Card, Input } from "ndui-ahrom";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { z } from "zod";
import RecipientSelector from "./RecipientSelector";
import SubjectSelector from "./SubjectSelector";

/* ---------- schema (client-side reference) ---------- */
const reminderSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  description: z.string().min(1, "توضیحات الزامی است"),
  dueDate: z
    .string()
    .nullable()
    .refine((val) => val !== null && val !== "", "تاریخ سررسید الزامی است"),
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).default("PENDING"),
  type: z.string().default("GENERAL"),
  entityId: z.number().optional(),
  entityType: z.string().optional(),
  workspaceUser: z.object({ id: z.number() }).optional(),
  requestId: z.number().optional(),
  invoiceId: z.number().optional(),
  paymentId: z.number().optional(),
  taskId: z.number().optional(),
  // گروهی
  recipients: z
    .array(
      z.object({
        workspaceUserId: z.number(),
      })
    )
    .optional(),
  filters: z
    .object({
      groupIds: z.array(z.number()).optional(),
      labelIds: z.array(z.number()).optional(),
      q: z.string().optional(),
      selectFiltered: z.boolean().optional(),
    })
    .optional(),
  // کانال‌های اطلاع‌رسانی
  notificationChannels: z
    .enum(["ALL", "IN_APP", "SMS", "EMAIL"])
    .default("IN_APP"),
  // تکرار
  repeatInterval: z
    .enum(["NONE", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
    .default("NONE"),
  timezone: z.string().default("Asia/Tehran"),
});

/* ---------- ReminderCreateForm ---------- */
interface ReminderCreateFormProps {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  loading?: boolean;
  backUrl?: string | boolean;
  after?: () => void;
  requestId?: number;
  invoiceId?: number;
  paymentId?: number;
  taskId?: number;
}

export default function ReminderCreateForm({
  onSubmit,
  defaultValues = {},
  loading = false,
  backUrl = true,
  after,
  requestId,
  invoiceId,
  paymentId,
  taskId,
}: ReminderCreateFormProps) {
  const rootId = useId();
  const router = useRouter();

  /* ---------- State ---------- */
  const [title, setTitle] = useState(defaultValues?.title || "");
  const [description, setDescription] = useState(
    defaultValues?.description || ""
  );
  const [dueDate, setDueDate] = useState<string | null>(
    defaultValues?.dueDate || null
  );

  // موضوع یادآور (اختیاری)
  const [selectedSubject, setSelectedSubject] = useState<{
    type: string;
    entity: any;
    entityId?: number;
  } | null>(null);

  // لیست ارسال
  const [selectedRecipients, setSelectedRecipients] = useState<any[]>([]);

  // Debug: Track when selectedRecipients changes
  useEffect(() => {
    console.log("🔍 [ReminderCreateForm] selectedRecipients changed:", {
      count: selectedRecipients.length,
      ids: selectedRecipients.map((u) => u.id),
      users: selectedRecipients,
    });
  }, [selectedRecipients]);

  // کانال‌های اطلاع‌رسانی (اعلان داخلی همیشه فعال است)
  const [sendSms, setSendSms] = useState<boolean>(
    defaultValues?.sendSms || false
  );

  // تکرار
  const [repeatInterval, setRepeatInterval] = useState<
    "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
  >(defaultValues?.repeatInterval || "NONE");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitRef = useRef(false);

  /* ---------- Handlers ---------- */
  const handleSubjectSelect = (
    subject: {
      type: "REQUEST" | "INVOICE" | "USER" | "TASK" | "GENERAL";
      entity: any;
      entityId?: number;
    } | null
  ) => {
    console.log("🔍 [ReminderCreateForm] handleSubjectSelect called:", {
      subjectType: subject?.type,
      entityId: subject?.entityId,
      entity: subject?.entity,
    });
    setSelectedSubject(subject);
  };

  const handleSubmit = () => {
    if (isSubmitting || submitRef.current) {
      console.log(
        "🔍 [ReminderCreateForm] Already submitting, ignoring duplicate call"
      );
      return;
    }

    try {
      setIsSubmitting(true);
      submitRef.current = true;
      setError(null);

      if (!title.trim()) {
        setError("عنوان الزامی است");
        setIsSubmitting(false);
        submitRef.current = false;
        return;
      }

      if (!description.trim()) {
        setError("توضیحات الزامی است");
        setIsSubmitting(false);
        submitRef.current = false;
        return;
      }

      if (!dueDate) {
        setError("تاریخ سررسید الزامی است");
        setIsSubmitting(false);
        submitRef.current = false;
        return;
      }

      if (selectedRecipients.length === 0) {
        setError("لطفاً حداقل یک مخاطب را انتخاب کنید");
        setIsSubmitting(false);
        submitRef.current = false;
        return;
      }

      const data: any = {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate,
        status: "PENDING", // همیشه در ابتدا PENDING است
        type: selectedSubject?.type || "GENERAL",
        notificationChannels: sendSms ? "SMS" : "IN_APP",
        repeatInterval,
        timezone: "Asia/Tehran",
      };

      // اضافه کردن لینک موضوع (اگر انتخاب شده)
      if (selectedSubject && selectedSubject.type !== "GENERAL") {
        data.entityId = selectedSubject.entityId;
        data.entityType = selectedSubject.type;

        if (selectedSubject.type === "REQUEST") {
          data.requestId = selectedSubject.entityId;
        } else if (selectedSubject.type === "INVOICE") {
          data.invoiceId = selectedSubject.entityId;
        } else if (selectedSubject.type === "TASK") {
          data.taskId = selectedSubject.entityId;
        }
      }

      // لیست گیرندگان
      if (selectedRecipients.length > 0) {
        if (selectedRecipients.length === 1) {
          // تکی: فقط workspaceUser
          data.workspaceUser = { id: selectedRecipients[0].id };
        } else {
          // گروهی: recipients برای همه
          data.recipients = selectedRecipients.map((u) => ({
            workspaceUserId: u.id,
          }));
          // اولی رو هم برای workspaceUser می‌فرستیم (الزامی در Prisma)
          data.workspaceUser = { id: selectedRecipients[0].id };
        }
      }

      const validation = reminderSchema.safeParse(data);
      if (!validation.success) {
        console.error("validation errors", validation.error.flatten());
        setError("فرم دارای مقادیر نامعتبر است");
        setIsSubmitting(false);
        submitRef.current = false;
        return;
      }

      console.log("🔍 [ReminderCreateForm] FINAL DATA BEING SENT TO API:", {
        recipients: data.recipients?.length || 0,
        workspaceUser: data.workspaceUser?.id,
        selectedRecipientsCount: selectedRecipients.length,
        selectedRecipientsIds: selectedRecipients.map((u) => u.id),
        recipientsIds: data.recipients?.map((r) => r.workspaceUserId) || [],
        fullData: validation.data,
      });

      console.log(
        "🔍 [ReminderCreateForm] About to call onSubmit with data:",
        validation.data
      );
      onSubmit(validation.data);
      setIsSubmitting(false);
      submitRef.current = false;
    } catch (e) {
      console.error(e);
      setError("خطا در ایجاد یادآور");
      setIsSubmitting(false);
      submitRef.current = false;
    }
  };

  /* ---------- render ---------- */
  return (
    <div className="space-y-6">
      {error && (
        <div className="alert alert-error shadow-lg">
          <DIcon icon="fa-exclamation-triangle" cdi={false} />
          <span>{error}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ایجاد یادآور جدید</h1>
        {backUrl && (
          <Button variant="ghost" onClick={() => router.back()}>
            <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
            بازگشت
          </Button>
        )}
      </div>

      {/* 1. اطلاعات اصلی */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          <DIcon icon="fa-info-circle" cdi={false} classCustom="ml-2" />
          اطلاعات اصلی
        </h3>
        <div className="space-y-4">
          <Input
            name="title"
            label="عنوان یادآور"
            value={title}
            onChange={(e: any) => setTitle(e.target.value)}
            required
            placeholder="عنوان یادآور را وارد کنید..."
          />

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              توضیحات <span className="text-error">*</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              value={description}
              onChange={(e: any) => setDescription(e.target.value)}
              required
              rows={5}
              placeholder="توضیحات یادآور را وارد کنید..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <StandaloneDateTimePicker
                name="dueDate"
                label="تاریخ و زمان سررسید"
                value={dueDate}
                onChange={(p: any) => setDueDate(p ? p.iso : null)}
                placeholder="تاریخ و زمان سررسید را انتخاب کنید"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">تکرار</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={repeatInterval}
                onChange={(e: any) => setRepeatInterval(e.target.value)}
              >
                <option value="NONE">بدون تکرار</option>
                <option value="DAILY">روزانه</option>
                <option value="WEEKLY">هفتگی</option>
                <option value="MONTHLY">ماهانه</option>
                <option value="YEARLY">سالانه</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. موضوع یادآور (اختیاری) */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          <DIcon icon="fa-link" cdi={false} classCustom="ml-2" />
          موضوع یادآور (اختیاری)
        </h3>
        <SubjectSelector
          onSubjectSelect={handleSubjectSelect}
          selectedSubject={selectedSubject}
        />
      </Card>

      {/* 3. لیست ارسال */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          <DIcon icon="fa-users" cdi={false} classCustom="ml-2" />
          لیست ارسال (مخاطبین)
        </h3>
        <RecipientSelector
          selectedUsers={selectedRecipients}
          onSelectedUsersChange={setSelectedRecipients}
          autoAddedUser={
            selectedSubject?.type === "USER" ? selectedSubject.entity : null
          }
        />
        {selectedSubject?.type === "USER" && (
          <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
            <p className="text-blue-700">
              کاربر انتخاب شده به‌صورت خودکار به لیست ارسال اضافه شده است:{" "}
              {selectedSubject.entity?.displayName ||
                selectedSubject.entity?.user?.name}
            </p>
          </div>
        )}
      </Card>

      {/* 4. کانال‌های اطلاع‌رسانی */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          <DIcon icon="fa-bell" cdi={false} classCustom="ml-2" />
          کانال‌های اطلاع‌رسانی
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-base-200 rounded-lg">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={true}
              disabled
            />
            <DIcon icon="fa-bell" cdi={false} />
            <span className="font-medium">اعلان داخلی (همیشه فعال)</span>
          </div>
          <label className="flex items-center gap-2 p-3 bg-base-100 rounded-lg border cursor-pointer hover:bg-base-200 transition">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={sendSms}
              onChange={(e) => setSendSms(e.target.checked)}
            />
            <DIcon icon="fa-sms" cdi={false} />
            <span className="font-medium">ارسال پیامک</span>
          </label>
        </div>
      </Card>

      {/* دکمه ارسال */}
      <div className="flex justify-end gap-2">
        {backUrl && (
          <Button variant="ghost" onClick={() => router.back()}>
            انصراف
          </Button>
        )}
        <Button
          type="button"
          variant="primary"
          onClick={handleSubmit}
          disabled={
            loading ||
            isSubmitting ||
            !title.trim() ||
            !description.trim() ||
            !dueDate ||
            selectedRecipients.length === 0
          }
          loading={loading || isSubmitting}
          icon={<DIcon icon="fa-calendar-plus" cdi={false} />}
        >
          {loading || isSubmitting ? "در حال ایجاد..." : "ایجاد یادآور"}
        </Button>
      </div>
    </div>
  );
}
