import { Button, Form, Input, Select } from "ndui-ahrom";
import { z } from "zod";
import DIcon from "./DIcon";

const reminderSchema = z.object({
  title: z.string().min(1, "عنوان یادآوری الزامی است"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "تاریخ یادآوری الزامی است"),
  // priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  // category: z.string().optional(),
  // notificationChannels: z.enum(["SMS", "EMAIL", "IN_APP", "ALL"]),
  // repeatInterval: z.enum(["none", "daily", "weekly", "monthly"]).optional(),
  // timezone: z.string().default("Asia/Tehran"),
});

interface ReminderFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  error?: string | null;
  templates?: { value: string; label: string }[];
}

const channelOptions = [
  { value: "ALL", label: "همه" },
  { value: "SMS", label: "پیامک" },
  { value: "EMAIL", label: "ایمیل" },
  { value: "IN_APP", label: "اعلان درون برنامه‌ای" },
];

const repeatOptions = [
  { value: "none", label: "بدون تکرار" },
  { value: "daily", label: "روزانه" },
  { value: "weekly", label: "هفتگی" },
  { value: "monthly", label: "ماهانه" },
];

const priorityOptions = [
  { value: "LOW", label: "کم" },
  { value: "MEDIUM", label: "متوسط" },
  { value: "HIGH", label: "زیاد" },
];

const categoryOptions = [
  { value: "TASK", label: "وظیفه" },
  { value: "MEETING", label: "جلسه" },
  { value: "FOLLOWUP", label: "پیگیری" },
  { value: "OTHER", label: "سایر" },
];

export default function ReminderForm({
  onSubmit,
  loading,
  error,
  templates = [],
}: ReminderFormProps) {
  return (
    <Form schema={reminderSchema} onSubmit={onSubmit}>
      <div className="space-y-4">
        {templates.length > 0 && (
          <Select name="template" label="انتخاب قالب" options={templates} />
        )}

        <Input
          name="title"
          label="عنوان یادآوری"
          placeholder="عنوان یادآوری را وارد کنید"
        />

        <Input
          name="description"
          label="توضیحات"
          type="textarea"
          placeholder="توضیحات یادآوری را وارد کنید"
        />

        <Input name="dueDate" label="تاریخ یادآوری" type="datetime-local" />
        {/* 
        <Select name="priority" label="اولویت" options={priorityOptions} />

        <Select name="category" label="دسته‌بندی" options={categoryOptions} />

        <Select
          name="notificationChannels"
          label="نحوه اطلاع‌رسانی"
          options={channelOptions}
        />

        <Select name="repeatInterval" label="تکرار" options={repeatOptions} /> */}

        {error && <div className="text-error text-sm">{error}</div>}

        <Button
          type="submit"
          disabled={loading}
          icon={<DIcon icon="fa-bell" cdi={false} classCustom="ml-2" />}
        >
          {loading ? "در حال ثبت..." : "ثبت یادآوری"}
        </Button>
      </div>
    </Form>
  );
}
