"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { useProject } from "@/modules/projects/hooks/useProject";
import { ProjectWithRelations } from "@/modules/projects/types";
import { useTeam } from "@/modules/teams/hooks/useTeam";
import { TeamWithRelations } from "@/modules/teams/types";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

// ... (هوک useClickOutside بدون تغییر) ...
const useClickOutside = (ref: any, handler: () => void) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

// ===== شروع اصلاحیه =====
// نوع targetRef را طوری تغییر می‌دهیم که بتواند null را بپذیرد
const DropdownPortal = ({
  children,
  targetRef,
}: {
  children: React.ReactNode;
  targetRef: React.RefObject<HTMLButtonElement | null>;
}) => {
  // ===== پایان اصلاحیه =====
  const [style, setStyle] = useState<React.CSSProperties>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setStyle({
        position: "absolute",
        top: `${rect.bottom + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`,
        width: `${rect.width}px`,
      });
    }
  }, [targetRef]);

  return createPortal(
    <div ref={dropdownRef} style={style} className="z-50">
      {children}
    </div>,
    document.body
  );
};

interface TaskAssignmentFilterProps {
  selectedProjectIds: (string | number)[];
  onSelectionChange: (
    users: WorkspaceUserWithRelations[],
    teams: TeamWithRelations[]
  ) => void;
  selectedUsers: WorkspaceUserWithRelations[];
  selectedTeams: TeamWithRelations[];
}

const TaskAssignmentFilter: React.FC<TaskAssignmentFilterProps> = ({
  selectedProjectIds,
  onSelectionChange,
  selectedUsers,
  selectedTeams,
}) => {
  // ... (تمام هوک‌ها و state های شما بدون تغییر باقی می‌مانند)
  const { activeWorkspace } = useWorkspace();
  const { getAll: getAllTeams } = useTeam();
  const { getAll: getAllWorkspaceUsers } = useWorkspaceUser();
  const { getAll: getAllProjects } = useProject();

  const [allTeams, setAllTeams] = useState<TeamWithRelations[]>([]);
  const [allUsers, setAllUsers] = useState<WorkspaceUserWithRelations[]>([]);
  const [projectsWithAssignments, setProjectsWithAssignments] = useState<
    ProjectWithRelations[]
  >([]);

  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null); // این خط درست است و نوع آن RefObject<HTMLButtonElement> است

  // ... (تمام useMemo و useEffect ها بدون تغییر)
  const selectedUserIds = useMemo(
    () => selectedUsers.map((u) => u.id),
    [selectedUsers]
  );
  const selectedTeamIds = useMemo(
    () => selectedTeams.map((t) => t.id),
    [selectedTeams]
  );
  const totalSelected = selectedUsers.length + selectedTeams.length;

  useEffect(() => {
    getAllTeams({ page: 1, limit: 1000 }).then((res) =>
      setAllTeams(res.data || [])
    );

    getAllWorkspaceUsers({ page: 1, limit: 1000 }).then((res) =>
      setAllUsers(res.data || [])
    );

    getAllProjects({ page: 1, limit: 1000 }).then((res) =>
      setProjectsWithAssignments(res.data || [])
    );
  }, []);

  const currentUserTeams = useMemo(() => {
    if (!activeWorkspace?.id) return [];
    return allTeams.filter((team) =>
      team.members?.some((m) => m.workspaceUser.id === activeWorkspace.id)
    );
  }, [allTeams, activeWorkspace]);

  const filteredUsers = useMemo(() => {
    const relevantProjects =
      selectedProjectIds.length > 0
        ? projectsWithAssignments.filter((p) =>
            selectedProjectIds.map((id) => Number(id)).includes(Number(p.id))
          )
        : projectsWithAssignments;

    const userMap = new Map<number, WorkspaceUserWithRelations>();
    relevantProjects.forEach((project) => {
      project.assignedUsers?.forEach((u) => {
        if (!userMap.has(u.id)) userMap.set(u.id, u);
      });
    });
    return Array.from(userMap.values());
  }, [selectedProjectIds, projectsWithAssignments]);

  // ... (تمام توابع handle... بدون تغییر)
  const handleUserToggle = (user: WorkspaceUserWithRelations) => {
    const newSelectedUsers = selectedUserIds.includes(user.id)
      ? selectedUsers.filter((u) => u.id !== user.id)
      : [...selectedUsers, user];
    onSelectionChange(newSelectedUsers, selectedTeams);
  };

  const handleTeamToggle = (team: TeamWithRelations) => {
    const newSelectedTeams = selectedTeamIds.includes(team.id)
      ? selectedTeams.filter((t) => t.id !== team.id)
      : [...selectedTeams, team];
    onSelectionChange(selectedUsers, newSelectedTeams);
  };

  const dropdownContentRef = useRef(null);
  useClickOutside(dropdownContentRef, () => setIsOpen(false));

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-outline w-full sm:w-auto md:w-52 justify-between"
      >
        <span className="font-normal">
          {totalSelected > 0
            ? `${totalSelected} مورد انتخاب شده`
            : "اختصاص یافته به"}
        </span>
        <DIcon icon="fa-chevron-down" className="w-3 h-3" />
      </button>

      {isOpen && (
        <DropdownPortal targetRef={buttonRef}>
          <div
            ref={dropdownContentRef}
            className="mt-2 w-64 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg p-2"
          >
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
                      onChange={() => handleTeamToggle(team)}
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
                      onChange={() => handleUserToggle(u)}
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
        </DropdownPortal>
      )}
    </div>
  );
};

export default TaskAssignmentFilter;
// "use client";

// import DIcon from "@/@Client/Components/common/DIcon";
// import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
// import { useProject } from "@/modules/projects/hooks/useProject";
// import { ProjectWithRelations } from "@/modules/projects/types";
// import { useTeam } from "@/modules/teams/hooks/useTeam";
// import { TeamWithRelations } from "@/modules/teams/types";
// import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
// import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
// import React, { useEffect, useMemo, useRef, useState } from "react";

// // تابعی برای بستن منو با کلیک بیرون از آن
// const useClickOutside = (ref: any, handler: () => void) => {
//   useEffect(() => {
//     const listener = (event: MouseEvent | TouchEvent) => {
//       if (!ref.current || ref.current.contains(event.target)) {
//         return;
//       }
//       handler();
//     };
//     document.addEventListener("mousedown", listener);
//     document.addEventListener("touchstart", listener);
//     return () => {
//       document.removeEventListener("mousedown", listener);
//       document.removeEventListener("touchstart", listener);
//     };
//   }, [ref, handler]);
// };

// interface TaskAssignmentFilterProps {
//   selectedProjectIds: (string | number)[];
//   onSelectionChange: (
//     users: WorkspaceUserWithRelations[],
//     teams: TeamWithRelations[]
//   ) => void;
//   selectedUsers: WorkspaceUserWithRelations[];
//   selectedTeams: TeamWithRelations[];
// }

// const TaskAssignmentFilter: React.FC<TaskAssignmentFilterProps> = ({
//   selectedProjectIds,
//   onSelectionChange,
//   selectedUsers,
//   selectedTeams,
// }) => {
//   const { activeWorkspace } = useWorkspace();
//   const { getAll: getAllTeams } = useTeam();
//   const { getAll: getAllWorkspaceUsers } = useWorkspaceUser();
//   const { getAll: getAllProjects } = useProject();

//   const [allTeams, setAllTeams] = useState<TeamWithRelations[]>([]);
//   const [allUsers, setAllUsers] = useState<WorkspaceUserWithRelations[]>([]);
//   const [userProjects, setUserProjects] = useState<ProjectWithRelations[]>([]);

//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   useClickOutside(dropdownRef, () => setIsOpen(false));

//   const selectedUserIds = useMemo(
//     () => selectedUsers.map((u) => u.id),
//     [selectedUsers]
//   );
//   const selectedTeamIds = useMemo(
//     () => selectedTeams.map((t) => t.id),
//     [selectedTeams]
//   );
//   const totalSelected = selectedUsers.length + selectedTeams.length;

//   useEffect(() => {
//     getAllTeams({ page: 1, limit: 1000 }).then((res) =>
//       setAllTeams(res.data || [])
//     );

//     getAllWorkspaceUsers({ page: 1, limit: 1000 }).then((res) =>
//       setAllUsers(res.data || [])
//     );

//     getAllProjects({ page: 1, limit: 1000, assignedTo: "me" }).then((res) =>
//       setUserProjects(res.data || [])
//     );
//   }, []);

//   const currentUserTeams = useMemo(() => {
//     if (!activeWorkspace?.id) return [];
//     return allTeams.filter((team) =>
//       team.members?.some((m) => m.workspaceUser.id === activeWorkspace.id)
//     );
//   }, [allTeams, activeWorkspace]);

//   const filteredUsers = useMemo(() => {
//     const relevantProjects =
//       selectedProjectIds.length > 0
//         ? userProjects.filter((p) => selectedProjectIds.includes(p.id))
//         : userProjects;

//     const userMap = new Map<number, WorkspaceUserWithRelations>();
//     relevantProjects.forEach((project) => {
//       project.assignedUsers?.forEach((u) => {
//         if (!userMap.has(u.id)) userMap.set(u.id, u);
//       });
//     });
//     return Array.from(userMap.values());
//   }, [selectedProjectIds, userProjects]);

//   const handleUserToggle = (user: WorkspaceUserWithRelations) => {
//     const newSelectedUsers = selectedUserIds.includes(user.id)
//       ? selectedUsers.filter((u) => u.id !== user.id)
//       : [...selectedUsers, user];
//     onSelectionChange(newSelectedUsers, selectedTeams);
//   };

//   const handleTeamToggle = (team: TeamWithRelations) => {
//     const newSelectedTeams = selectedTeamIds.includes(team.id)
//       ? selectedTeams.filter((t) => t.id !== team.id)
//       : [...selectedTeams, team];
//     onSelectionChange(selectedUsers, newSelectedTeams);
//   };

//   return (
//     <div className="relative" ref={dropdownRef}>
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="btn btn-outline w-full sm:w-auto md:w-52 justify-between"
//       >
//         <span className="font-normal">
//           {totalSelected > 0
//             ? `${totalSelected} مورد انتخاب شده`
//             : "اختصاص یافته به"}
//         </span>
//         <DIcon icon="fa-chevron-down" className="w-3 h-3" />
//       </button>

//       {isOpen && (
//         // ===== شروع اصلاحیه: افزایش z-index به z-50 =====
//         <div className="absolute top-full mt-2 z-50 w-64 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg p-2">
//           <div className="max-h-64 overflow-y-auto">
//             <div className="mb-2">
//               <p className="text-xs text-gray-500 font-semibold px-2 mb-1">
//                 تیم‌ها
//               </p>
//               {currentUserTeams.map((team) => (
//                 <div
//                   key={team.id}
//                   className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
//                 >
//                   <input
//                     type="checkbox"
//                     id={`team-${team.id}`}
//                     checked={selectedTeamIds.includes(team.id)}
//                     onChange={() => handleTeamToggle(team)}
//                     className="checkbox checkbox-sm checkbox-primary"
//                   />
//                   <label
//                     htmlFor={`team-${team.id}`}
//                     className="mr-2 text-sm cursor-pointer"
//                   >
//                     {team.name}
//                   </label>
//                 </div>
//               ))}
//             </div>
//             <div>
//               <p className="text-xs text-gray-500 font-semibold px-2 mb-1">
//                 کاربران
//               </p>
//               {filteredUsers.map((u) => (
//                 <div
//                   key={u.id}
//                   className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
//                 >
//                   <input
//                     type="checkbox"
//                     id={`user-${u.id}`}
//                     checked={selectedUserIds.includes(u.id)}
//                     onChange={() => handleUserToggle(u)}
//                     className="checkbox checkbox-sm checkbox-primary"
//                   />
//                   <label
//                     htmlFor={`user-${u.id}`}
//                     className="mr-2 text-sm cursor-pointer"
//                   >
//                     {u.displayName || u.user.name}
//                   </label>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TaskAssignmentFilter;

// // "use client";

// // import DIcon from "@/@Client/Components/common/DIcon";
// // import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
// // import { useProject } from "@/modules/projects/hooks/useProject";
// // import { ProjectWithRelations } from "@/modules/projects/types";
// // import { useTeam } from "@/modules/teams/hooks/useTeam";
// // import { TeamWithRelations } from "@/modules/teams/types";
// // import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
// // import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
// // import React, { useEffect, useMemo, useRef, useState } from "react";

// // // تابعی برای بستن منو با کلیک بیرون از آن
// // const useClickOutside = (ref: any, handler: () => void) => {
// //   useEffect(() => {
// //     const listener = (event: MouseEvent | TouchEvent) => {
// //       if (!ref.current || ref.current.contains(event.target)) {
// //         return;
// //       }
// //       handler();
// //     };
// //     document.addEventListener("mousedown", listener);
// //     document.addEventListener("touchstart", listener);
// //     return () => {
// //       document.removeEventListener("mousedown", listener);
// //       document.removeEventListener("touchstart", listener);
// //     };
// //   }, [ref, handler]);
// // };

// // interface TaskAssignmentFilterProps {
// //   selectedProjectIds: (string | number)[];
// //   onSelectionChange: (
// //     users: WorkspaceUserWithRelations[],
// //     teams: TeamWithRelations[]
// //   ) => void;
// //   selectedUsers: WorkspaceUserWithRelations[];
// //   selectedTeams: TeamWithRelations[];
// // }

// // const TaskAssignmentFilter: React.FC<TaskAssignmentFilterProps> = ({
// //   selectedProjectIds,
// //   onSelectionChange,
// //   selectedUsers,
// //   selectedTeams,
// // }) => {
// //   const { activeWorkspace } = useWorkspace();
// //   const { getAll: getAllTeams } = useTeam();
// //   const { getAll: getAllWorkspaceUsers } = useWorkspaceUser();
// //   const { getAll: getAllProjects } = useProject();

// //   const [allTeams, setAllTeams] = useState<TeamWithRelations[]>([]);
// //   const [allUsers, setAllUsers] = useState<WorkspaceUserWithRelations[]>([]);
// //   const [userProjects, setUserProjects] = useState<ProjectWithRelations[]>([]);

// //   const [isOpen, setIsOpen] = useState(false);
// //   const dropdownRef = useRef(null);
// //   useClickOutside(dropdownRef, () => setIsOpen(false));

// //   const selectedUserIds = useMemo(
// //     () => selectedUsers.map((u) => u.id),
// //     [selectedUsers]
// //   );
// //   const selectedTeamIds = useMemo(
// //     () => selectedTeams.map((t) => t.id),
// //     [selectedTeams]
// //   );
// //   const totalSelected = selectedUsers.length + selectedTeams.length;

// //   useEffect(() => {
// //     getAllTeams({ page: 1, limit: 1000 }).then((res) =>
// //       setAllTeams(res.data || [])
// //     );

// //     getAllWorkspaceUsers({ page: 1, limit: 1000 }).then((res) =>
// //       setAllUsers(res.data || [])
// //     );

// //     getAllProjects({ page: 1, limit: 1000, assignedTo: "me" }).then((res) =>
// //       setUserProjects(res.data || [])
// //     );
// //   }, []);

// //   const currentUserTeams = useMemo(() => {
// //     if (!activeWorkspace?.id) return [];
// //     return allTeams.filter((team) =>
// //       team.members?.some((m) => m.workspaceUser.id === activeWorkspace.id)
// //     );
// //   }, [allTeams, activeWorkspace]);

// //   const filteredUsers = useMemo(() => {
// //     const relevantProjects =
// //       selectedProjectIds.length > 0
// //         ? userProjects.filter((p) => selectedProjectIds.includes(p.id))
// //         : userProjects;

// //     const userMap = new Map<number, WorkspaceUserWithRelations>();
// //     relevantProjects.forEach((project) => {
// //       project.assignedUsers?.forEach((u) => {
// //         if (!userMap.has(u.id)) userMap.set(u.id, u);
// //       });
// //     });
// //     return Array.from(userMap.values());
// //   }, [selectedProjectIds, userProjects]);

// //   const handleUserToggle = (user: WorkspaceUserWithRelations) => {
// //     const newSelectedUsers = selectedUserIds.includes(user.id)
// //       ? selectedUsers.filter((u) => u.id !== user.id)
// //       : [...selectedUsers, user];
// //     onSelectionChange(newSelectedUsers, selectedTeams);
// //   };

// //   const handleTeamToggle = (team: TeamWithRelations) => {
// //     const newSelectedTeams = selectedTeamIds.includes(team.id)
// //       ? selectedTeams.filter((t) => t.id !== team.id)
// //       : [...selectedTeams, team];
// //     onSelectionChange(selectedUsers, newSelectedTeams);
// //   };

// //   return (
// //     <div className="relative" ref={dropdownRef}>
// //       <button
// //         onClick={() => setIsOpen(!isOpen)}
// //         className="btn btn-outline w-full sm:w-auto md:w-52 justify-between"
// //       >
// //         <span className="font-normal">
// //           {totalSelected > 0
// //             ? `${totalSelected} مورد انتخاب شده`
// //             : "اختصاص یافته به"}
// //         </span>
// //         <DIcon icon="fa-chevron-down" className="w-3 h-3" />
// //       </button>

// //       {isOpen && (
// //         // ===== شروع اصلاحیه: افزودن کلاس z-20 =====
// //         <div className="absolute top-full mt-2 z-20 w-64 bg-white dark:bg-teal-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg p-2">
// //           <div className="max-h-64 overflow-y-auto">
// //             <div className="mb-2">
// //               <p className="text-xs text-gray-500 font-semibold px-2 mb-1">
// //                 تیم‌ها
// //               </p>
// //               {currentUserTeams.map((team) => (
// //                 <div
// //                   key={team.id}
// //                   className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-teal-700"
// //                 >
// //                   <input
// //                     type="checkbox"
// //                     id={`team-${team.id}`}
// //                     checked={selectedTeamIds.includes(team.id)}
// //                     onChange={() => handleTeamToggle(team)}
// //                     className="checkbox checkbox-sm checkbox-primary"
// //                   />
// //                   <label
// //                     htmlFor={`team-${team.id}`}
// //                     className="mr-2 text-sm cursor-pointer"
// //                   >
// //                     {team.name}
// //                   </label>
// //                 </div>
// //               ))}
// //             </div>
// //             <div>
// //               <p className="text-xs text-gray-500 font-semibold px-2 mb-1">
// //                 کاربران
// //               </p>
// //               {filteredUsers.map((u) => (
// //                 <div
// //                   key={u.id}
// //                   className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-teal-700"
// //                 >
// //                   <input
// //                     type="checkbox"
// //                     id={`user-${u.id}`}
// //                     checked={selectedUserIds.includes(u.id)}
// //                     onChange={() => handleUserToggle(u)}
// //                     className="checkbox checkbox-sm checkbox-primary"
// //                   />
// //                   <label
// //                     htmlFor={`user-${u.id}`}
// //                     className="mr-2 text-sm cursor-pointer"
// //                   >
// //                     {u.displayName || u.user.name}
// //                   </label>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default TaskAssignmentFilter;

// // "use client";

// // import DIcon from "@/@Client/Components/common/DIcon";
// // import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
// // import { useProject } from "@/modules/projects/hooks/useProject";
// // import { ProjectWithRelations } from "@/modules/projects/types";
// // import { useTeam } from "@/modules/teams/hooks/useTeam";
// // import { TeamWithRelations } from "@/modules/teams/types";
// // import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
// // import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
// // import React, { useEffect, useMemo, useRef, useState } from "react";

// // // تابعی برای بستن منو با کلیک بیرون از آن
// // const useClickOutside = (ref: any, handler: () => void) => {
// //   useEffect(() => {
// //     const listener = (event: MouseEvent | TouchEvent) => {
// //       if (!ref.current || ref.current.contains(event.target)) {
// //         return;
// //       }
// //       handler();
// //     };
// //     document.addEventListener("mousedown", listener);
// //     document.addEventListener("touchstart", listener);
// //     return () => {
// //       document.removeEventListener("mousedown", listener);
// //       document.removeEventListener("touchstart", listener);
// //     };
// //   }, [ref, handler]);
// // };

// // interface TaskAssignmentFilterProps {
// //   selectedProjectIds: (string | number)[];
// //   // توابع callback برای ارسال انتخاب‌ها به صفحه والد
// //   onSelectionChange: (
// //     users: WorkspaceUserWithRelations[],
// //     teams: TeamWithRelations[]
// //   ) => void;
// //   // مقادیر انتخاب شده فعلی را از والد دریافت می‌کند
// //   selectedUsers: WorkspaceUserWithRelations[];
// //   selectedTeams: TeamWithRelations[];
// // }

// // const TaskAssignmentFilter: React.FC<TaskAssignmentFilterProps> = ({
// //   selectedProjectIds,
// //   onSelectionChange,
// //   selectedUsers,
// //   selectedTeams,
// // }) => {
// //   const { activeWorkspace } = useWorkspace();
// //   const { getAll: getAllTeams } = useTeam();
// //   const { getAll: getAllWorkspaceUsers } = useWorkspaceUser();
// //   const { getAll: getAllProjects } = useProject();

// //   const [allTeams, setAllTeams] = useState<TeamWithRelations[]>([]);
// //   const [allUsers, setAllUsers] = useState<WorkspaceUserWithRelations[]>([]);
// //   const [userProjects, setUserProjects] = useState<ProjectWithRelations[]>([]);

// //   const [isOpen, setIsOpen] = useState(false);
// //   const dropdownRef = useRef(null);
// //   useClickOutside(dropdownRef, () => setIsOpen(false));

// //   const selectedUserIds = useMemo(
// //     () => selectedUsers.map((u) => u.id),
// //     [selectedUsers]
// //   );
// //   const selectedTeamIds = useMemo(
// //     () => selectedTeams.map((t) => t.id),
// //     [selectedTeams]
// //   );
// //   const totalSelected = selectedUsers.length + selectedTeams.length;

// //   useEffect(() => {
// //     getAllTeams({ page: 1, limit: 1000 }).then((res) =>
// //       setAllTeams(res.data || [])
// //     );

// //     getAllWorkspaceUsers({ page: 1, limit: 1000 }).then((res) =>
// //       setAllUsers(res.data || [])
// //     );

// //     getAllProjects({ page: 1, limit: 1000, assignedTo: "me" }).then((res) =>
// //       setUserProjects(res.data || [])
// //     );
// //   }, []);

// //   const currentUserTeams = useMemo(() => {
// //     if (!activeWorkspace?.id) return [];
// //     return allTeams.filter((team) =>
// //       team.members?.some((m) => m.workspaceUser.id === activeWorkspace.id)
// //     );
// //   }, [allTeams, activeWorkspace]);

// //   const filteredUsers = useMemo(() => {
// //     const relevantProjects =
// //       selectedProjectIds.length > 0
// //         ? userProjects.filter((p) => selectedProjectIds.includes(p.id))
// //         : userProjects;

// //     const userMap = new Map<number, WorkspaceUserWithRelations>();
// //     relevantProjects.forEach((project) => {
// //       project.assignedUsers?.forEach((u) => {
// //         if (!userMap.has(u.id)) userMap.set(u.id, u);
// //       });
// //     });
// //     return Array.from(userMap.values());
// //   }, [selectedProjectIds, userProjects]);

// //   const handleUserToggle = (user: WorkspaceUserWithRelations) => {
// //     const newSelectedUsers = selectedUserIds.includes(user.id)
// //       ? selectedUsers.filter((u) => u.id !== user.id)
// //       : [...selectedUsers, user];
// //     onSelectionChange(newSelectedUsers, selectedTeams);
// //   };

// //   const handleTeamToggle = (team: TeamWithRelations) => {
// //     const newSelectedTeams = selectedTeamIds.includes(team.id)
// //       ? selectedTeams.filter((t) => t.id !== team.id)
// //       : [...selectedTeams, team];
// //     onSelectionChange(selectedUsers, newSelectedTeams);
// //   };

// //   return (
// //     <div className="relative" ref={dropdownRef}>
// //       <button
// //         onClick={() => setIsOpen(!isOpen)}
// //         className="btn btn-outline w-full sm:w-auto md:w-52 justify-between"
// //       >
// //         <span className="font-normal">
// //           {totalSelected > 0
// //             ? `${totalSelected} مورد انتخاب شده`
// //             : "اختصاص یافته به"}
// //         </span>
// //         <DIcon icon="fa-chevron-down" className="w-3 h-3" />
// //       </button>

// //       {isOpen && (
// //         <div className="absolute top-full mt-2 z-20 w-64 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg p-2">
// //           <div className="max-h-64 overflow-y-auto">
// //             <div className="mb-2">
// //               <p className="text-xs text-gray-500 font-semibold px-2 mb-1">
// //                 تیم‌ها
// //               </p>
// //               {currentUserTeams.map((team) => (
// //                 <div
// //                   key={team.id}
// //                   className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
// //                 >
// //                   <input
// //                     type="checkbox"
// //                     id={`team-${team.id}`}
// //                     checked={selectedTeamIds.includes(team.id)}
// //                     onChange={() => handleTeamToggle(team)}
// //                     className="checkbox checkbox-sm checkbox-primary"
// //                   />
// //                   <label
// //                     htmlFor={`team-${team.id}`}
// //                     className="mr-2 text-sm cursor-pointer"
// //                   >
// //                     {team.name}
// //                   </label>
// //                 </div>
// //               ))}
// //             </div>
// //             <div>
// //               <p className="text-xs text-gray-500 font-semibold px-2 mb-1">
// //                 کاربران
// //               </p>
// //               {filteredUsers.map((u) => (
// //                 <div
// //                   key={u.id}
// //                   className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
// //                 >
// //                   <input
// //                     type="checkbox"
// //                     id={`user-${u.id}`}
// //                     checked={selectedUserIds.includes(u.id)}
// //                     onChange={() => handleUserToggle(u)}
// //                     className="checkbox checkbox-sm checkbox-primary"
// //                   />
// //                   <label
// //                     htmlFor={`user-${u.id}`}
// //                     className="mr-2 text-sm cursor-pointer"
// //                   >
// //                     {u.displayName || u.user.name}
// //                   </label>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default TaskAssignmentFilter;
