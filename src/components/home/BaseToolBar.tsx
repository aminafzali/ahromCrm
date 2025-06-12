"use client";

import { Button, Toolbar } from "ndui-ahrom";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import DIcon from "../../@Client/Components/common/DIcon";
import LogoWithTitle from "../../@Client/Components/common/LogoWithTitle";

export default function BaseToolBar() {
  const { data: session, status } = useSession();

  return (
    <Toolbar elevated={false} className="mb-4  md:px-4 border-b-2">
      <div className="flex-1">
        <LogoWithTitle />
      </div>

      {status === "loading" ? (
        <Button disabled>در حال بارگذاری...</Button>
      ) : session ? (
        <div className="flex items-center">
          {session.user.role === "ADMIN" ? (
            <Link href="/dashboard">
              <Button variant="ghost">
                <DIcon icon="fa-grid" />
              </Button>
            </Link>
          ) : (
            <Link href="/panel">
              <Button variant="ghost">
                <DIcon icon="fa-user" />
              </Button>
            </Link>
          )}

          <Button
            className="mx-1"
            variant="primary"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <DIcon icon="fa-sign-out" classCustom="!text-white" />
          </Button>
        </div>
      ) : (
        <Link href="/login" className="hover:text-primary">
          <Button>ورود / ثبت نام</Button>
        </Link>
      )}
    </Toolbar>
  );
}
