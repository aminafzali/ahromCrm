// // مسیر فایل: src/modules/teams/views/page.tsx
"use client";

import Loading from "@/@Client/Components/common/Loading";

import DataTableWrapper from "@/@Client/Components/wrappers/DataTableWrapper2";
import { useCallback, useEffect, useMemo, useState } from "react";
import TeamTree from "../components/TeamTree";
import { columns } from "../data/table";
import { useTeam } from "../hooks/useTeam";
import { useTeamTree } from "../hooks/useTeamTree";
import { TeamWithRelations } from "../types";

// تابع کمکی برای پیدا کردن تمام شناسه‌های فرزندان یک تیم
const getDescendantIds = (
  teamId: number,
  allTeams: TeamWithRelations[]
): number[] => {
  const descendantIds: number[] = [teamId];
  const queue: number[] = [teamId];
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = allTeams.filter((team) => team.parentId === currentId);
    for (const child of children) {
      descendantIds.push(child.id);
      queue.push(child.id);
    }
  }
  return descendantIds;
};

export default function IndexPage() {
  const { getAll, loading, error } = useTeam();
  const [allTeams, setAllTeams] = useState<TeamWithRelations[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);

  // دریافت همه تیم‌ها برای ساخت درخت
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const result = await getAll({ page: 1, limit: 1000 });
        setAllTeams(result.data);
      } catch (err) {
        console.error("Error fetching teams:", err);
      }
    };
    fetchTeams();
  }, []);

  const { treeData } = useTeamTree(allTeams);

  const handleNodeClick = useCallback((node: any) => {
    setSelectedTeam((prev) => (prev === node.id ? null : node.id));
  }, []);

  // فیلتر کردن جدول بر اساس تیم انتخاب شده در درخت
  const extraFilter = useMemo(() => {
    if (!selectedTeam) return {};
    const idsToFilter = getDescendantIds(selectedTeam, allTeams);
    return { id_in: idsToFilter.join(",") };
  }, [selectedTeam, allTeams]);

  return (
    <>
      {loading && allTeams.length === 0 ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ستون درخت تیم‌ها */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                ساختار تیم‌ها
              </h2>
              {selectedTeam && (
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="text-sm text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                >
                  پاک کردن
                </button>
              )}
            </div>
            <TeamTree
              data={treeData}
              onNodeClick={handleNodeClick}
              selectedId={selectedTeam}
            />
          </div>

          {/* ستون اصلی (جدول تیم‌ها) */}
          <div className="lg:col-span-3">
            <DataTableWrapper<TeamWithRelations>
              columns={columns}
              createUrl="/dashboard/teams/create"
              loading={loading}
              error={error}
              title="لیست تیم‌ها"
              fetcher={getAll}
              extraFilter={extraFilter}
              //   listItemRender={listItemRender}
              defaultViewMode="list"
            />
          </div>
        </div>
      )}
    </>
  );
}

// "use client";
// import IndexWrapper from "@/@Client/Components/wrappers/V2/IndexWrapper";
// import { columns } from "../data/table";
// import { TeamRepository } from "../repo/TeamRepository";

// const TeamsPage = () => {
//   return (
//     <IndexWrapper
//       columns={columns}
//       repo={new TeamRepository()}
//       title="تیم‌ها"
//     />
//   );
// };

// export default TeamsPage;
