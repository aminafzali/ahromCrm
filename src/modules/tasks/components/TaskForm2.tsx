// // // مسیر: src/modules/tasks/components/TaskForm.tsx
// src/modules/tasks/components/TaskForm.tsx
"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import RichTextEditorTiptap from "@/@Client/Components/ui/RichTextEditorTiptap";
import Select3 from "@/@Client/Components/ui/Select3";
import StandaloneDatePicker from "@/@Client/Components/ui/StandaloneDatePicker2";
import { DocumentWithRelations } from "@/modules/documents/types";
import { usePMStatus } from "@/modules/pm-statuses/hooks/usePMStatus";
import { useProject } from "@/modules/projects/hooks/useProject";
import { TeamWithRelations } from "@/modules/teams/types";
import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
import { Button, Input } from "ndui-ahrom";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createTaskSchema, updateTaskSchema } from "../validation/schema";
import TaskAttachmentsSection from "./TaskAttachmentsSection";

interface TaskFormProps {
  onSubmit: (data: any, attachments: DocumentWithRelations[]) => void;
  loading?: boolean;
  initialData?: any;
  initialAttachments?: DocumentWithRelations[];
  taskId?: number;
}

// helper: ساده برای مقایسه آرایه id ها
const idsEqual = (a: any[] | undefined, b: any[] | undefined) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
};

export default function TaskForm({
  onSubmit,
  loading = false,
  initialData,
  initialAttachments,
  taskId,
}: TaskFormProps) {
  // --- state فرم ---
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [projectId, setProjectId] = useState<number | undefined>(
    initialData?.project?.id
  );
  const [globalStatusId, setGlobalStatusId] = useState<number | undefined>(
    initialData?.status?.id
  );
  const [projectStatusId, setProjectStatusId] = useState<number | undefined>(
    initialData?.projectStatus?.id
  );
  const [priority, setPriority] = useState<string>(
    initialData?.priority || "medium"
  );
  const [startDate, setStartDate] = useState<string | null>(
    initialData?.startDate || null
  );
  const [endDate, setEndDate] = useState<string | null>(
    initialData?.endDate || null
  );

  const [assignedUserIds, setAssignedUserIds] = useState<number[]>(
    initialData?.assignedUsers?.map((u: any) => u.id) || []
  );
  const [assignedTeamIds, setAssignedTeamIds] = useState<number[]>(
    initialData?.assignedTeams?.map((t: any) => t.id) || []
  );

  // --- گزینه‌ها و داده‌های داینامیک ---
  const [projectOptions, setProjectOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [globalStatusOptions, setGlobalStatusOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [projectStatusOptions, setProjectStatusOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [allStatusRecords, setAllStatusRecords] = useState<any[]>([]);
  const [assignableUsers, setAssignableUsers] = useState<
    WorkspaceUserWithRelations[]
  >([]);
  const [assignableTeams, setAssignableTeams] = useState<TeamWithRelations[]>(
    []
  );
  const [errors, setErrors] = useState<any>({});
  const [attachments, setAttachments] = useState<DocumentWithRelations[]>(
    initialAttachments ?? []
  );

  useEffect(() => {
    if (initialAttachments !== undefined) {
      setAttachments(initialAttachments);
    }
  }, [initialAttachments]);

  // --- هوک‌های واکشی ---
  const { getById: getProjectById, loading: loadingProjectDetails } =
    useProject();
  const { getAll: getAllProjects, loading: loadingProjects } = useProject();
  const { getAll: getAllStatuses, loading: loadingStatuses } = usePMStatus();

  // --- بارگذاری لیست پروژه‌ها و وضعیت‌ها (یکبار) ---
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await getAllProjects({
          page: 1,
          limit: 1000,
          assignedTo: "me",
        });
        if (!mounted) return;
        const newProjects = (res?.data || []).map((p: any) => ({
          label: p.name,
          value: p.id,
        }));
        setProjectOptions((prev) =>
          idsEqual(
            prev.map((x) => x.value),
            newProjects.map((x) => x.value)
          )
            ? prev
            : newProjects
        );
      } catch (e) {
        console.error("getAllProjects error", e);
      }
    })();

    (async () => {
      try {
        const res = await getAllStatuses({
          page: 1,
          limit: 1000,
          type: "TASK",
        });
        if (!mounted) return;
        const list = res?.data || [];
        setAllStatusRecords(list);
        const globals = list
          .filter((s: any) => !s.projectId)
          .map((s: any) => ({ label: s.name, value: s.id }));
        setGlobalStatusOptions((prev) =>
          idsEqual(
            prev.map((x) => x.value),
            globals.map((x) => x.value)
          )
            ? prev
            : globals
        );
      } catch (e) {
        console.error("getAllStatuses error", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ----------------------------------------------------------------
  // NEW: متد پایدار برای بارگذاری تیم‌ها/کاربران پروژه (فراخوانی صریح، نه داخل یک useEffect با dep متغیر)
  // ----------------------------------------------------------------
  const fetchProjectAssignments = useCallback(
    async (projId?: number) => {
      // اگر پروجکت نامعتبر است => فقط پاک کن (ولی فقط زمانی که واقعاً تغییر لازم باشه)
      if (!projId) {
        setAssignableUsers((prev) => (prev.length ? [] : prev));
        setAssignableTeams((prev) => (prev.length ? [] : prev));
        // همچنین حذف انتخاب‌های اختصاص داده شده
        setAssignedUserIds((prev) => (prev.length ? [] : prev));
        setAssignedTeamIds((prev) => (prev.length ? [] : prev));
        return;
      }

      try {
        const projectDetails = await getProjectById(projId);
        const newUsers = projectDetails?.assignedUsers || [];
        const newTeams = projectDetails?.assignedTeams || [];

        // فقط در صورت واقعی تفاوت آپدیت بزنیم
        setAssignableUsers((prev) => {
          const prevIds = prev.map((p) => p.id);
          const nextIds = newUsers.map((u: any) => u.id);
          return idsEqual(prevIds, nextIds) ? prev : newUsers;
        });

        setAssignableTeams((prev) => {
          const prevIds = prev.map((p) => p.id);
          const nextIds = newTeams.map((t: any) => t.id);
          return idsEqual(prevIds, nextIds) ? prev : newTeams;
        });

        // فیلتر انتخاب‌های قبلی تا فقط آیتم‌های موجود بمانند
        setAssignedUserIds((prev) =>
          prev.filter((userId) => newUsers.some((u: any) => u.id === userId))
        );
        setAssignedTeamIds((prev) =>
          prev.filter((teamId) => newTeams.some((t: any) => t.id === teamId))
        );
      } catch (error) {
        console.error("Error fetching project assignments:", error);
        // در صورت نیاز می‌توان خطای UI را ست کرد
      }
    },
    [getProjectById]
  );

  // اگر فرم با initialData ای آمد که project دارد، یک‌بار آن را بارگذاری کن
  useEffect(() => {
    if (initialData?.project?.id) {
      // مهم: این صدا فقط یک‌بار در mount/initialData اجرا می‌شود
      fetchProjectAssignments(initialData.project.id);
    }
  }, []); // intentionally run once on mount for initialData

  // بروزرسانی گزینه‌های وضعیت پروژه با توجه به پروژه انتخاب شده
  useEffect(() => {
    if (!projectId) {
      setProjectStatusOptions([]);
      setProjectStatusId(undefined);
      return;
    }
    const projectSpecific = allStatusRecords.filter(
      (s: any) => Number(s.projectId) === Number(projectId)
    );
    const options = projectSpecific.map((s: any) => ({
      label: s.name,
      value: s.id,
    }));
    setProjectStatusOptions(options);
    if (
      projectStatusId &&
      !projectSpecific.some(
        (s: any) => Number(s.id) === Number(projectStatusId)
      )
    ) {
      setProjectStatusId(undefined);
    }
  }, [allStatusRecords, projectId, projectStatusId]);

  // --- مشتقات memoized ---
  const selectedUserObjects = useMemo(
    () => assignableUsers.filter((u) => assignedUserIds.includes(u.id)),
    [assignableUsers, assignedUserIds]
  );

  const selectedTeamObjects = useMemo(
    () => assignableTeams.filter((t) => assignedTeamIds.includes(t.id)),
    [assignableTeams, assignedTeamIds]
  );

  // --- نرمالایزر تغییرات Select3 (پشتیبانی از event یا آرایه) ---
  const normalizeMultiChange = useCallback((payload: any) => {
    if (Array.isArray(payload)) return payload.map(Number);
    if (payload && payload.target) {
      const target = payload.target as HTMLSelectElement;
      if (target.multiple)
        return Array.from(target.selectedOptions).map((o) => Number(o.value));
      return target.value ? [Number(target.value)] : [];
    }
    return [];
  }, []);

  // handler ها برای assigned lists
  const handleAssignedTeamsChange = useCallback(
    (payload: any) => {
      const next = normalizeMultiChange(payload);
      setAssignedTeamIds((prev) => (idsEqual(prev, next) ? prev : next));
    },
    [normalizeMultiChange]
  );

  const handleAssignedUsersChange = useCallback(
    (payload: any) => {
      const next = normalizeMultiChange(payload);
      setAssignedUserIds((prev) => (idsEqual(prev, next) ? prev : next));
    },
    [normalizeMultiChange]
  );

  // --- early loading return (هوک‌ها بالاتر قرار دارند) ---
  const isLoading = loadingProjects || loadingStatuses;
  if (isLoading) return <Loading />;

  // --- submit ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToValidate = {
      title,
      description,
      project: projectId ? { id: projectId } : undefined,
      globalStatus: globalStatusId ? { id: globalStatusId } : undefined,
      projectStatus: projectStatusId ? { id: projectStatusId } : undefined,
      priority,
      startDate,
      endDate,
      assignedUsers: assignedUserIds.map((id) => ({ id })),
      assignedTeams: assignedTeamIds.map((id) => ({ id })),
    };

    const schema = initialData ? updateTaskSchema : createTaskSchema;
    const validation = schema.safeParse(dataToValidate);

    if (!validation.success) {
      setErrors(validation.error.flatten().fieldErrors);
      return;
    }

    setErrors({});
    onSubmit(validation.data, attachments);
  };

  // --- وقتی کاربر پروژه را انتخاب می‌کند: پروژه را ست کن و بلافاصله assignmentها را بارگذاری کن ---
  const handleProjectChange = (e: any) => {
    let nextId: number | undefined;
    if (e && e.target)
      nextId = e.target.value ? Number(e.target.value) : undefined;
    else nextId = e ? Number(e) : undefined;

    setProjectId(nextId);
    // بلافاصله بارگذاری (اگر nextId تعریف شده است)، یا پاکسازی اگر undefined
    fetchProjectAssignments(nextId);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border dark:border-slate-700 space-y-6">
        <Input
          name="title"
          label="عنوان وظیفه"
          value={title}
          onChange={(e: any) => setTitle(e.target.value)}
          required
        />

        <div>
          <label className="label">
            <span className="label-text">توضیحات</span>
          </label>
          <RichTextEditorTiptap
            value={description}
            onChange={setDescription}
            placeholder="توضیحات وظیفه را بنویسید..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Select3
              label="پروژه"
              value={projectId}
              onChange={handleProjectChange}
              options={projectOptions}
              required
              name="project"
            />
            {errors.project && (
              <p className="text-sm text-red-500 mt-1">{errors.project[0]}</p>
            )}
          </div>

          <div>
            <Select3
              label="وضعیت کلی"
              value={globalStatusId}
              onChange={(e: any) => {
                if (e && e.target)
                  setGlobalStatusId(
                    e.target.value ? Number(e.target.value) : undefined
                  );
                else setGlobalStatusId(e ? Number(e) : undefined);
              }}
              options={globalStatusOptions}
              required
              name="globalStatus"
            />
            {errors.globalStatus && (
              <p className="text-sm text-red-500 mt-1">
                {errors.globalStatus[0]}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <Select3
              label="وضعیت خاص پروژه"
              value={projectStatusId}
              onChange={(e: any) => {
                if (e && e.target)
                  setProjectStatusId(
                    e.target.value ? Number(e.target.value) : undefined
                  );
                else setProjectStatusId(e ? Number(e) : undefined);
              }}
              options={projectStatusOptions}
              disabled={
                !projectId ||
                projectStatusOptions.length === 0 ||
                loadingProjectDetails
              }
              required={projectStatusOptions.length > 0}
              name="projectStatus"
            />
            <div className="text-xs text-gray-500 space-y-1">
              {!projectId && (
                <span>
                  برای مشاهده وضعیت‌های خاص ابتدا پروژه را انتخاب کنید.
                </span>
              )}
              {projectId && projectStatusOptions.length === 0 && (
                <span>
                  برای این پروژه وضعیت خاصی تعریف نشده است.{" "}
                  <Link
                    href={`/dashboard/pm-statuses?projectId=${projectId}`}
                    className="text-primary hover:underline"
                  >
                    مدیریت وضعیت‌های خاص
                  </Link>
                </span>
              )}
              {projectId && projectStatusOptions.length > 0 && (
                <Link
                  href={`/dashboard/pm-statuses?projectId=${projectId}`}
                  className="text-primary hover:underline"
                >
                  مدیریت وضعیت‌های خاص این پروژه
                </Link>
              )}
            </div>
            {errors.projectStatus && (
              <p className="text-sm text-red-500 mt-1">
                {errors.projectStatus[0]}
              </p>
            )}
          </div>
        </div>

        <div className="p-4 border border-dashed rounded-lg space-y-4">
          <h3 className="font-bold">اختصاص به:</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select3
              label="تیم‌ها"
              name="assignedTeams"
              options={assignableTeams.map((t) => ({
                label: t.name,
                value: t.id,
              }))}
              value={assignedTeamIds.map(String)}
              onChange={handleAssignedTeamsChange}
              disabled={!projectId || loadingProjectDetails}
              multiple
            />

            <Select3
              label="کاربران"
              name="assignedUsers"
              options={assignableUsers.map((u) => ({
                label: u.displayName ?? u.user?.name ?? "کاربر بی‌نام",
                value: u.id,
              }))}
              value={assignedUserIds.map(String)}
              onChange={handleAssignedUsersChange}
              disabled={!projectId || loadingProjectDetails}
              multiple
            />
          </div>

          {(selectedTeamObjects.length > 0 ||
            selectedUserObjects.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t">
              {selectedTeamObjects.map((team) => (
                <div
                  key={`team-tag-${team.id}`}
                  className="badge badge-lg badge-outline gap-2"
                >
                  <DIcon icon="fa-users" /> {team.name}
                  <button
                    type="button"
                    onClick={() =>
                      setAssignedTeamIds((prev) =>
                        prev.filter((id) => id !== team.id)
                      )
                    }
                    className="btn btn-xs btn-circle btn-ghost"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {selectedUserObjects.map((user) => (
                <div
                  key={`user-tag-${user.id}`}
                  className="badge badge-lg badge-outline gap-2"
                >
                  <DIcon icon="fa-user" /> {user.displayName || user.user?.name}
                  <button
                    type="button"
                    onClick={() =>
                      setAssignedUserIds((prev) =>
                        prev.filter((id) => id !== user.id)
                      )
                    }
                    className="btn btn-xs btn-circle btn-ghost"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StandaloneDatePicker
            name="startDate"
            label="تاریخ شروع"
            value={startDate}
            onChange={(payload: any) =>
              setStartDate(payload ? payload.iso : null)
            }
          />
          <StandaloneDatePicker
            name="endDate"
            label="تاریخ پایان"
            value={endDate}
            onChange={(payload: any) =>
              setEndDate(payload ? payload.iso : null)
            }
          />
          <Select3
            label="اولویت"
            value={priority}
            onChange={(e: any) =>
              e && e.target
                ? setPriority(e.target.value)
                : setPriority(String(e))
            }
            options={[
              { label: "پایین", value: "low" },
              { label: "متوسط", value: "medium" },
              { label: "بالا", value: "high" },
              { label: "فوری", value: "urgent" },
            ]}
            name="priority"
          />
        </div>

        <TaskAttachmentsSection
          value={attachments}
          onChange={setAttachments}
          taskId={taskId}
        />
      </div>

      <div className="flex justify-end mt-6">
        <Button type="submit" disabled={loading} loading={loading}>
          {initialData ? "ذخیره تغییرات" : "ایجاد وظیفه"}
        </Button>
      </div>
    </form>
  );
}
