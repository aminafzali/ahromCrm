// src/modules/received-devices/views/view/update/page.tsx
"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReceivedDevice2Form from "../../../components/ReceivedDevice2Form";
import { useReceivedDevice } from "../../../hooks/useReceivedDevice";

interface UpdateReceivedDevicePageProps {
  id: number;
}

export default function UpdateInvoicePage({
  id,
}: UpdateReceivedDevicePageProps) {
  const router = useRouter();
  const {
    getById,
    update,
    submitting: loading,
    error,
    success,
    loading: dataLoading,
    statusCode,
  } = useReceivedDevice();
  const [ReceivedDeviceData, setReceivedDeviceData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const data = await getById(id);
      setReceivedDeviceData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      await update(id, data);
      router.push("/dashboard/received-devices");
    } catch (error) {
      console.error("Error updating invoice:", error);
    }
  };

  if (dataLoading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <>
      <h2 className="text-xl font-bold mb-4">ویرایش دستگاه دریافتی</h2>

      <Link href="./" className="flex justify-start items-center mb-6">
        <button className="btn btn-ghost">
          <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
          {"بازگشت"}
        </button>
      </Link>
      <ReceivedDevice2Form
        onSubmit={handleSubmit}
        defaultValues={ReceivedDeviceData}
        loading={loading}
      />
    </>
  );
}
