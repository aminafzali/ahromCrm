"use client";

import Select3 from "@/@Client/Components/ui/Select3";
import { useDocument } from "@/modules/documents/hooks/useDocument";
import { useKnowledge } from "@/modules/knowledge/hooks/useKnowledge";
import StandaloneDatePicker from "@/modules/payments/components/StandaloneDatePicker";
import { useTask } from "@/modules/tasks/hooks/useTask";
import { useTeam } from "@/modules/teams/hooks/useTeam";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { Button, Checkbox, Form, Input } from "ndui-ahrom";
import { useEffect, useState } from "react";
import { z } from "zod";

import { useSupportInfoCategory } from "@/modules/support-info-categories/hooks/useSupportCategory";
import { useSupportInfo } from "../hooks/useSupports";
import {
  createSupportInfoSchema,
  supportPriorityEnum,
  supportSourceEnum,
  supportTypeEnum,
} from "../validation/schema";

type FormData = z.infer<typeof createSupportInfoSchema>;

export default function SupportForm({ after }: { after?: () => void }) {
  const { create, submitting, error, success } = useSupportInfo();
  const { getAll: getAllWorkspaceUsers } = useWorkspaceUser();
  const { getAll: getAllTeams } = useTeam();
  const { getAll: getAllTasks } = useTask();
  const { getAll: getAllDocuments } = useDocument();
  const { getAll: getAllKnowledge } = useKnowledge();

  const [users, setUsers] = useState<{ value: number; label: string }[]>([]);
  const [teams, setTeams] = useState<{ value: number; label: string }[]>([]);
  const [tasks, setTasks] = useState<{ value: number; label: string }[]>([]);
  const [documents, setDocuments] = useState<
    { value: number; label: string }[]
  >([]);
  const [knowledges, setKnowledges] = useState<
    { value: number; label: string }[]
  >([]);
  const [categories, setCategories] = useState<
    { value: number; label: string }[]
  >([]);
  const [contactAt, setContactAt] = useState<string | null>(null);
  const [dueAt, setDueAt] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [u, t] = await Promise.all([
        getAllWorkspaceUsers({ page: 1, limit: 200 }),
        getAllTeams({ page: 1, limit: 200 }),
      ]);
      setUsers(
        (u?.data || []).map((x: any) => ({
          value: x.id,
          label: x.displayName || x.user?.name || `#${x.id}`,
        }))
      );
      setTeams(
        (t?.data || []).map((x: any) => ({ value: x.id, label: x.name }))
      );
    })();
  }, []);

  // load relations options (simple selectable lists)
  useEffect(() => {
    (async () => {
      try {
        const [ts, ds, ks] = await Promise.all([
          getAllTasks({ page: 1, limit: 1000 }),
          getAllDocuments({ page: 1, limit: 1000 }),
          getAllKnowledge({ page: 1, limit: 1000 }),
        ]);
        setTasks(
          (ts?.data || []).map((x: any) => ({ value: x.id, label: x.title }))
        );
        setDocuments(
          (ds?.data || []).map((x: any) => ({
            value: x.id,
            label: x.title || `#${x.id}`,
          }))
        );
        setKnowledges(
          (ks?.data || []).map((x: any) => ({ value: x.id, label: x.title }))
        );
      } catch {}
    })();
  }, []);

  // Load Support Categories for Select
  const { getAll: getAllSupportCategories } = useSupportInfoCategory();
  useEffect(() => {
    (async () => {
      try {
        const res = await getAllSupportCategories({ page: 1, limit: 1000 });
        const opts = (res?.data || []).map((c: any) => ({
          value: c.id,
          label: c.name,
        }));
        setCategories(opts);
      } catch (e) {}
    })();
  }, []);

  const handleSubmit = async (data: FormData) => {
    console.log("🚀 SupportForm: Starting form submission", data);

    // Manual validation test
    const validationResult = createSupportInfoSchema.safeParse(data);
    console.log("🔍 SupportForm: Manual validation result:", validationResult);

    if (!validationResult.success) {
      console.error(
        "❌ SupportForm: Validation failed:",
        validationResult.error.issues
      );
      return;
    }

    try {
      const result = await create(validationResult.data as any);
      console.log(
        "✅ SupportForm: Successfully created support ticket",
        result
      );
      after?.();
    } catch (error) {
      console.error("❌ SupportForm: Error creating support ticket", error);
    }
  };

  const sourceOptions = supportSourceEnum.options.map((v) => ({
    value: v,
    label:
      v === "INBOUND_CALL"
        ? "تماس ورودی"
        : v === "OUTBOUND_CALL"
        ? "تماس خروجی"
        : v === "USER_TICKET"
        ? "تیکت کاربر"
        : v === "ADMIN_TICKET"
        ? "تیکت ادمین"
        : v === "ONSITE_BY_USER"
        ? "حضوری توسط کاربر"
        : v === "ONSITE_BY_US"
        ? "حضوری توسط ما"
        : v,
  }));
  const typeOptions = supportTypeEnum.options.map((v) => ({
    value: v,
    label:
      v === "SALES_ORDER"
        ? "سفارش فروش"
        : v === "QUOTE"
        ? "پیش‌فاکتور"
        : v === "ORDER_FOLLOWUP"
        ? "پیگیری سفارش"
        : v === "PURCHASE_ORDER"
        ? "سفارش خرید"
        : v === "PURCHASE_QUOTE"
        ? "استعلام خرید"
        : v === "COMPLAINT"
        ? "شکایت"
        : v === "ISSUE"
        ? "مشکل"
        : v === "QUESTION"
        ? "سوال"
        : v,
  }));
  const priorityOptions = supportPriorityEnum.options.map((v) => ({
    value: v,
    label:
      v === "LOW"
        ? "کم"
        : v === "MEDIUM"
        ? "متوسط"
        : v === "HIGH"
        ? "زیاد"
        : v === "CRITICAL"
        ? "بحرانی"
        : v,
  }));

  const statusOptions = [
    { value: "NEW", label: "جدید" },
    { value: "OPEN", label: "باز" },
    { value: "IN_PROGRESS", label: "در حال پیگیری" },
    { value: "RESOLVED", label: "حل شده" },
    { value: "CLOSED", label: "بسته" },
  ];

  return (
    <Form
      schema={createSupportInfoSchema}
      onSubmit={(data) => {
        console.log("🎯 Form onSubmit called with data:", data);
        handleSubmit(data);
      }}
    >
      <div className="grid grid-cols-1 gap-6">
        {/* اطلاعات اصلی */}
        <div className="bg-white rounded-lg p-4 shadow border">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            اطلاعات اصلی
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="title"
              label="عنوان"
              placeholder="عنوان تیکت"
              required
            />
            <Select3
              name="source"
              label="نوع ارتباط"
              options={sourceOptions}
              required
            />
            <Select3
              name="type"
              label="نوع پشتیبانی"
              options={typeOptions}
              required
            />
            <Select3 name="priority" label="اولویت" options={priorityOptions} />
            <Select3
              name="status"
              label="وضعیت"
              options={statusOptions}
              required
            />
            <div>
              <label className="label">
                <span className="label-text">تاریخ تماس</span>
              </label>
              <StandaloneDatePicker
                name="contactAt"
                value={contactAt}
                onChange={(payload: any) =>
                  setContactAt(payload ? payload.iso : null)
                }
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">زمان موعد</span>
              </label>
              <StandaloneDatePicker
                name="dueAt"
                value={dueAt}
                onChange={(payload: any) =>
                  setDueAt(payload ? payload.iso : null)
                }
              />
            </div>
            <Checkbox name="visibleToUser" label="نمایش به کاربر" />
          </div>
        </div>

        {/* اختصاص */}
        <div className="bg-white rounded-lg p-4 shadow border">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">اختصاص</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select3 name="user" label="کاربر" options={users} />
            <Select3 name="assignedAdmin" label="ادمین پیگیر" options={users} />
            <Select3 name="assignedTeam" label="تیم" options={teams} />
          </div>
        </div>

        {/* ارتباطات */}
        <div className="bg-white rounded-lg p-4 shadow border">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">ارتباطات</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select3
              name="tasks"
              label="وظایف مرتبط"
              options={tasks}
              multiple
            />
            <Select3
              name="documents"
              label="اسناد مرتبط"
              options={documents}
              multiple
            />
            <Select3
              name="knowledge"
              label="پایگاه دانش مرتبط"
              options={knowledges}
              multiple
            />
          </div>
        </div>

        {/* طبقه‌بندی */}
        <div className="bg-white rounded-lg p-4 shadow border">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            طبقه‌بندی
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select3 name="category" label="دسته" options={categories} />
          </div>
        </div>

        {/* توضیحات */}
        <div className="bg-white rounded-lg p-4 shadow border">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">توضیحات</h3>
          <Input
            name="description"
            label="توضیحات"
            placeholder="شرح مشکل یا درخواست"
            className="min-h-24"
          />
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="flex justify-end space-x-2 space-x-reverse">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              console.log("🔍 Debug: Manual form test");
              const testData = {
                title: "تست تیکت",
                source: "USER_TICKET",
                type: "QUESTION",
                priority: "MEDIUM",
                status: "NEW",
                description: "این یک تست است",
              };
              console.log("🧪 Test data:", testData);
              const validation = createSupportInfoSchema.safeParse(testData);
              console.log("🧪 Validation result:", validation);
              if (validation.success) {
                handleSubmit(validation.data as any);
              } else {
                console.error("🧪 Validation failed:", validation.error.issues);
              }
            }}
          >
            تست دستی
          </Button>
          <Button
            type="button"
            variant="primary"
            loading={submitting}
            disabled={submitting}
            onClick={async () => {
              console.log("🎯 Submit button clicked");

              // Get form data manually
              const form = document.querySelector("form");
              if (!form) {
                console.error("❌ No form found");
                return;
              }

              const formData = new FormData(form);
              const data: any = {};

              // Extract all form fields
              for (const [key, value] of formData.entries()) {
                if (value) {
                  data[key] = value;
                }
              }

              // Add date fields
              if (contactAt) data.contactAt = contactAt;
              if (dueAt) data.dueAt = dueAt;

              console.log("🎯 Extracted form data:", data);

              // Validate and submit
              const validation = createSupportInfoSchema.safeParse(data);
              console.log("🎯 Validation result:", validation);

              if (validation.success) {
                await handleSubmit(validation.data);
              } else {
                console.error("🎯 Validation failed:", validation.error.issues);
                alert("لطفاً تمام فیلدهای الزامی را پر کنید");
              }
            }}
          >
            ثبت تیکت
          </Button>
        </div>
      </div>
    </Form>
  );
}
