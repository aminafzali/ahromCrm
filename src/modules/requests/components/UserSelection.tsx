// مسیر فایل: src/modules/requests/components/UserSelection.tsx

"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import ButtonCreate from "@/components/ButtonCreate/ButtonCreate";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
import CreateWorkspaceUserPage from "@/modules/workspace-users/views/create/page";
import { Button, Form, Input } from "ndui-ahrom";
import { useEffect, useState } from "react";
import { z } from "zod";

interface UserSelectionProps {
  onSelect: (userId: number) => void;
}

const schema = z.object({
  search: z.string(),
});

export default function UserSelection({ onSelect }: UserSelectionProps) {
  const { getAll, loading, error } = useWorkspaceUser();
  const [members, setMembers] = useState<WorkspaceUserWithRelations[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchMembers();
  }, [searchTerm]);

  const handleSearch = (data: { search: string }) => {
    setSearchTerm(data.search);
  };

  const fetchMembers = async () => {
    try {
      const params: any = { page: 1, limit: 50 };
      if (searchTerm) {
        params.search = searchTerm;
      }
      const response = await getAll(params);
      setMembers(response.data);
    } catch (error) {
      console.error("Error fetching workspace members:", error);
    }
  };

  const handleUserSelect = (userId: number) => {
    setSelectedUserId(userId);
    onSelect(userId);
  };

  if (loading) {
    return <div className="text-center py-8">در حال بارگذاری اعضا...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        خطا در دریافت لیست اعضای ورک‌اسپیس
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <ButtonCreate
          modalTitle="دعوت عضو جدید به ورک‌اسپیس"
          modalContent={
            <CreateWorkspaceUserPage back={false} after={fetchMembers} />
          }
        >
          ایجاد عضو جدید
        </ButtonCreate>
        <Form schema={schema} onSubmit={handleSearch} className="grow">
          <div className="flex justify-start">
            <div className="flex p-2 gap-1 rounded-lg items-center">
              <div>
                <Input
                  name="search"
                  variant="primary"
                  className="bg-white"
                  placeholder="جستجوی اعضا..."
                />
              </div>
              <Button
                variant="ghost"
                type="submit"
                size="xs"
                className="h-full"
                icon={<DIcon icon="fa-search" />}
              ></Button>
            </div>
          </div>
        </Form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {members.map((member) => (
          // ===== شروع اصلاحیه کلیدی =====
          // کلید یکتای هر آیتم در لیست، شناسه سراسری کاربر (userId) است
          // که در کانتکست اعضای یک ورک‌اسپیس، منحصر به فرد می‌باشد.
          <button
            key={member.userId}
            className={`bg-white rounded-lg p-2 cursor-pointer transition-all text-right ${
              selectedUserId === member.userId
                ? "border-2 border-primary"
                : "hover:shadow-md"
            }`}
            onClick={() => handleUserSelect(member.userId)}
          >
            {/* ===== پایان اصلاحیه کلیدی ===== */}
            <div className="p-1">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">
                    {member?.user?.name || member?.name || "بدون نام"}
                  </h3>
                  <p className="text-gray-600">
                    {member?.user?.phone || member?.phone}
                  </p>
                </div>
                {selectedUserId === member.userId && (
                  <DIcon
                    icon="fa-check-circle"
                    classCustom="text-2xl text-primary"
                  />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
