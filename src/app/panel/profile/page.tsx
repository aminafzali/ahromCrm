"use client";

import { DetailPageWrapper, FormWrapper } from "@/@Client/Components/wrappers";
import { Button, Card, Input } from "ndui-ahrom";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { z } from "zod";
import DIcon from "@/@Client/Components/common/DIcon";

const profileSchema = z.object({
  name: z.string().min(2, "نام باید حداقل 2 کاراکتر باشد"),
  email: z.string().email("ایمیل نامعتبر است").optional().nullable(),
  address: z.string().optional(),
});

export default function UserProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfileDetails();
    }
  }, [session]);

  const fetchProfileDetails = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile details:", error);
      setError("خطا در دریافت اطلاعات پروفایل");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("خطا در بروزرسانی پروفایل");
      }

      setSuccess("پروفایل با موفقیت بروزرسانی شد");
      fetchProfileDetails(); // Refresh profile data
      setIsEditing(false); // Close edit form after successful update
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("خطا در بروزرسانی پروفایل");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return <div className="text-center py-8">در حال بارگذاری...</div>;
  }

  const customLabels = {
    name: "نام و نام خانوادگی",
    email: "ایمیل",
    phone: "شماره تماس",
    address: "آدرس",
    role: "نقش کاربری",
    createdAt: "تاریخ عضویت",
  };

  const customRenderers = {
    role: (role: string) => {
      const roles = {
        ADMIN: "مدیر",
        USER: "کاربر",
        TECHNICIAN: "تکنسین",
      };
      return roles[role as keyof typeof roles] || role;
    },
    createdAt: (date: string) => new Date(date).toLocaleDateString("fa-IR"),
  };

  return (
    <div className="max-w-2xl lg:mx-auto p-2">

      {!isEditing ? (
        <DetailPageWrapper
          data={profile}
          title="اطلاعات کاربری"
          customLabels={customLabels}
          customRenderers={customRenderers}
          excludeFields={["id"]}
          actionButtons={[
            {
              label: "ویرایش پروفایل",
              icon: <DIcon icon="fa-edit" cdi={false} classCustom="ml-2" />,
              onClick: () => setIsEditing(true),
              variant: "primary",
            },
          ]}
        />
      ) : (
        <Card>
          <FormWrapper
            title="ویرایش اطلاعات"
            schema={profileSchema}
            onSubmit={handleSubmit}
            defaultValues={profile}
            isLoading={loading}
            error={error}
            success={success}
            onCancel={() => setIsEditing(false)}
          >
            <Input
              name="name"
              label="نام و نام خانوادگی"
              placeholder="نام خود را وارد کنید"
            />

            <Input
              name="email"
              label="ایمیل"
              type="email"
              placeholder="ایمیل خود را وارد کنید"
            />

            <Input
              name="address"
              label="آدرس"
              placeholder="آدرس خود را وارد کنید"
            />
          </FormWrapper>
        </Card>
      )}
    </div>
  );
}
