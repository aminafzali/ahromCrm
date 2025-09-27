// // // مسیر فایل: src/modules/teams/views/page.tsx
"use client";

import Loading from "@/@Client/Components/common/Loading";
import DataTableWrapper3 from "@/@Client/Components/wrappers/DataTableWrapper3";
import { useCallback, useEffect, useMemo, useState } from "react";
import TeamTree from "../components/TeamTree";
import { columnsForAdmin, listItemRender } from "../data/table";
import { useTeam } from "../hooks/useTeam";
import { useTeamTree } from "../hooks/useTeamTree";
import { TeamWithRelations } from "../types";

// ثابت و فریز شده تا مرجعش همیشه یکسان بمونه
const EMPTY_FILTER = Object.freeze({});

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

  // پرچم برای نشان دادن اینکه واکشی اولیه انجام شده یا نه
  const [isInitialDataFetched, setIsInitialDataFetched] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchTeams = async () => {
      console.log("[TEAMS] fetchTeams called at", new Date().toISOString());
      try {
        const result = await getAll({ page: 1, limit: 1000 });
        const data = Array.isArray(result?.data) ? result.data : [];
        console.log(
          "[TEAMS] fetch result length =",
          data.length,
          "sample ids =",
          data.map((d) => d.id).slice(0, 10)
        );

        if (!mounted) {
          console.log("[TEAMS] component unmounted, aborting set");
          return;
        }

        // جلوگیری از setState بیهوده: اگر هر دو آرایه خالی‌اند یا آی‌دی‌ها یکی هستند، کاری نکن
        setAllTeams((prev) => {
          try {
            const prevLen = Array.isArray(prev) ? prev.length : 0;
            const newLen = Array.isArray(data) ? data.length : 0;

            // حالت هر دو خالی: نگه دار prev تا مرجع ثابت بمونه
            if (prevLen === 0 && newLen === 0) {
              console.log("[TEAMS] prev and new both empty -> skip setState");
              return prev;
            }

            // اگر قبلاً غیرخالی بود و جدید هم غیرخالی، مقایسه آی‌دی‌ها
            if (prevLen > 0 && newLen > 0) {
              const prevIds = prev.map((t) => t.id).join(",");
              const newIds = data.map((t) => t.id).join(",");
              if (prevIds === newIds && prevLen === newLen) {
                console.log(
                  "[TEAMS] prev and new ids identical -> skip setState"
                );
                return prev;
              }
            }

            console.log(
              "[TEAMS] updating allTeams: prevLen=",
              prevLen,
              "newLen=",
              newLen
            );
          } catch (e) {
            console.warn("[TEAMS] compare error, will set new data", e);
          }
          return data;
        });
      } catch (err) {
        console.error("[TEAMS] Error fetching teams:", err);
        // اگر خطا شد، مطمئن شو لیست خالی باشه (اما فقط در صورت تغییر)
        setAllTeams((prev) => {
          if (prev.length === 0) {
            console.log("[TEAMS] fetch errored, prev already empty -> keep");
            return prev;
          }
          console.log("[TEAMS] fetch errored, clearing prev list");
          return [];
        });
      } finally {
        if (mounted) {
          setIsInitialDataFetched(true); // حتی در خطا هم علامت می‌دهیم که اولین تلاش انجام شد
          console.log(
            "[TEAMS] initial fetch finished, isInitialDataFetched = true"
          );
        }
      }
    };

    fetchTeams();

    return () => {
      mounted = false;
    };
    // intentionally empty deps: نمی‌خواهیم این اثر در هر رندر تکرار شود
  }, []);

  const { treeData } = useTeamTree(allTeams);

  const handleNodeClick = useCallback((node: any) => {
    setSelectedTeam((prev) => (prev === node.id ? null : node.id));
  }, []);

  const extraFilter = useMemo(() => {
    if (!selectedTeam || allTeams.length === 0) return EMPTY_FILTER;
    const idsToFilter = getDescendantIds(selectedTeam, allTeams);
    // اگر API شما رشته می‌خواهد: idsToFilter.join(",") بجا بگذار
    const f = { id_in: idsToFilter.join(",") };
    console.log(
      "[TEAMS] extraFilter computed for selectedTeam",
      selectedTeam,
      "=>",
      f
    );
    return f;
  }, [selectedTeam, allTeams]);

  // این همان چیزی است که باید به DataTableWrapper3 پاس دهیم:
  const finalExtraFilter = useMemo(() => {
    // اگر دادهٔ اولیه هنوز نیامده و کاربر تیمی انتخاب نکرده، سعی کن یک مرجع ثابت پاس بدی
    if (!isInitialDataFetched && !selectedTeam) {
      console.log(
        "[TEAMS] finalExtraFilter -> EMPTY_FILTER (initial not fetched)"
      );
      return EMPTY_FILTER;
    }
    console.log("[TEAMS] finalExtraFilter -> extraFilter", extraFilter);
    return extraFilter;
  }, [isInitialDataFetched, selectedTeam, extraFilter]);

  // لاگ وضعیت رندر برای مشاهده‌ی تغییرات state
  useEffect(() => {
    console.log("[TEAMS] render:", {
      allTeamsLength: allTeams.length,
      isInitialDataFetched,
      loading,
      selectedTeam,
    });
  }, [allTeams, isInitialDataFetched, loading, selectedTeam]);

  // loading برای datatable تا وقتی که initial data آماده نشده، وضعیت loading را نشان دهد
  const datatableLoading = loading || !isInitialDataFetched;
  const showLoading = loading && allTeams.length === 0 && !isInitialDataFetched;

  return (
    <>
      {showLoading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
            {allTeams.length > 0 ? (
              <TeamTree
                data={treeData}
                onNodeClick={handleNodeClick}
                selectedId={selectedTeam}
              />
            ) : (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 p-4">
                اولین تیم خود را ایجاد کنید.
              </p>
            )}
          </div>

          <div className="lg:col-span-3">
            <DataTableWrapper3<TeamWithRelations>
              columns={columnsForAdmin}
              createUrl="/dashboard/teams/create"
              loading={datatableLoading}
              error={error}
              title="لیست تیم‌ها"
              fetcher={getAll}
              // <<< مهم: الآن finalExtraFilter پاس داده می‌شود
              extraFilter={finalExtraFilter}
              listItemRender={listItemRender}
              defaultViewMode="list"
            />
          </div>
        </div>
      )}
    </>
  );
}

// // // // مسیر فایل: src/modules/teams/views/page.tsx
// "use client";

// import Loading from "@/@Client/Components/common/Loading";
// import DataTableWrapper3 from "@/@Client/Components/wrappers/DataTableWrapper3";
// import { useCallback, useEffect, useMemo, useState } from "react";
// import TeamTree from "../components/TeamTree";
// import { columnsForAdmin, listItemRender } from "../data/table";
// import { useTeam } from "../hooks/useTeam";
// import { useTeamTree } from "../hooks/useTeamTree";
// import { TeamWithRelations } from "../types";

// const getDescendantIds = (
//   teamId: number,
//   allTeams: TeamWithRelations[]
// ): number[] => {
//   const descendantIds: number[] = [teamId];
//   const queue: number[] = [teamId];
//   while (queue.length > 0) {
//     const currentId = queue.shift()!;
//     const children = allTeams.filter((team) => team.parentId === currentId);
//     for (const child of children) {
//       descendantIds.push(child.id);
//       queue.push(child.id);
//     }
//   }
//   return descendantIds;
// };

// export default function IndexPage() {
//   const { getAll, loading, error } = useTeam();
//   const [allTeams, setAllTeams] = useState<TeamWithRelations[]>([]);
//   const [selectedTeam, setSelectedTeam] = useState<number | null>(null);

//   useEffect(() => {
//     const fetchTeams = async () => {
//       try {
//         const result = await getAll({ page: 1, limit: 1000 });
//         setAllTeams(result.data);
//       } catch (err) {
//         console.error("Error fetching teams:", err);
//       }
//     };
//     fetchTeams();
//   }, []);

//   const { treeData } = useTeamTree(allTeams);

//   const handleNodeClick = useCallback((node: any) => {
//     setSelectedTeam((prev) => (prev === node.id ? null : node.id));
//   }, []);

//   const extraFilter = useMemo(() => {
//     if (!selectedTeam) return {};
//     const idsToFilter = getDescendantIds(selectedTeam, allTeams);
//     return { id_in: idsToFilter.join(",") };
//   }, [selectedTeam, allTeams]);

//   return (
//     <>
//       {loading && allTeams.length === 0 ? (
//         <Loading />
//       ) : (
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//           <div className="lg:col-span-1 bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-sm">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
//                 ساختار تیم‌ها
//               </h2>
//               {selectedTeam && (
//                 <button
//                   onClick={() => setSelectedTeam(null)}
//                   className="text-sm text-teal-600 dark:text-teal-400 hover:underline font-semibold"
//                 >
//                   پاک کردن
//                 </button>
//               )}
//             </div>
//             <TeamTree
//               data={treeData}
//               onNodeClick={handleNodeClick}
//               selectedId={selectedTeam}
//             />
//           </div>

//           <div className="lg:col-span-3">
//             <DataTableWrapper3<TeamWithRelations>
//               columns={columnsForAdmin}
//               createUrl="/dashboard/teams/create"
//               loading={loading}
//               error={error}
//               title="لیست تیم‌ها"
//               fetcher={getAll}
//               extraFilter={extraFilter}
//               listItemRender={listItemRender}
//               defaultViewMode="list"
//             />
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// // "use client";

// // import Loading from "@/@Client/Components/common/Loading";

// // import DataTableWrapper3 from "@/@Client/Components/wrappers/DataTableWrapper3";
// // import { useCallback, useEffect, useMemo, useState } from "react";
// // import TeamTree from "../components/TeamTree";
// // import { columns } from "../data/table";
// // import { useTeam } from "../hooks/useTeam";
// // import { useTeamTree } from "../hooks/useTeamTree";
// // import { TeamWithRelations } from "../types";

// // // تابع کمکی برای پیدا کردن تمام شناسه‌های فرزندان یک تیم
// // const getDescendantIds = (
// //   teamId: number,
// //   allTeams: TeamWithRelations[]
// // ): number[] => {
// //   const descendantIds: number[] = [teamId];
// //   const queue: number[] = [teamId];
// //   while (queue.length > 0) {
// //     const currentId = queue.shift()!;
// //     const children = allTeams.filter((team) => team.parentId === currentId);
// //     for (const child of children) {
// //       descendantIds.push(child.id);
// //       queue.push(child.id);
// //     }
// //   }
// //   return descendantIds;
// // };

// // export default function IndexPage() {
// //   const { getAll, loading, error } = useTeam();
// //   const [allTeams, setAllTeams] = useState<TeamWithRelations[]>([]);
// //   const [selectedTeam, setSelectedTeam] = useState<number | null>(null);

// //   // دریافت همه تیم‌ها برای ساخت درخت
// //   useEffect(() => {
// //     const fetchTeams = async () => {
// //       try {
// //         const result = await getAll({ page: 1, limit: 1000 });
// //         setAllTeams(result.data);
// //       } catch (err) {
// //         console.error("Error fetching teams:", err);
// //       }
// //     };
// //     fetchTeams();
// //   }, []);

// //   const { treeData } = useTeamTree(allTeams);

// //   const handleNodeClick = useCallback((node: any) => {
// //     setSelectedTeam((prev) => (prev === node.id ? null : node.id));
// //   }, []);

// //   // فیلتر کردن جدول بر اساس تیم انتخاب شده در درخت
// //   const extraFilter = useMemo(() => {
// //     if (!selectedTeam) return {};
// //     const idsToFilter = getDescendantIds(selectedTeam, allTeams);
// //     return { id_in: idsToFilter.join(",") };
// //   }, [selectedTeam, allTeams]);

// //   return (
// //     <>
// //       {loading && allTeams.length === 0 ? (
// //         <Loading />
// //       ) : (
// //         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
// //           {/* ستون درخت تیم‌ها */}
// //           <div className="lg:col-span-1 bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-sm">
// //             <div className="flex justify-between items-center mb-4">
// //               <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
// //                 ساختار تیم‌ها
// //               </h2>
// //               {selectedTeam && (
// //                 <button
// //                   onClick={() => setSelectedTeam(null)}
// //                   className="text-sm text-teal-600 dark:text-teal-400 hover:underline font-semibold"
// //                 >
// //                   پاک کردن
// //                 </button>
// //               )}
// //             </div>
// //             <TeamTree
// //               data={treeData}
// //               onNodeClick={handleNodeClick}
// //               selectedId={selectedTeam}
// //             />
// //           </div>

// //           {/* ستون اصلی (جدول تیم‌ها) */}
// //           <div className="lg:col-span-3">
// //             <DataTableWrapper3<TeamWithRelations>
// //               columns={columns}
// //               createUrl="/dashboard/teams/create"
// //               loading={loading}
// //               error={error}
// //               title="لیست تیم‌ها"
// //               fetcher={getAll}
// //               extraFilter={extraFilter}
// //               //   listItemRender={listItemRender}
// //               defaultViewMode="list"
// //             />
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   );
// // }

// // // "use client";
// // // import IndexWrapper from "@/@Client/Components/wrappers/V2/IndexWrapper";
// // // import { columns } from "../data/table";
// // // import { TeamRepository } from "../repo/TeamRepository";

// // // const TeamsPage = () => {
// // //   return (
// // //     <IndexWrapper
// // //       columns={columns}
// // //       repo={new TeamRepository()}
// // //       title="تیم‌ها"
// // //     />
// // //   );
// // // };

// // // export default TeamsPage;
