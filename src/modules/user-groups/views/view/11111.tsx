// import Loading from "@/@Client/Components/common/Loading";
// import NotFound from "@/@Client/Components/common/NotFound";
// import { DetailPageWrapper } from "@/@Client/Components/wrappers";
// import { Button, Card, Select } from "ndui-ahrom";
// import { useEffect, useState } from "react";
// import { z } from "zod";
// import { useUserGroup } from "../../hooks/useUserGroup";
// import { UserGroupWithRelations } from "../../types";

// interface UserGroupDetailsViewProps {
//   id: number;
//   isAdmin: boolean;
//   backUrl: string;
// }

// const addUsersSchema = z.object({
//   userIds: z.array(z.string()),
// });

// export default function DetailPage({ id }: UserGroupDetailsViewProps) {
//   const {
//     getById,
//     update,
//     loading,
//     error,
//     success,
//     loading: dataLoading,
//     statusCode,
//   } = useUserGroup();
//   const [userGroup, setUserGroup] = useState<UserGroupWithRelations>(
//     {} as UserGroupWithRelations
//   );
//   const [users, setUsers] = useState<any[]>([]);
//   const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

//   useEffect(() => {
//     if (id) {
//       fetchUserGroupDetails();
//       fetchUsers();
//     }
//   }, [id]);

//   const fetchUserGroupDetails = async () => {
//     try {
//       const data = await getById(id);
//       setUserGroup(data);
//     } catch (error) {
//       console.error("Error fetching user group details:", error);
//     }
//   };

//   const fetchUsers = async () => {
//     try {
//       const response = await fetch("/api/users");
//       const data = await response.json();
//       setUsers(data.data || []);
//     } catch (error) {
//       console.error("Error fetching users:", error);
//     }
//   };

//   const handleAddUsers = async () => {
//     try {
//       const userIds = selectedUsers.map((id) => parseInt(id));
//       await update(id, {
//         ...userGroup,
//         userIds,
//       });
//       fetchUserGroupDetails(); // Refresh data
//     } catch (error) {
//       console.error("Error adding users:", error);
//     }
//   };

//   if (dataLoading) return <Loading />;
//   if (statusCode === 404) return <NotFound />;

//   return (
//     <div className="space-y-6">
//       <DetailPageWrapper
//         data={userGroup}
//         title="گروه کاربری"
//         excludeFields={["id", "createdAt"]}
//         loading={loading}
//         error={error}
//         success={success}
//       />

//       <Card>
//         <div className="p-6">
//           <h2 className="text-xl font-semibold mb-4">افزودن کاربر به گروه</h2>
//           <div className="space-y-4">
//             <Select
//               name="userIds"
//               label="انتخاب کاربران"
//               multiple
//               options={users.map((user) => ({
//                 value: user.id.toString(),
//                 label: user.name || user.phone,
//               }))}
//               onChange={(e: any) =>
//                 setSelectedUsers(
//                   Array.from(e.target.selectedOptions, (option) => option.value)
//                 )
//               }
//             />
//             <Button
//               onClick={handleAddUsers}
//               disabled={selectedUsers.length === 0}
//             >
//               افزودن کاربران
//             </Button>
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// }
