"use client";

import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { useProject } from "@/modules/projects/hooks/useProject";
import { ProjectWithRelations } from "@/modules/projects/types";
import { useTeam } from "@/modules/teams/hooks/useTeam";
import { TeamWithRelations } from "@/modules/teams/types";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
import React, { useEffect, useMemo, useState } from "react";

interface TaskAssignmentFilterProps {
  selectedProjectIds: (string | number)[];
  onAssignmentChange: (filters: {
    assignedUsers_some?: string;
    assignedTeams_some?: string;
  }) => void;
}

const TaskAssignmentFilter: React.FC<TaskAssignmentFilterProps> = ({
  selectedProjectIds,
  onAssignmentChange,
}) => {
  // ===== شروع اصلاحیه =====
  // از useWorkspace برای گرفتن اطلاعات کاربر در این محیط کاری استفاده می‌کنیم
  // activeWorkspace همان workspaceUser است.
  const { activeWorkspace } = useWorkspace();
  // ===== پایان اصلاحیه =====

  const { getAll: getAllTeams } = useTeam();
  const { getAll: getAllWorkspaceUsers } = useWorkspaceUser();
  const { getAll: getAllProjects } = useProject();

  const [allTeams, setAllTeams] = useState<TeamWithRelations[]>([]);
  const [userProjects, setUserProjects] = useState<ProjectWithRelations[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);

  useEffect(() => {
    getAllTeams({ page: 1, limit: 1000 }).then((res) =>
      setAllTeams(res.data || [])
    );

    getAllProjects({ page: 1, limit: 1000, assignedTo: "me" }).then((res) =>
      setUserProjects(res.data || [])
    );
  }, []);

  // ===== شروع اصلاحیه =====
  // فیلتر کردن لیست تیم‌ها بر اساس شناسه کاربر در ورک‌اسپیس فعال
  const currentUserTeams = useMemo(() => {
    // activeWorkspace.id همان workspaceUser.id است
    if (!activeWorkspace?.id) return [];
    return allTeams.filter((team) =>
      team.members?.some((m) => m.workspaceUser.id === activeWorkspace.id)
    );
  }, [allTeams, activeWorkspace]);
  // ===== پایان اصلاحیه =====

  const filteredUsers = useMemo(() => {
    const relevantProjects =
      selectedProjectIds.length > 0
        ? userProjects.filter((p) => selectedProjectIds.includes(p.id))
        : userProjects;

    const userMap = new Map<number, WorkspaceUserWithRelations>();
    relevantProjects.forEach((project) => {
      project.assignedUsers?.forEach((u) => {
        if (!userMap.has(u.id)) {
          userMap.set(u.id, u);
        }
      });
    });
    return Array.from(userMap.values());
  }, [selectedProjectIds, userProjects]);

  useEffect(() => {
    const filters: {
      assignedUsers_some?: string;
      assignedTeams_some?: string;
    } = {};
    if (selectedUserIds.length > 0) {
      filters.assignedUsers_some = selectedUserIds.join(",");
    }
    if (selectedTeamIds.length > 0) {
      filters.assignedTeams_some = selectedTeamIds.join(",");
    }
    onAssignmentChange(filters);
  }, [selectedUserIds, selectedTeamIds, onAssignmentChange]);

  const handleUserToggle = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleTeamToggle = (teamId: number) => {
    setSelectedTeamIds((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  return (
    <div className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg w-64">
      <h3 className="font-bold mb-2 text-sm px-2">اختصاص یافته به:</h3>
      <div className="max-h-64 overflow-y-auto">
        <div className="mb-2">
          <p className="text-xs text-gray-500 font-semibold px-2 mb-1">
            تیم‌ها
          </p>
          {currentUserTeams.map((team) => (
            <div
              key={team.id}
              className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <input
                type="checkbox"
                id={`team-${team.id}`}
                checked={selectedTeamIds.includes(team.id)}
                onChange={() => handleTeamToggle(team.id)}
                className="checkbox checkbox-sm checkbox-primary"
              />
              <label
                htmlFor={`team-${team.id}`}
                className="mr-2 text-sm cursor-pointer"
              >
                {team.name}
              </label>
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs text-gray-500 font-semibold px-2 mb-1">
            کاربران
          </p>
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <input
                type="checkbox"
                id={`user-${u.id}`}
                checked={selectedUserIds.includes(u.id)}
                onChange={() => handleUserToggle(u.id)}
                className="checkbox checkbox-sm checkbox-primary"
              />
              <label
                htmlFor={`user-${u.id}`}
                className="mr-2 text-sm cursor-pointer"
              >
                {u.displayName || u.user.name}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskAssignmentFilter;
