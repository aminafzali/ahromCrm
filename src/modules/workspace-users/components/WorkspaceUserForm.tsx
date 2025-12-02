// مسیر فایل: src/modules/workspace-users/components/WorkspaceUserForm.tsx

"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { useLabel } from "@/modules/labels/hooks/useLabel";
import { useRole } from "@/modules/roles/hooks/useRole";
import { useUserGroup } from "@/modules/user-groups/hooks/useUserGroup";
import { Button, Form, Input, Select } from "ndui-ahrom";
import { useEffect, useState } from "react";
import {
  createWorkspaceUserSchema,
  updateWorkspaceUserSchema,
} from "../validation/schema";

interface WorkspaceUserFormProps {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  loading?: boolean;
  isUpdate?: boolean;
}

export default function WorkspaceUserForm({
  onSubmit,
  defaultValues = {},
  loading = false,
  isUpdate = false,
}: WorkspaceUserFormProps) {
  // States for main fields
  const [name, setName] = useState<string>(defaultValues.user?.name || "");
  const [displayName, setDisplayName] = useState<string>(
    defaultValues.displayName || ""
  );
  const [phone, setPhone] = useState<string>(defaultValues.user?.phone || "");
  const [roleId, setRoleId] = useState<number | undefined>(
    defaultValues.roleId
  );

  // ===== شروع اصلاحیه ۱: تغییر تایپ State ها به string[] =====
  const [selectedLabels, setSelectedLabels] = useState<string[]>(
    defaultValues.labels?.map((l: any) => String(l.labelId)) || []
  );
  const [selectedGroup, setSelectedGroup] = useState<string>(
    defaultValues.userGroupId ? String(defaultValues.userGroupId) : "" // تغییر به one-to-one
  );
  // ===== پایان اصلاحیه ۱ =====

  // States for fetching options
  const [roles, setRoles] = useState<{ label: string; value: number }[]>([]);
  const [labels, setLabels] = useState<{ label: string; value: number }[]>([]);
  const [groups, setGroups] = useState<{ label: string; value: number }[]>([]);

  // Hooks for fetching data
  const { getAll: getAllRoles, loading: loadingRoles } = useRole();
  const { getAll: getAllLabels, loading: loadingLabels } = useLabel();
  const { getAll: getAllGroups, loading: loadingGroups } = useUserGroup();

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [rolesRes, labelsRes, groupsRes] = await Promise.all([
          getAllRoles({ page: 1, limit: 100 }),
          getAllLabels({ page: 1, limit: 100 }),
          getAllGroups({ page: 1, limit: 100 }),
        ]);

        setRoles(
          (rolesRes?.data || []).map((role: any) => ({
            label: role.name,
            value: role.id,
          }))
        );
        setLabels(
          (labelsRes?.data || []).map((label: any) => ({
            label: label.name,
            value: label.id,
          }))
        );
        setGroups(
          (groupsRes?.data || []).map((group: any) => ({
            label: group.name,
            value: group.id,
          }))
        );
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    };
    fetchDropdownData();
  }, []);

  const handleSubmit = () => {
    // ===== شروع اصلاحیه ۳: تبدیل رشته‌ها به عدد قبل از اعتبارسنجی =====
    const dataToValidate = isUpdate
      ? {
          displayName,
          roleId,
          labels: selectedLabels.map(Number),
          userGroupId: selectedGroup ? Number(selectedGroup) : undefined, // تغییر به one-to-one
        }
      : {
          name,
          displayName,
          phone,
          roleId,
          labels: selectedLabels.map(Number),
          userGroupId: selectedGroup ? Number(selectedGroup) : undefined, // تغییر به one-to-one
        };
    // ===== پایان اصلاحیه ۳ =====

    const schema = isUpdate
      ? updateWorkspaceUserSchema
      : createWorkspaceUserSchema;
    const validation = schema.safeParse(dataToValidate);

    if (!validation.success) {
      const formattedErrors = validation.error.flatten().fieldErrors;
      setErrors(formattedErrors);
      return;
    }

    setErrors({});
    onSubmit(validation.data);
  };

  if (loadingRoles || loadingLabels || loadingGroups) return <Loading />;

  return (
    <Form
      schema={isUpdate ? updateWorkspaceUserSchema : createWorkspaceUserSchema}
      onSubmit={handleSubmit}
    >
      <div className="bg-white rounded-lg p-6 border space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!isUpdate && (
            <>
              <Input
                name="name"
                label="نام واقعی (جهت احراز هویت)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                //        onError={errors.name?.[0]}
                required
              />
              <Input
                name="phone"
                label="شماره تلفن"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                //       onError={errors.phone?.[0]}
                required
              />
            </>
          )}
          <Input
            name="displayName"
            label="نام نمایشی (در این ورک‌اسپیس)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            //    onError={errors.displayName?.[0]}
          />
          <Select
            name="roleId"
            label="نقش"
            options={roles}
            value={roleId}
            onChange={(e) => setRoleId(Number(e.target.value))}
            //     onError={errors.roleId?.[0]}
            required
          />
          <Select
            name="labels"
            label="برچسب‌ها"
            options={labels}
            value={selectedLabels} // value اکنون string[] است
            onChange={
              (e) =>
                // ===== شروع اصلاحیه ۲: عدم تبدیل به عدد در onChange =====
                setSelectedLabels(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              // ===== پایان اصلاحیه ۲ =====
            }
            multiple
            //     onError={errors.labels?.[0]}
          />
          <Select
            name="group"
            label="گروه کاربری"
            options={groups}
            value={selectedGroup} // تغییر به one-to-one
            onChange={(e) => setSelectedGroup(e.target.value)} // تغییر به one-to-one
          />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button
          type="button"
          disabled={loading}
          onClick={handleSubmit}
          icon={<DIcon icon="fa-check" cdi={false} classCustom="ml-2" />}
        >
          {loading ? "در حال ثبت..." : isUpdate ? "ویرایش عضو" : "دعوت عضو"}
        </Button>
      </div>
    </Form>
  );
}
