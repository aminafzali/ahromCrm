// src/modules/received-devices/components/SelectRequest.tsx

"use client";

import ButtonSelectWithTable from "@/@Client/Components/common/ButtonSelectWithTable";
import { useRequest } from "@/modules/requests/hooks/useRequest";
import { columnsForUser as requestColumns } from "@/modules/requests/data/table";

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