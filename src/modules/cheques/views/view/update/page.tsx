// مسیر فایل: src/modules/cheques/views/view/update/page.tsx

"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ChequeForm from "../../../components/ChequeForm";
import { useCheque } from "../../../hooks/useCheque";
import { ChequeWithRelations } from "../../../types";

interface UpdateChequePageProps {
  id: number;
}

export default function UpdateChequePage({ id }: UpdateChequePageProps) {
  const router = useRouter();
  const { getById, update, submitting, error, loading } = useCheque();
  const [cheque, setCheque] = useState<ChequeWithRelations | null>(null);

  useEffect(() => {
    if (id) {
      fetchCheque();
    }
  }, [id]);

  const fetchCheque = async () => {
    try {
      const data = await getById(id);
      if (data) {
        setCheque(data);
      }
    } catch (error) {
      console.error("Error fetching cheque:", error);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      await update(id, data);
      router.push(`/dashboard/cheques/${id}`);
    } catch (err) {
      console.error("Error updating cheque:", err);
    }
  };

  if (loading) return <Loading />;
  if (!cheque) return <NotFound />;

  const defaultValues = {
    workspaceUser: cheque.workspaceUser,
    invoice: cheque.invoice,
    bankAccount: cheque.bankAccount,
    chequeNumber: cheque.chequeNumber,
    serial: cheque.serial,
    bankName: cheque.bankName,
    branchName: cheque.branchName,
    accountNumber: cheque.accountNumber,
    amount: cheque.amount,
    issueDate: cheque.issueDate,
    dueDate: cheque.dueDate,
    direction: cheque.direction,
    status: cheque.status,
    description: cheque.description,
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ویرایش چک</h1>
        <Link
          href={`/dashboard/cheques/${id}`}
          className="flex justify-start items-center"
        >
          <button className="btn btn-ghost">
            <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
            بازگشت به جزئیات
          </button>
        </Link>
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
