"use client";

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
        <Input name="title" label="عنوان" placeholder="عنوان تیکت" required />
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

        <Select name="user.id" label="کاربر" options={users} />
        <Select name="assignedAdmin.id" label="ادمین پیگیر" options={users} />
        <Select name="assignedTeam.id" label="تیم" options={teams} />

        <Input name="category.id" label="دسته (ID)" placeholder="شناسه دسته" />
        <Input
          name="description"
          label="توضیحات"
          placeholder="شرح مشکل یا درخواست"
        />
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
