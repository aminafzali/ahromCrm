"use client"; // Add this to enable client-side rendering

import { Button } from "ndui-ahrom";
import Link from "next/link";
import DIcon from "../../@Client/Components/common/DIcon";

export default function UserDemo() {
  return (
    <div className="mt-2 bg-white rounded-lg border-2 !p-4 !py-6 w-full max-w-md flex flex-col !gap-2">
      <label htmlFor="requestId" className="block text-lg">
        <DIcon icon="fa-hand " classCustom="!ml-2"></DIcon>
        دمو پنل کاربر
      </label>

      <p className=" text-md">
        این نسخه دمو است برای دیدن پنل بر روی دکمه زیر بزنید
      </p>

      <Link href="/dashboard">
        <Button
          size="md"
          icon={
            <DIcon icon="fa-hand" cdi={false} classCustom="!ml-2  text-2xl" />
          }
          className="w-full"
        >
          ورود به دمو
        </Button>
      </Link>
    </div>
  );
}
