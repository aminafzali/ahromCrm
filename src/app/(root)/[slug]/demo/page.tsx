"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { Button } from "ndui-ahrom";
import { signIn } from "next-auth/react";

export default function DemoPage() {
  const handleAdminLogin = async () => {
    const response = await fetch("/api/auth/verify-pass", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone: "09110000000", password: "admin123" }),
    });

    const result = await response.json();

    if (!response.ok) {
    } else {
      // Sign in with NextAuth using the verified token
      const signInResult = await signIn("credentials", {
        redirect: true,
        callbackUrl: "/dashboard",
        phone: "09110000000",
        token: result.token,
      });
    }
  };

  const handleUserLogin = async () => {
    const response = await fetch("/api/auth/verify-pass", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone: "09350000000", password: "user123" }),
    });

    const result = await response.json();

    if (!response.ok) {
    } else {
      // Sign in with NextAuth using the verified token
      const signInResult = await signIn("credentials", {
        redirect: true,
        callbackUrl: "/panel",
        phone: "09350000000",
        token: result.token,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="max-w-md w-full space-y-8 p-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold">ورود به نسخه دمو</h2>
          <p className="mt-2 text-gray-600">
            برای مشاهده دمو یکی از گزینه‌های زیر را انتخاب کنید
          </p>
        </div>

        <div className="grid gap-4">
          <div className="bg-white border-2 rounded-lg p-4">
            <h3 className="text-xl font-bold mb-4">پنل مدیریت</h3>
            <p className="text-gray-600 mb-4">
              دسترسی به تمام امکانات مدیریتی سیستم
            </p>
            <Button
              onClick={handleAdminLogin}
              className="w-full"
              icon={<DIcon icon="fa-user-tie" cdi={false} classCustom="ml-2" />}
            >
              ورود به پنل مدیر
            </Button>
          </div>

          <div className="bg-white border-2 rounded-lg p-4">
            <h3 className="text-xl font-bold mb-4">پنل کاربری</h3>
            <p className="text-gray-600 mb-4">
              دسترسی به امکانات مخصوص کاربران عادی
            </p>
            <Button
              onClick={handleUserLogin}
              className="w-full"
              icon={<DIcon icon="fa-user" cdi={false} classCustom="ml-2" />}
            >
              ورود به پنل کاربر
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
