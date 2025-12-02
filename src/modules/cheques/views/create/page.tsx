// مسیر فایل: src/modules/cheques/views/create/page.tsx

"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { CreatePageProps } from "@/@Client/types/crud";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ChequeForm from "../../components/ChequeForm";
import { useCheque } from "../../hooks/useCheque";

export default function CreateChequePage({
  back = true,
  defaultValues,
  after,
}: CreatePageProps) {
  const router = useRouter();
  const { create, submitting, error } = useCheque();

  const handleSubmit = async (data: any) => {
    try {
      await create(data);
      if (after) {
        after();
      } else {
        router.push("/dashboard/cheques");
      }
    } catch (err) {
      console.error("Error creating cheque:", err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ثبت چک جدید</h1>
        {back && (
          <Link
            href="/dashboard/cheques"
            className="flex justify-start items-center"
          >
            <button className="btn btn-ghost">
              <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
              بازگشت به لیست چک‌ها
            </button>
          </Link>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <ChequeForm
        onSubmit={handleSubmit}
        loading={submitting}
        defaultValues={defaultValues}
      />
    </div>
  );
}
