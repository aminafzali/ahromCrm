"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { Button } from "ndui-ahrom";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function LoginButton() {
  const { data: session, status } = useSession();

  return (
    <div className="mb-4  md:px-4 justify-center justify-items-center content-center">
      {status === "loading" ? (
        <Button disabled>در حال بارگذاری...</Button>
      ) : session ? (
        <div className="flex items-center">
          {
            <Link href="/workspaces">
              <Button variant="ghost">
                <DIcon icon="fa-grid" />
                <h1 className=" text-teal-800">ورود به پنل</h1>
              </Button>
            </Link>
          }

          <Button
            className="mx-1"
            variant="primary"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <DIcon icon="fa-sign-out" classCustom="!text-white" />
            <h1>خروج</h1>
          </Button>
        </div>
      ) : (
        <Link href="/login" className="hover:text-primary">
          <Button>ورود / ثبت نام</Button>
        </Link>
      )}
    </div>
  );
}
