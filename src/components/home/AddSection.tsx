"use client"; // Add this to enable client-side rendering

import { Button } from "ndui-ahrom";
import Link from "next/link";
import DIcon from "../../@Client/Components/common/DIcon";

export default function AddSection() {
  return (
    <div className="bg-white rounded-lg border-2 !p-4 !py-6 w-full max-w-md flex flex-col justify-between !gap-2">
      <label htmlFor="requestId" className="block font-bold text-lg">
        <DIcon icon="fa-hand " classCustom="!ml-2"></DIcon>
        به چه خدمتی نیاز داری؟
      </label>
      {/* <p className="text-md font-semibold">به چه خدمتی نیاز داری؟</p> */}

      <p className=" text-md gray-500">خدمت مورد نیاز خود را سریع ثبت کن</p>

      <Link href="/request" className="mt-2">
        <Button
          size="md"
          icon={
            <DIcon icon="fa-hand" cdi={false} classCustom="!ml-2  text-2xl" />
          }
          className="w-full"
        >
          ثبت درخواست جدید
        </Button>
      </Link>
    </div>
  );
}
