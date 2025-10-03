"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { Button, Card, Input } from "ndui-ahrom";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { z } from "zod";
import RecipientSelector from "../../reminders/components/RecipientSelector";
import SubjectSelector from "./SubjectSelector";

/* ---------- schema (client-side reference) ---------- */
const notificationSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  message: z.string().min(1, "متن پیام الزامی است"),
  note: z.string().optional(),
  sendSms: z.boolean().default(false),
  sendEmail: z.boolean().default(false),
  workspaceUser: z.object({ id: z.number() }).optional(),
  requestId: z.number().optional(),
  invoiceId: z.number().optional(),
  paymentId: z.number().optional(),
  reminderId: z.number().optional(),
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
});

/* ---------- NotificationCreateForm ---------- */
interface NotificationCreateFormProps {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  loading?: boolean;
  backUrl?: string | boolean;
  after?: () => void;
}

export default function NotificationCreateForm({
  onSubmit,
  defaultValues = {},
  loading = false,
  backUrl = true,
  after,
}: NotificationCreateFormProps) {
  const rootId = useId();
  const router = useRouter();

  /* ---------- State ---------- */
  const [title, setTitle] = useState(defaultValues?.title || "");
  const [message, setMessage] = useState(defaultValues?.message || "");
  const [note, setNote] = useState(defaultValues?.note || "");

  // موضوع اعلان (اختیاری)
  const [selectedSubject, setSelectedSubject] = useState<{
    type: string;
    entity: any;
    entityId?: number;
  } | null>(null);

  // لیست ارسال
  const [selectedRecipients, setSelectedRecipients] = useState<any[]>([]);

  // کانال‌های اطلاع‌رسانی (اعلان داخلی همیشه فعال است)
  const [sendSms, setSendSms] = useState<boolean>(
    defaultValues?.sendSms || false
  );

  const [error, setError] = useState<string | null>(null);

  /* ---------- Handlers ---------- */
  const handleSubjectSelect = (
    subject: {
      type: "REQUEST" | "INVOICE" | "USER" | "PAYMENT" | "REMINDER" | "GENERAL";
      entity: any;
      entityId?: number;
    } | null
  ) => {
    setSelectedSubject(subject);
  };

  const handleSubmit = () => {
    try {
      setError(null);

      if (!title.trim()) {
        setError("عنوان الزامی است");
        return;
      }

      if (!message.trim()) {
        setError("متن پیام الزامی است");
        return;
      }

      if (selectedRecipients.length === 0) {
        setError("لطفاً حداقل یک مخاطب را انتخاب کنید");
        return;
      }

      const data: any = {
        title: title.trim(),
        message: message.trim(),
        note: note.trim() || undefined,
        sendSms,
        sendEmail: false,
      };

      // اضافه کردن لینک موضوع (اگر انتخاب شده)
      if (selectedSubject && selectedSubject.type !== "GENERAL") {
        if (selectedSubject.type === "REQUEST") {
          data.requestId = selectedSubject.entityId;
        } else if (selectedSubject.type === "INVOICE") {
          data.invoiceId = selectedSubject.entityId;
        } else if (selectedSubject.type === "PAYMENT") {
          data.paymentId = selectedSubject.entityId;
        } else if (selectedSubject.type === "REMINDER") {
          data.reminderId = selectedSubject.entityId;
        }
      }

      // لیست گیرندگان
      if (selectedRecipients.length > 0) {
        // اگر فقط یک نفر هست، از workspaceUser استفاده می‌کنیم
        if (selectedRecipients.length === 1) {
          data.workspaceUser = { id: selectedRecipients[0].id };
        } else {
          // گروهی - فقط recipients رو ارسال می‌کنیم
          data.recipients = selectedRecipients.map((u) => ({
            workspaceUserId: u.id,
          }));
        }
      }

      const validation = notificationSchema.safeParse(data);
      if (!validation.success) {
        console.error("validation errors", validation.error.flatten());
        setError("فرم دارای مقادیر نامعتبر است");
        return;
      }

      onSubmit(validation.data);
    } catch (e) {
      console.error(e);
      setError("خطا در ایجاد اعلان");
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
        <h1 className="text-2xl font-bold">ایجاد اعلان جدید</h1>
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
            label="عنوان اعلان"
            value={title}
            onChange={(e: any) => setTitle(e.target.value)}
            required
            placeholder="عنوان اعلان را وارد کنید..."
          />

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              متن پیام <span className="text-error">*</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              value={message}
              onChange={(e: any) => setMessage(e.target.value)}
              required
              rows={5}
              placeholder="متن پیام را وارد کنید..."
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              یادداشت داخلی (اختیاری)
            </label>
            <textarea
              className="textarea textarea-bordered"
              value={note}
              onChange={(e: any) => setNote(e.target.value)}
              rows={3}
              placeholder="یادداشت داخلی برای مدیران..."
            />
          </div>
        </div>
      </Card>

      {/* 2. موضوع اعلان (اختیاری) */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          <DIcon icon="fa-link" cdi={false} classCustom="ml-2" />
          موضوع اعلان (اختیاری)
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
            !title.trim() ||
            !message.trim() ||
            selectedRecipients.length === 0
          }
          loading={loading}
          icon={<DIcon icon="fa-paper-plane" cdi={false} />}
        >
          {loading ? "در حال ارسال..." : "ارسال اعلان"}
        </Button>
      </div>
    </div>
  );
}
