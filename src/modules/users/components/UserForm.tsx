import DIcon from "@/@Client/Components/common/DIcon";
import { Button, Form, Input } from "ndui-ahrom";
import { z } from "zod";
import { useUser } from "../hooks/useUser";
import { createUserSchema } from "../validation/schema";

export default function UserForm() {
  const { create, loading, error, success } = useUser();

  const handleSubmit = async (data: {
    name: string;
    phone: string;
    address?: string;
  }) => {
    try {
      const user: z.infer<typeof createUserSchema> = data;
      await create(user);
      // onSuccess();
    } catch (error) {
      console.error("Error creating :", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">مخاطب جدید</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <Form schema={createUserSchema} onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="name" label="نام" placeholder="نام" />
            <Input name="phone" label="شماره تماس" placeholder="شماره تماس" />
            <Input name="address" label="آدرس" placeholder="آدرس" />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              icon={<DIcon icon="fa-save" cdi={false} classCustom="ml-2" />}
            >
              {loading ? "در حال ایجاد..." : "ایجاد "}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={undefined}
              disabled={loading}
              icon={<DIcon icon="fa-times" cdi={false} classCustom="ml-2" />}
            >
              انصراف
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
