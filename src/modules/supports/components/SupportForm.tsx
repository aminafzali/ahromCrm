"use client";

import { useSupportCategory } from "@/modules/supports-categories/hooks/useSupportCategory";
import { useTeam } from "@/modules/teams/hooks/useTeam";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { Button, Checkbox, Form, Input, Select } from "ndui-ahrom";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useSupports } from "../hooks/useSupports";
import {
  createSupportsSchema,
  supportPriorityEnum,
  supportSourceEnum,
  supportTypeEnum,
} from "../validation/schema";

type FormData = z.infer<typeof createSupportsSchema>;

export default function SupportForm({ after }: { after?: () => void }) {
  const { create, submitting, error, success } = useSupports();
  const { getAll: getAllWorkspaceUsers } = useWorkspaceUser();
  const { getAll: getAllTeams } = useTeam();

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

  // Load Support Categories for Select
  const { getAll: getAllSupportCategories } = useSupportCategory();
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
    await create(data as any);
    after?.();
  };

  const sourceOptions = supportSourceEnum.options.map((v) => ({
    value: v,
    label: v,
  }));
  const typeOptions = supportTypeEnum.options.map((v) => ({
    value: v,
    label: v,
  }));
  const priorityOptions = supportPriorityEnum.options.map((v) => ({
    value: v,
    label: v,
  }));

  return (
    <Form schema={createSupportsSchema} onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            اطلاعات اصلی
          </h3>
          <Input name="title" label="عنوان" placeholder="عنوان تیکت" required />
        </div>
        <Select
          name="source"
          label="نوع ارتباط"
          options={sourceOptions}
          required
        />
        <Select
          name="type"
          label="نوع پشتیبانی"
          options={typeOptions}
          required
        />
        <Select name="priority" label="اولویت" options={priorityOptions} />
        <Input name="status" label="وضعیت" placeholder="مثلاً جدید" required />
        <Input name="contactAt" label="تاریخ تماس" type="datetime-local" />
        <Input name="dueAt" label="زمان موعد" type="datetime-local" />
        <Checkbox name="visibleToUser" label="نمایش به کاربر" />

        <div className="md:col-span-2">
          <h3 className="text-sm font-semibold text-gray-600 mt-4 mb-2">
            اختصاص
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select name="user.id" label="کاربر" options={users} />
            <Select
              name="assignedAdmin.id"
              label="ادمین پیگیر"
              options={users}
            />
            <Select name="assignedTeam.id" label="تیم" options={teams} />
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-sm font-semibold text-gray-600 mt-4 mb-2">
            ارتباطات
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select name="tasks" label="وظایف مرتبط" options={tasks} multiple />
            <Select
              name="documents"
              label="اسناد مرتبط"
              options={documents}
              multiple
            />
            <Select
              name="knowledge"
              label="پایگاه دانش مرتبط"
              options={knowledges}
              multiple
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-sm font-semibold text-gray-600 mt-4 mb-2">
            طبقه‌بندی
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select name="category.id" label="دسته" options={categories} />
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-sm font-semibold text-gray-600 mt-4 mb-2">
            توضیحات
          </h3>
          <Input
            name="description"
            label="توضیحات"
            placeholder="شرح مشکل یا درخواست"
            className="min-h-24"
          />
        </div>
      </div>

      {error && <div className="alert alert-error my-4">{error}</div>}
      {success && <div className="alert alert-success my-4">{success}</div>}

      <div className="flex justify-end mt-4">
        <Button
          type="submit"
          variant="primary"
          loading={submitting}
          disabled={submitting}
        >
          ثبت تیکت
        </Button>
      </div>
    </Form>
  );
}
