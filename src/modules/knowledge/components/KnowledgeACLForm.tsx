"use client";

import Select3 from "@/@Client/Components/ui/Select3";
import { useTeam } from "@/modules/teams/hooks/useTeam";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { Button } from "ndui-ahrom";
import { useEffect, useState } from "react";
import { useKnowledge } from "../hooks/useKnowledge";

export default function KnowledgeACLForm({
  id,
  initial,
}: {
  id: number;
  initial?: any;
}) {
  const { getAll: getAllTeams } = useTeam();
  const { getAll: getAllUsers } = useWorkspaceUser();
  const { update, submitting } = useKnowledge();

  const [teamOptions, setTeamOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [userOptions, setUserOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [teamIds, setTeamIds] = useState<number[]>(
    initial?.teamACL?.map((t: any) => t.team.id) || []
  );
  const [userIds, setUserIds] = useState<number[]>(
    initial?.assignees?.map((u: any) => u.workspaceUser.id) || []
  );

  useEffect(() => {
    getAllTeams({ page: 1, limit: 1000 }).then((res) =>
      setTeamOptions(
        (res?.data || []).map((t: any) => ({ label: t.name, value: t.id }))
      )
    );
    getAllUsers({ page: 1, limit: 1000 }).then((res) =>
      setUserOptions(
        (res?.data || []).map((u: any) => ({
          label: u.displayName || u.user?.name,
          value: u.id,
        }))
      )
    );
  }, [getAllTeams, getAllUsers]);

  const submit = async () => {
    await update(id, {
      assignees: userIds.map((v) => ({ id: v })),
      teamACL: teamIds.map((v) => ({ id: v })),
    } as any);
  };

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <h3 className="font-bold">دسترسی و اختصاص</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <Select3
          name="teamACL"
          label="تیم‌ها"
          options={teamOptions}
          value={teamIds.map(String)}
          multiple
          onChange={(e: any) => {
            const vals = e?.target?.selectedOptions
              ? Array.from(e.target.selectedOptions).map((o: any) =>
                  Number(o.value)
                )
              : Array.isArray(e)
              ? e.map(Number)
              : [];
            setTeamIds(vals);
          }}
        />
        <Select3
          name="assignees"
          label="کاربران"
          options={userOptions}
          value={userIds.map(String)}
          multiple
          onChange={(e: any) => {
            const vals = e?.target?.selectedOptions
              ? Array.from(e.target.selectedOptions).map((o: any) =>
                  Number(o.value)
                )
              : Array.isArray(e)
              ? e.map(Number)
              : [];
            setUserIds(vals);
          }}
        />
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={submit}
          disabled={submitting}
          loading={submitting}
        >
          ذخیره دسترسی
        </Button>
      </div>
    </div>
  );
}
