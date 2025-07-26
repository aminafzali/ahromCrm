// // مسیر فایل: src/modules/workspace-users/components/WorkspaceUserForm.tsx

// "use client";

// import DIcon from "@/@Client/Components/common/DIcon";
// import Loading from "@/@Client/Components/common/Loading";
// import { useRole } from "@/modules/roles/hooks/useRole";
// import { Button, Form, Input, Select } from "ndui-ahrom";
// import { useEffect, useState } from "react";
// import {
//   createWorkspaceUserSchema,
//   updateWorkspaceUserSchema,
// } from "../validation/schema";

// interface WorkspaceUserFormProps {
//   onSubmit: (data: any) => void;
//   defaultValues?: any;
//   loading?: boolean;
//   isUpdate?: boolean; // برای تشخیص حالت ویرایش
// }

// export default function WorkspaceUserForm({
//   onSubmit,
//   defaultValues = {},
//   loading = false,
//   isUpdate = false,
// }: WorkspaceUserFormProps) {
//   const [name, setName] = useState<string>(defaultValues.user?.name || "");
//   const [phone, setPhone] = useState<string>(defaultValues.user?.phone || "");
//   const [roleId, setRoleId] = useState<number | undefined>(
//     defaultValues.roleId
//   );

//   const [roles, setRoles] = useState<{ label: string; value: number }[]>([]);
//   const { getAll: getAllRoles, loading: loadingRoles } = useRole();

//   const [errors, setErrors] = useState<any>({});

//   // واکشی لیست نقش‌ها برای نمایش در فیلد select
//   useEffect(() => {
//     const fetchRoles = async () => {
//       try {
//         const rolesRes = await getAllRoles({ page: 1, limit: 100 });
//         const roleOptions = (rolesRes?.data || []).map((role: any) => ({
//           label: role.name,
//           value: role.id,
//         }));
//         setRoles(roleOptions);
//       } catch (error) {
//         console.error("Error fetching roles:", error);
//       }
//     };
//     fetchRoles();
//   }, []);

//   const handleSubmit = () => {
//     const dataToValidate = isUpdate ? { roleId } : { name, phone, roleId };
//     const schema = isUpdate
//       ? updateWorkspaceUserSchema
//       : createWorkspaceUserSchema;

//     const validation = schema.safeParse(dataToValidate);

//     if (!validation.success) {
//       const formattedErrors = validation.error.flatten().fieldErrors;
//       setErrors(formattedErrors);
//       return;
//     }

//     setErrors({});
//     onSubmit(validation.data);
//   };

//   if (loadingRoles) return <Loading />;

//   return (
//     <Form
//       schema={isUpdate ? updateWorkspaceUserSchema : createWorkspaceUserSchema}
//       onSubmit={handleSubmit}
//     >
//       <div className="bg-white rounded-lg p-4 border space-y-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {!isUpdate && (
//             <>
//               <Input
//                 name="name"
//                 label="نام نمایشی"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//      //           error={errors.name?.[0]}
//                 required
//               />
//               <Input
//                 name="phone"
//                 label="شماره تلفن"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//        //         error={errors.phone?.[0]}
//                 required
//               />
//             </>
//           )}
//           <Select
//             name="roleId"
//             label="نقش"
//             options={roles}
//             value={roleId}
//             onChange={(e) => setRoleId(Number(e.target.value))}
//        //     error={errors.roleId?.[0]}
//             required
//           />
//         </div>
//       </div>

//       <div className="flex justify-end mt-6">
//         <Button
//           type="button"
//           disabled={loading}
//           onClick={handleSubmit}
//           icon={<DIcon icon="fa-check" cdi={false} classCustom="ml-2" />}
//         >
//           {loading ? "در حال ثبت..." : isUpdate ? "ویرایش عضو" : "دعوت عضو"}
//         </Button>
//       </div>
//     </Form>
//   );
// }
