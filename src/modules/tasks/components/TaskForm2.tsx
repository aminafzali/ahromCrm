"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import ButtonSelectWithTable2 from "@/@Client/Components/ui/ButtonSelectWithTable2";
import RichTextEditor from "@/@Client/Components/ui/RichTextEditor";
import StandaloneDatePicker from "@/@Client/Components/ui/StandaloneDatePicker2";
import { usePMStatus } from "@/modules/pm-statuses/hooks/usePMStatus";
import { useProject } from "@/modules/projects/hooks/useProject";
import { columnsForSelect as teamColumns } from "@/modules/teams/data/table";
import { TeamWithRelations } from "@/modules/teams/types";
import { columnsForSelect as userColumns } from "@/modules/workspace-users/data/table";
import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "ndui-ahrom";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import {
  createTaskSchema,
  updateTaskSchema,
} from "../validation/schema";
import Select3 from "@/@Client/Components/ui/Select3";

// تعریف نوع داده‌های فرم بر اساس Zod schema
type TaskFormData = z.infer<typeof createTaskSchema>;

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void;
  loading?: boolean;
  initialData?: any;
}

export default function TaskForm({
  onSubmit,
  loading = false,
  initialData,
}: TaskFormProps) {
  // --- راه‌اندازی React Hook Form ---
  const formMethods = useForm<TaskFormData>({
    resolver: zodResolver(initialData ? updateTaskSchema : createTaskSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      project: initialData?.project || undefined,
      status: initialData?.status || undefined,
      priority: initialData?.priority || "medium",
      startDate: initialData?.startDate || null,
      endDate: initialData?.endDate || null,
      assignedUsers: initialData?.assignedUsers || [],
      assignedTeams: initialData?.assignedTeams || [],
    },
  });

  const { control, watch, setValue, handleSubmit, formState: { errors } } = formMethods;

  // --- State برای گزینه‌های داینامیک ---
  const [projectOptions, setProjectOptions] = useState<{ label: string; value: number }[]>([]);
  const [statusOptions, setStatusOptions] = useState<{ label: string; value: number }[]>([]);
  const [assignableUsers, setAssignableUsers] = useState<WorkspaceUserWithRelations[]>([]);
  const [assignableTeams, setAssignableTeams] = useState<TeamWithRelations[]>([]);

  // --- هوک‌ها برای واکشی داده‌ها ---
  const { getById: getProjectById, loading: loadingProjectDetails } = useProject();
  const { getAll: getAllProjects, loading: loadingProjects } = useProject();
  const { getAll: getAllStatuses, loading: loadingStatuses } = usePMStatus();

  // --- واکشی داده‌های اولیه (لیست پروژه‌ها و وضعیت‌ها) ---
  useEffect(() => {
    
    getAllProjects({ page: 1, limit: 1000, assignedTo: "me" }).then(res => 
      setProjectOptions((res.data || []).map((p: any) => ({ label: p.name, value: p.id })))
    );
    
    getAllStatuses({ page: 1, limit: 100, type: "TASK" }).then(res => 
      setStatusOptions((res.data || []).map((s: any) => ({ label: s.name, value: s.id })))
    );
  }, []);

  // --- مشاهده تغییرات پروژه برای واکشی تیم‌ها و کاربران مرتبط ---
  const watchedProject = watch("project");
  useEffect(() => {
    const fetchProjectAssignments = async () => {
      if (!watchedProject?.id) {
        setAssignableUsers([]);
        setAssignableTeams([]);
        return;
      }
      try {
        const projectDetails = await getProjectById(watchedProject.id, { 
          include: { assignedUsers: {include:{user:true}}, assignedTeams: true } 
        });
        setAssignableUsers(projectDetails?.assignedUsers || []);
        setAssignableTeams(projectDetails?.assignedTeams || []);
        
        // با تغییر پروژه، اعضای انتخاب شده قبلی را پاک می‌کنیم
        setValue("assignedUsers", []);
        setValue("assignedTeams", []);

      } catch (error) {
        console.error("Error fetching project assignments:", error);
      }
    };
    fetchProjectAssignments();
  }, [watchedProject, getProjectById, setValue]);

  const isLoading = loadingProjects || loadingStatuses;
  if (isLoading) return <Loading />;

  // مشاهده مقادیر انتخاب شده برای نمایش به صورت تگ
  const selectedTeams = watch("assignedTeams") || [];
  const selectedUsers = watch("assignedUsers") || [];

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border dark:border-slate-700 space-y-6">
          <Input name="title" label="عنوان وظیفه" required 
          //error={errors.title?.message}
           />
          <Controller name="description" control={control} render={({ field }) => (
            <RichTextEditor label="توضیحات" value={field.value} onChange={field.onChange} />
          )} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller name="project" control={control} render={({ field }) => (
                <Select3 label="پروژه" options={projectOptions} value={field.value?.id}
                          onChange={val => field.onChange({ id: Number(val.target.value) })}
                          required name={"" } />
            )} />
            <Controller name="status" control={control} render={({ field }) => (
                <Select3 label="وضعیت" options={statusOptions} value={field.value?.id}
                          onChange={val => field.onChange({ id: Number(val.target.value) })}
                          required name={""}  />
            )} />
          </div>

          {/* ===== بخش اختصاص به با استفاده از ButtonSelectWithTable2 ===== */}
          <div className="p-4 border border-dashed rounded-lg space-y-4">
            <h3 className="font-bold">اختصاص به:</h3>
            <div className="flex flex-wrap gap-4">
              <ButtonSelectWithTable2
                label="تیم‌ها"
                name="assignedTeams"
                data={assignableTeams}
                columns={teamColumns}
                onSelect={(selected) => setValue("assignedTeams", selected)}
                disabled={!watchedProject || loadingProjectDetails}
                selectionMode="multiple"
              />
              <ButtonSelectWithTable2
                label="کاربران"
                name="assignedUsers"
                data={assignableUsers}
                columns={userColumns}
                showName="displayName"
                onSelect={(selected) => setValue("assignedUsers", selected)}
                disabled={!watchedProject || loadingProjectDetails}
                selectionMode="multiple"
              />
            </div>
            {(selectedTeams.length > 0 || selectedUsers.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t">
                {selectedTeams.map(team => (
                  <div key={`team-tag-${team?.id}`} className="badge badge-lg badge-outline gap-2">
                    <DIcon icon="fa-users" /> {team?.name}
                    <button type="button" onClick={() => setValue("assignedTeams", selectedTeams.filter(t => t.id !== team.id))} className="btn btn-xs btn-circle btn-ghost">✕</button>
                  </div>
                ))}
                {selectedUsers.map(user => (
                  <div key={`user-tag-${user.id}`} className="badge badge-lg badge-outline gap-2">
                    <DIcon icon="fa-user" /> {user?.displayName || user?.user.name}
                    <button type="button" onClick={() => setValue("assignedUsers", selectedUsers.filter(u => u.id !== user.id))} className="btn btn-xs btn-circle btn-ghost">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Controller name="startDate" control={control} render={({ field }) => (
              <StandaloneDatePicker label="تاریخ شروع" value={field.value} onChange={(payload) => field.onChange(payload ? payload.iso : null)} />
            )} />
            <Controller name="endDate" control={control} render={({ field }) => (
              <StandaloneDatePicker label="تاریخ پایان" value={field.value} onChange={(payload) => field.onChange(payload ? payload.iso : null)} />
            )} />
            <Controller name="priority" control={control} render={({ field }) => (
              <Select label="اولویت" {...field}
                options={[
                  { label: "پایین", value: "low" }, { label: "متوسط", value: "medium" },
                  { label: "بالا", value: "high" }, { label: "فوری", value: "urgent" },
                ]}
              />
            )} />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={loading} loading={loading}>
            {initialData ? "ذخیره تغییرات" : "ایجاد وظیفه"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}