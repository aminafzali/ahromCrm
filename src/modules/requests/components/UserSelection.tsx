import DIcon from "@/@Client/Components/common/DIcon";
import ButtonCreate from "@/components/ButtonCreate/ButtonCreate";
import { useUser } from "@/modules/users/hooks/useUser";
import CreateUserPage from "@/modules/users/views/create/page";
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
  const { getAll, loading, error } = useUser();
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  const handleSearch = (data: { search: string }) => {
    setSearchTerm(data.search);
  };

  const fetchUsers = async () => {
    try {
      const params: any = { page: 1, limit: 50 };

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await getAll(params);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleUserSelect = (userId: number) => {
    setSelectedUserId(userId);
    onSelect(userId);
  };

  if (loading) {
    return <div className="text-center py-8">در حال بارگذاری...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        خطا در دریافت لیست کاربران
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <ButtonCreate
          modalTitle="ایجاد مخاطب سری"
          modalContent={<CreateUserPage back={false} after={fetchUsers} />}
        >
          ایجاد مخاطب سریع
        </ButtonCreate>
        <Form schema={schema} onSubmit={handleSearch} className="grow">
          <div className="flex justify-start">
            <div className="flex p-2 gap-1 rounded-lg items-center">
              <div>
                <Input
                  name="search"
                  variant="primary"
                  className="bg-white"
                  placeholder="جستجو کاربران ..."
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
        {users.map((user) => (
          <button
            key={user.id}
            className={`bg-white rounded-lg p-2 cursor-pointer transition-all ${
              selectedUserId === user.id
                ? "border-2 border-primary"
                : "hover:shadow-md"
            }`}
            onClick={() => handleUserSelect(user.id)}
          >
            <div className="p-1">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{user.name || "بدون نام"}</h3>
                  <p className="text-gray-600">{user.phone}</p>
                </div>
                {selectedUserId === user.id && (
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
