// src/modules/received-devices/views/create/page.tsx

"use client";

import { CreatePageProps } from "@/@Client/types/crud";
import ReceivedDeviceForm from "../../components/ReceivedDeviceForm";

export default function CreateReceivedDevicePage({ after }: CreatePageProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">ثبت دستگاه دریافتی جدید</h1>
      </div>
      <ReceivedDeviceForm afterSubmit={after} />
    </div>
  );
}
