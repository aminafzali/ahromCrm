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

import { useActivityCategory } from "@/modules/activity-categories/hooks/useActivityCategory";
import { useActivity } from "../hooks/useActivity";
import {
  activityPriorityEnum,
  activitySourceEnum,
  activitySubjectEnum,
  activityTypeEnum,
  createActivitySchema,
} from "../validation/schema";

type FormData = z.infer<typeof createActivitySchema>;

export default function ActivityForm({ after }: { after?: () => void }) {
  const { create, submitting, error, success } = useActivity();
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

  // Form state for custom buttons
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");

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

  // Load Activity Categories for Select
  const { getAll: getAllActivityCategories } = useActivityCategory();
  useEffect(() => {
    (async () => {
      try {
        const res = await getAllActivityCategories({ page: 1, limit: 1000 });
        const opts = (res?.data || []).map((c: any) => ({
          value: c.id,
          label: c.name,
        }));
        setCategories(opts);
      } catch (e) {}
    })();
  }, []);

  const handleSubmit = async (data: FormData) => {
    console.log("🚀 ActivityForm: Starting form submission", data);

    // Add selected values to form data
    const formData = {
      ...data,
      source: selectedSource,
      type: selectedType,
      subject: selectedSubject,
    };

    // Manual validation test
    const validationResult = createActivitySchema.safeParse(formData);
    console.log("🔍 ActivityForm: Manual validation result:", validationResult);

    if (!validationResult.success) {
      console.error(
        "❌ ActivityForm: Validation failed:",
        validationResult.error.issues
      );
      return;
    }

    try {
      const result = await create(validationResult.data as any);
      console.log("✅ ActivityForm: Successfully created activity", result);
      after?.();
    } catch (error) {
      console.error("❌ ActivityForm: Error creating activity", error);
    }
  };

  const sourceOptions = activitySourceEnum.options.map((v) => ({
    value: v,
    label: v === "INBOUND" ? "ورودی" : "خروجی",
  }));

  const typeOptions = activityTypeEnum.options.map((v) => ({
    value: v,
    label:
      v === "CALL"
        ? "تماس"
        : v === "TICKET"
        ? "تیکت"
        : v === "MEETING"
        ? "جلسه"
        : v,
  }));

  const subjectOptions = activitySubjectEnum.options.map((v) => ({
    value: v,
    label:
      v === "SALES_ORDER"
        ? "سفارش فروش"
        : v === "SALES_QUOTE"
        ? "پیش فاکتور فروش"
        : v === "PURCHASE_ORDER"
        ? "سفارش خرید"
        : v === "PURCHASE_QUOTE"
        ? "پیش فاکتور خرید"
        : v === "ORDER_FOLLOWUP"
        ? "پیگیری سفارش"
        : v === "COMPLAINT"
        ? "شکایت"
        : v === "ISSUE"
        ? "مشکل"
        : v === "QUESTION"
        ? "سوال"
        : v === "GENERAL_INQUIRY"
        ? "استعلام عمومی"
        : v,
  }));

  const priorityOptions = activityPriorityEnum.options.map((v) => ({
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
      schema={createActivitySchema}
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
              placeholder="عنوان فعالیت"
              required
            />

            {/* Source Selection with Icons */}
            <div>
              <label className="label">
                <span className="label-text">نوع ارتباط</span>
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={
                    selectedSource === "INBOUND" ? "primary" : "secondary"
                  }
                  size="sm"
                  onClick={() => setSelectedSource("INBOUND")}
                  className="flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  ورودی
                </Button>
                <Button
                  type="button"
                  variant={
                    selectedSource === "OUTBOUND" ? "primary" : "secondary"
                  }
                  size="sm"
                  onClick={() => setSelectedSource("OUTBOUND")}
                  className="flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  خروجی
                </Button>
              </div>
            </div>

            {/* Type Selection with Icons */}
            <div>
              <label className="label">
                <span className="label-text">نوع فعالیت</span>
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={selectedType === "CALL" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setSelectedType("CALL")}
                  className="flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  تماس
                </Button>
                <Button
                  type="button"
                  variant={selectedType === "TICKET" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setSelectedType("TICKET")}
                  className="flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  تیکت
                </Button>
                <Button
                  type="button"
                  variant={selectedType === "MEETING" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setSelectedType("MEETING")}
                  className="flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  جلسه
                </Button>
              </div>
            </div>

            {/* Subject Selection */}
            <Select3
              name="subject"
              label="موضوع فعالیت"
              options={subjectOptions}
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
            placeholder="شرح فعالیت یا درخواست"
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
                title: "تست فعالیت",
                source: "INBOUND",
                type: "CALL",
                subject: "QUESTION",
                priority: "MEDIUM",
                status: "NEW",
                description: "این یک تست است",
              };
              console.log("🧪 Test data:", testData);
              const validation = createActivitySchema.safeParse(testData);
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

              // Add date fields and selected values
              if (contactAt) data.contactAt = contactAt;
              if (dueAt) data.dueAt = dueAt;
              data.source = selectedSource;
              data.type = selectedType;
              data.subject = selectedSubject;

              console.log("🎯 Extracted form data:", data);

              // Validate and submit
              const validation = createActivitySchema.safeParse(data);
              console.log("🎯 Validation result:", validation);

              if (validation.success) {
                await handleSubmit(validation.data);
              } else {
                console.error("🎯 Validation failed:", validation.error.issues);
                alert("لطفاً تمام فیلدهای الزامی را پر کنید");
              }
            }}
          >
            ثبت فعالیت
          </Button>
        </div>
      </div>
    </Form>
  );
}
