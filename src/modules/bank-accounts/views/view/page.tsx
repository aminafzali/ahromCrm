"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useBankAccount } from "../../hooks/useBankAccount";
import { BankAccountWithRelations } from "../../types";

export default function DetailPage() {
  const params = useParams() as { id?: string };
  const id = parseInt(params.id as string);
  const { getById, loading, error, success, statusCode, remove } =
    useBankAccount();
  const [account, setAccount] = useState<BankAccountWithRelations | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  const fetchDetails = async () => {
    try {
      const data = await getById(id);
      if (data) setAccount(data);
    } catch (err) {
      console.error("Error fetching bank account details:", err);
    }
  };

  const handleDelete = async (row: any) => {
    try {
      await remove(row.id);
      router.push("/dashboard/bank-accounts");
    } catch (err) {
      console.error("Error deleting bank account:", err);
    }
  };

  const displayData = account
    ? {
        "نام حساب بانکی": account.title,
        بانک: account.bankName || "-",
        "شماره کارت": account.cardNumber || "-",
        "شماره حساب": account.accountNumber || "-",
        "شماره شبا": account.iban || "-",
        "مخاطب (صاحب حساب)":
          account.workspaceUser?.displayName ||
          account.workspaceUser?.user?.name ||
          account.workspaceUser?.user?.phone ||
          "-",
        "پیش‌فرض دریافتی‌ها": account.isDefaultForReceive ? "بله" : "خیر",
        "پیش‌فرض پرداختی‌ها": account.isDefaultForPay ? "بله" : "خیر",
      }
    : {};

  if (loading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <DetailPageWrapper
      data={displayData}
      title="جزئیات حساب بانکی"
      loading={loading}
      error={error}
      success={success}
      onDelete={() => handleDelete(account)}
      editUrl={`/dashboard/bank-accounts/${id}/update`}
    />
  );
}
