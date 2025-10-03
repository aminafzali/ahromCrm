// مسیر فایل: src/modules/reminders/components/RecipientSelector.tsx
"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { useLabel } from "@/modules/labels/hooks/useLabel";
import { useUserGroup } from "@/modules/user-groups/hooks/useUserGroup";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { Button, Card, Input } from "ndui-ahrom";
import { useEffect, useState } from "react";

interface RecipientSelectorProps {
  selectedUsers: any[];
  onSelectedUsersChange: (users: any[]) => void;
  autoAddedUser?: any | null; // کاربری که از بخش "موضوع" انتخاب شده
}

export default function RecipientSelector({
  selectedUsers,
  onSelectedUsersChange,
  autoAddedUser,
}: RecipientSelectorProps) {
  const { getAll: getAllUserGroups } = useUserGroup();
  const { getAll: getAllLabels } = useLabel();
  const { getAll: getAllUsers } = useWorkspaceUser();

  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [labels, setLabels] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // فیلترها
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (
      autoAddedUser &&
      !selectedUsers.find((u) => u.id === autoAddedUser.id)
    ) {
      onSelectedUsersChange([...selectedUsers, autoAddedUser]);
    }
  }, [autoAddedUser]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [ug, lb, us] = await Promise.all([
        getAllUserGroups({ page: 1, limit: 1000 }).then((r) => r.data),
        getAllLabels({ page: 1, limit: 1000 }).then((r) => r.data),
        getAllUsers({ page: 1, limit: 1000 }).then((r) => r.data),
      ]);
      setUserGroups(ug || []);
      setLabels(lb || []);
      setUsers(us || []);
    } catch (e) {
      console.error("Error loading data:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    // فیلتر جستجو
    if (searchQuery.trim()) {
      const searchText = `${user.displayName || ""} ${user.user?.name || ""} ${
        user.user?.phone || ""
      }`.toLowerCase();
      if (!searchText.includes(searchQuery.trim().toLowerCase())) return false;
    }

    // فیلتر گروه
    if (selectedGroupIds.length > 0) {
      const userGroupIds = (user.userGroups || []).map((ug: any) => ug.id);
      if (!selectedGroupIds.some((gid) => userGroupIds.includes(gid)))
        return false;
    }

    // فیلتر برچسب
    if (selectedLabelIds.length > 0) {
      const userLabelIds = (user.labels || []).map((l: any) => l.id);
      if (!selectedLabelIds.some((lid) => userLabelIds.includes(lid)))
        return false;
    }

    return true;
  });

  const toggleUser = (user: any) => {
    const exists = selectedUsers.find((u) => u.id === user.id);
    if (exists) {
      onSelectedUsersChange(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      onSelectedUsersChange([...selectedUsers, user]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // حذف همه
      const filteredIds = filteredUsers.map((u) => u.id);
      onSelectedUsersChange(
        selectedUsers.filter((u) => !filteredIds.includes(u.id))
      );
      setSelectAll(false);
    } else {
      // اضافه همه
      const newUsers = filteredUsers.filter(
        (u) => !selectedUsers.find((su) => su.id === u.id)
      );
      onSelectedUsersChange([...selectedUsers, ...newUsers]);
      setSelectAll(true);
    }
  };

  const addAllByGroups = () => {
    if (selectedGroupIds.length === 0) return;
    const groupUsers = users.filter((u) => {
      const userGroupIds = (u.userGroups || []).map((ug: any) => ug.id);
      return selectedGroupIds.some((gid) => userGroupIds.includes(gid));
    });
    const newUsers = groupUsers.filter(
      (u) => !selectedUsers.find((su) => su.id === u.id)
    );
    onSelectedUsersChange([...selectedUsers, ...newUsers]);
  };

  const addAllByLabels = () => {
    if (selectedLabelIds.length === 0) return;
    const labelUsers = users.filter((u) => {
      const userLabelIds = (u.labels || []).map((l: any) => l.id);
      return selectedLabelIds.some((lid) => userLabelIds.includes(lid));
    });
    const newUsers = labelUsers.filter(
      (u) => !selectedUsers.find((su) => su.id === u.id)
    );
    onSelectedUsersChange([...selectedUsers, ...newUsers]);
  };

  const removeUser = (userId: number) => {
    onSelectedUsersChange(selectedUsers.filter((u) => u.id !== userId));
  };

  return (
    <div className="space-y-4">
      {/* فیلترها */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* گروه‌های کاربری */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            فیلتر بر اساس گروه
          </label>
          <div className="max-h-40 overflow-y-auto border rounded p-2 bg-white">
            {userGroups.length === 0 && (
              <p className="text-sm text-gray-500">گروهی موجود نیست</p>
            )}
            {userGroups.map((group) => (
              <label key={group.id} className="flex items-center gap-2 p-1">
                <input
                  type="checkbox"
                  checked={selectedGroupIds.includes(group.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedGroupIds((prev) => [...prev, group.id]);
                    } else {
                      setSelectedGroupIds((prev) =>
                        prev.filter((id) => id !== group.id)
                      );
                    }
                  }}
                />
                <span className="text-sm">{group.name}</span>
              </label>
            ))}
          </div>
          <Button
            size="sm"
            className="mt-2 w-full"
            onClick={addAllByGroups}
            disabled={selectedGroupIds.length === 0}
          >
            افزودن همه گروه‌های انتخاب شده
          </Button>
        </div>

        {/* برچسب‌ها */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            فیلتر بر اساس برچسب
          </label>
          <div className="max-h-40 overflow-y-auto border rounded p-2 bg-white">
            {labels.length === 0 && (
              <p className="text-sm text-gray-500">برچسبی موجود نیست</p>
            )}
            {labels.map((label) => (
              <label key={label.id} className="flex items-center gap-2 p-1">
                <input
                  type="checkbox"
                  checked={selectedLabelIds.includes(label.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedLabelIds((prev) => [...prev, label.id]);
                    } else {
                      setSelectedLabelIds((prev) =>
                        prev.filter((id) => id !== label.id)
                      );
                    }
                  }}
                />
                <span className="text-sm">{label.name}</span>
              </label>
            ))}
          </div>
          <Button
            size="sm"
            className="mt-2 w-full"
            onClick={addAllByLabels}
            disabled={selectedLabelIds.length === 0}
          >
            افزودن همه برچسب‌های انتخاب شده
          </Button>
        </div>

        {/* جستجو */}
        <div>
          <Input
            name="recipientSearch"
            label="جستجو (نام / تلفن)"
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
            placeholder="نام یا تلفن کاربر..."
          />
        </div>

        {/* جدول انتخاب */}
        <div className="overflow-x-auto border rounded-lg bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="p-3 w-12 text-center">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-3 text-right font-semibold text-gray-700">
                  نام
                </th>
                <th className="p-3 text-right font-semibold text-gray-700">
                  تلفن
                </th>
                <th className="p-3 text-right font-semibold text-gray-700">
                  نقش
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    <Loading />
                  </td>
                </tr>
              )}
              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-base-content/60"
                  >
                    مخاطبی یافت نشد
                  </td>
                </tr>
              )}
              {!loading &&
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-primary"
                        checked={
                          !!selectedUsers.find((su) => su.id === user.id)
                        }
                        onChange={() => toggleUser(user)}
                      />
                    </td>
                    <td className="p-3 font-medium text-gray-900">
                      {user.displayName || user.user?.name || "نامشخص"}
                    </td>
                    <td className="p-3 text-gray-600 font-mono text-xs">
                      {user.user?.phone || "-"}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                        {user.role?.name || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* لیست مخاطبین انتخاب شده */}
      {selectedUsers.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">
              مخاطبین انتخاب شده ({selectedUsers.length})
            </h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSelectedUsersChange([])}
            >
              پاک کردن همه
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-sm"
              >
                <span>
                  {user.displayName || user.user?.name || user.user?.phone}
                </span>
                <button
                  type="button"
                  onClick={() => removeUser(user.id)}
                  className="hover:text-error"
                >
                  <DIcon icon="fa-times" cdi={false} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
