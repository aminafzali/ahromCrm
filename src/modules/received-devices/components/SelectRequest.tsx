// src/modules/received-devices/components/SelectRequest.tsx

"use client";

import { columnsForUser as requestColumns } from "@/modules/requests/data/table";
import { useRequest } from "@/modules/requests/hooks/useRequest";
import { ButtonSelectWithTable } from "ndui-ahrom";

// این کامپوننت فقط مسئول اتصال هوک به کامپوننت UI است
export default function SelectRequest(props: any) {
  const { getAll } = useRequest();
  return (
    <ButtonSelectWithTable
      {...props}
      fetcher={getAll} // تابع واکشی داده‌ها
      columns={requestColumns} // ستون‌های جدول داخل مودال
      placeholder="یک درخواست را انتخاب کنید"
    />
  );
}
