// مسیر فایل: src/modules/tasks/components/TaskForm.tsx

"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { usePMStatus } from "@/modules/pm-statuses/hooks/usePMStatus";
import { useProject } from "@/modules/projects/hooks/useProject";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createTaskSchema } from "../validation/schema";

// ===== شروع اصلاحیه ۱: ایمپورت کامپوننت‌های صحیح مطابق با الگو =====
import RichTextEditorTiptap from "@/@Client/Components/ui/RichTextEditorTiptap";
import Select3 from "@/@Client/Components/ui/Select3";
import { DocumentWithRelations } from "@/modules/documents/types";
import StandaloneDatePicker from "@/modules/invoices/components/StandaloneDatePicker";
import { Button, Form, Input } from "ndui-ahrom";
import TaskAttachmentsSection from "./TaskAttachmentsSection";
// ===== پایان اصلاحیه ۱ =====

interface TaskFormProps {
  onSubmit: (data: any, attachments: DocumentWithRelations[]) => void;
  loading?: boolean;
  initialAttachments?: DocumentWithRelations[];
  taskId?: number;
}

export default function TaskForm({
  onSubmit,
  loading = false,
  initialAttachments,
  taskId,
}: TaskFormProps) {
  // ===== شروع اصلاحیه ۲: تعریف State ها با مقادیر اولیه (primitive) مطابق الگو =====
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<number | undefined>();
  const [globalStatusId, setGlobalStatusId] = useState<number | undefined>();
  const [projectStatusId, setProjectStatusId] = useState<number | undefined>();
  const [priority, setPriority] = useState<string>("medium");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]); // آرایه‌ای از رشته‌ها برای مقادیر
  const [attachments, setAttachments] = useState<DocumentWithRelations[]>(
    initialAttachments ?? []
  );

  useEffect(() => {
    if (initialAttachments !== undefined) {
      setAttachments(initialAttachments);
    }
  }, [initialAttachments]);
  // ===== پایان اصلاحیه ۲ =====

  // State برای نگهداری لیست گزینه‌های هر سلکت
  const [projectOptions, setProjectOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [statusOptions, setStatusOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [projectStatusOptions, setProjectStatusOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [statusRecords, setStatusRecords] = useState<any[]>([]);
  const [userOptions, setUserOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [errors, setErrors] = useState<any>({});

  // هوک‌ها برای واکشی داده‌ها
  const { getAll: getAllProjects, loading: loadingProjects } = useProject();
  const { getAll: getAllStatuses, loading: loadingStatuses } = usePMStatus();
  const { getAll: getAllUsers, loading: loadingUsers } = useWorkspaceUser();

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [projectsRes, statusesRes, usersRes] = await Promise.all([
          getAllProjects({ page: 1, limit: 1000 }),
          getAllStatuses({ page: 1, limit: 100, type: "TASK" }),
          getAllUsers({ page: 1, limit: 1000 }),
        ]);
        setProjectOptions(
          (projectsRes?.data || []).map((p: any) => ({
            label: p.name,
            value: p.id,
          }))
        );
        const statusList = statusesRes?.data || [];
        setStatusRecords(statusList);
        setStatusOptions(
          statusList
            .filter((s: any) => !s.projectId)
            .map((s: any) => ({
              label: s.name,
              value: s.id,
            }))
        );
        setUserOptions(
          (usersRes?.data || []).map((u: any) => ({
            label: u.displayName || u.user.name,
            value: u.id,
          }))
        );
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    };
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (!projectId) {
      setProjectStatusOptions([]);
      setProjectStatusId(undefined);
      return;
    }
    const projectStatuses = statusRecords.filter(
      (s: any) => Number(s.projectId) === Number(projectId)
    );
    const options = projectStatuses.map((s: any) => ({
      label: s.name,
      value: s.id,
    }));
    setProjectStatusOptions(options);
    if (
      projectStatusId &&
      !projectStatuses.some(
        (s: any) => Number(s.id) === Number(projectStatusId)
      )
    ) {
      setProjectStatusId(undefined);
    }
  }, [projectId, statusRecords, projectStatusId]);

  const handleSubmit = () => {
    const dataToValidate = {
      title,
      description,
      project: projectId ? { id: projectId } : undefined,
      globalStatus: globalStatusId ? { id: globalStatusId } : undefined,
      projectStatus: projectStatusId ? { id: projectStatusId } : undefined,
      priority,
      // تاریخ‌ها اکنون رشته هستند، برای اعتبارسنجی به Date تبدیل می‌شوند
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      assignedUsers: assignedUserIds.map((id) => ({ id: Number(id) })),
    };

    const validation = createTaskSchema.safeParse(dataToValidate);
    if (!validation.success) {
      setErrors(validation.error.flatten().fieldErrors);
      return;
    }
    setErrors({});
    // داده‌های اعتبارسنجی شده (که تاریخ‌ها در آن Date هستند) را ارسال می‌کنیم
    onSubmit(validation.data, attachments);
  };

  if (loadingProjects || loadingStatuses || loadingUsers) {
    return <Loading />;
  }

  return (
    <Form schema={createTaskSchema} onSubmit={handleSubmit}>
      <div className="bg-white rounded-lg p-6 border space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              name="title"
              label="عنوان وظیفه"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلا: طراحی صفحه اصلی سایت"
              required
              onError={errors.title?.[0]}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              توضیحات
            </label>
            <RichTextEditorTiptap
              value={description}
              onChange={setDescription}
              placeholder="توضیحات وظیفه را بنویسید..."
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">
                {errors.description[0]}
              </p>
            )}
          </div>

          <Select3
            name="project"
            label="پروژه"
            value={projectId}
            onChange={(e) => setProjectId(Number(e.target.value))}
            options={projectOptions}
            required
            onError={errors.project?.[0]}
          />

          <Select3
            name="globalStatus"
            label="وضعیت کلی"
            value={globalStatusId}
            onChange={(e) => setGlobalStatusId(Number(e.target.value))}
            options={statusOptions}
            required
            onError={errors.globalStatus?.[0]}
          />

          <div className="space-y-1">
            <Select3
              name="projectStatus"
              label="وضعیت پروژه"
              value={projectStatusId}
              onChange={(e) => setProjectStatusId(Number(e.target.value))}
              options={projectStatusOptions}
              disabled={!projectId || projectStatusOptions.length === 0}
              required={projectStatusOptions.length > 0}
              onError={errors.projectStatus?.[0]}
            />
            <div className="flex flex-col gap-1 text-xs text-gray-500">
              {!projectId && (
                <span>
                  برای مشاهده وضعیت‌های خاص ابتدا پروژه را انتخاب کنید.
                </span>
              )}
              {projectId && projectStatusOptions.length === 0 && (
                <span>
                  وضعیت خاصی برای این پروژه تعریف نشده است.{" "}
                  <Link
                    href={`/dashboard/pm-statuses?projectId=${projectId}`}
                    className="text-primary hover:underline"
                  >
                    مدیریت وضعیت‌های خاص
                  </Link>
                </span>
              )}
              {projectId && projectStatusOptions.length > 0 && (
                <span>
                  <Link
                    href={`/dashboard/pm-statuses?projectId=${projectId}`}
                    className="text-primary hover:underline"
                  >
                    مدیریت وضعیت‌های خاص این پروژه
                  </Link>
                </span>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <Select3
              label="مسئولین انجام"
              name="assignedUsers"
              options={userOptions}
              value={assignedUserIds}
              onChange={(e) => setAssignedUserIds(Array.from(e.target.value))}
              multiple
              onError={errors.assignedUsers?.[0]}
            />
          </div>

          {/* ===== شروع اصلاحیه ۳: استفاده صحیح از DatePicker مطابق الگو ===== */}
          <StandaloneDatePicker
            name="startDate"
            label="تاریخ شروع"
            value={startDate}
            onChange={(payload) => setStartDate(payload ? payload.iso : null)}
          />

          <StandaloneDatePicker
            name="endDate"
            label="تاریخ پایان"
            value={endDate}
            onChange={(payload) => setEndDate(payload ? payload.iso : null)}
          />
          {/* ===== پایان اصلاحیه ۳ ===== */}

          <Select3
            name="priority"
            label="اولویت"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={[
              { label: "کم", value: "low" },
              { label: "متوسط", value: "medium" },
              { label: "زیاد", value: "high" },
            ]}
          />
        </div>
      </div>

      <TaskAttachmentsSection
        value={attachments}
        onChange={setAttachments}
        taskId={taskId}
      />

      <div className="flex justify-end mt-6">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          icon={<DIcon icon="fa-check" cdi={false} classCustom="ml-2" />}
        >
          {loading ? "در حال ذخیره..." : "ایجاد وظیفه"}
        </Button>
      </div>
    </Form>
  );
}
