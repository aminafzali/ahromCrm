// // مسیر فایل: src/modules/workspace-users/views/view/update/page.tsx

// "use client";
// import UpdateWrapper from "@/@Client/Components/wrappers/V2/UpdateWrapper";
// import { RoleRepository } from "@/modules/roles/repo/RoleRepository";
// import { WorkspaceUserRepository } from "@/modules/workspace-users/repo/WorkspaceUserRepository";
// import { useParams } from "next/navigation";
// import { getUpdateFormConfig } from "../../../data/form";
// import { useWorkspaceUser } from "../../../hooks/useWorkspaceUser";

// const UpdateWorkspaceUserPage = () => {
//   const hook = useWorkspaceUser();
//   const params = useParams();
//   const id = parseInt(params.id as string);
//   const roleRepo = new RoleRepository();

//   const getData = async () => {
//     const rolesData = await roleRepo.getAll({ page: 1, limit: 100 });
//     const roles = rolesData.data.map((role: any) => ({
//       label: role.name,
//       value: role.id,
//     }));

//     const dataMap = new Map<string, any>();
//     dataMap.set("roles", roles);

//     return dataMap;
//   };
//   // TODO: نیاز به اصلاحات اساسی دارد
//   return (
//     <UpdateWrapper
//       //  id={id}
//       //  hook={hook}
//       title="ویرایش نقش عضو"
//       //  getData={getData}
//       formConfig={getUpdateFormConfig}
//       repo={new WorkspaceUserRepository()}
//       //back="/dashboard/workspace-users"
//     />
//   );
// };

// export default UpdateWorkspaceUserPage;
