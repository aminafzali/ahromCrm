import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import StatusBadge from "@/@Client/Components/common/StatusBadge";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import { DetailWrapper } from "@/@Client/Components/wrappers";
import { Button } from "ndui-ahrom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCheque } from "../../hooks/useCheque";
import { ChequeWithRelations } from "../../types";

interface ChequeDetailsViewProps {
  id: number;
  isAdmin: boolean;
  backUrl: string;
}

export default function DetailPage({ id, isAdmin }: ChequeDetailsViewProps) {
  const router = useRouter();
  const {
    getById,
    loading,
    error,
    success,
    loading: dataLoading,
    statusCode,
  } = useCheque();
  const [cheque, setCheque] = useState<ChequeWithRelations>(
    {} as ChequeWithRelations
  );

  useEffect(() => {
    if (id) {
      fetchChequeDetails();
    }
  }, [id]);

  const fetchChequeDetails = async () => {
    try {
      const data = await getById(id);
      if (data != undefined) setCheque(data);
    } catch (error) {
      console.error("Error fetching cheque details:", error);
    }
  };

  const customRenderers = {
    amount: (value: number) => `${value.toLocaleString()} تومان`,
    direction: (value: string) => {
      const directions = {
        INCOMING: "دریافتی",
        OUTGOING: "پرداختی",
      };
      return directions[value] || value;
    },
    status: (value: string) => <StatusBadge status={value} />,
    issueDate: (value: string) => <DateDisplay date={value} />,
    dueDate: (value: string) => {
      const isOverdue = new Date(value) < new Date() && cheque.status !== "CLEARED" && cheque.status !== "CANCELLED";
      return (
        <div className="flex items-center gap-2">
          <DateDisplay date={value} />
          {isOverdue && (
            <span className="badge badge-error badge-sm">عقب‌افتاده</span>
          )}
        </div>
      );
    },
    invoice: (value: any) =>
      value ? (
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-semibold">شماره فاکتور: {value.id}</p>
            <p className="text-gray-600">مبلغ: {value.total.toLocaleString()} تومان</p>
          </div>
          <Link href={`/dashboard/invoices/${value.id}`}>
            <button className="btn btn-ghost btn-sm">
              <DIcon icon="fa-eye" cdi={false} classCustom="ml-2" />
              مشاهده فاکتور
            </button>
          </Link>
        </div>
      ) : (
        "بدون فاکتور"
      ),
    payment: (value: any) =>
      value ? (
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-semibold">شماره پرداخت: {value.id}</p>
            <p className="text-gray-600">مبلغ: {value.amount.toLocaleString()} تومان</p>
          </div>
          <Link href={`/dashboard/payments/${value.id}`}>
            <button className="btn btn-ghost btn-sm">
              <DIcon icon="fa-eye" cdi={false} classCustom="ml-2" />
              مشاهده پرداخت
            </button>
          </Link>
        </div>
      ) : (
        "بدون پرداخت مرتبط"
      ),
    bankAccount: (value: any) =>
      value ? (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="font-semibold">{value.title}</p>
          {value.bankName && (
            <p className="text-sm text-gray-600">بانک: {value.bankName}</p>
          )}
          {value.cardNumber && (
            <p className="text-sm text-gray-600">کارت: {value.cardNumber}</p>
          )}
          {value.accountNumber && (
            <p className="text-sm text-gray-600">حساب: {value.accountNumber}</p>
          )}
          {value.iban && (
            <p className="text-sm text-gray-600">شبا: {value.iban}</p>
          )}
        </div>
      ) : (
        "-"
      ),
    workspaceUser: (value: any) =>
      value ? (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="font-semibold">{value.displayName || "نامشخص"}</p>
          {value.phone && (
            <p className="text-sm text-gray-600">تلفن: {value.phone}</p>
          )}
        </div>
      ) : (
        "-"
      ),
  };

  if (dataLoading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">جزئیات چک</h1>
        <div className="flex gap-2">
          <Link href={`/dashboard/cheques/${id}/update`}>
            <Button variant="outline" size="sm">
              <DIcon icon="fa-edit" cdi={false} classCustom="ml-2" />
              ویرایش
            </Button>
          </Link>
          <Link href={`/dashboard/cheques/${id}/reminders`}>
            <Button variant="outline" size="sm">
              <DIcon icon="fa-bell" cdi={false} classCustom="ml-2" />
              یادآورها
            </Button>
          </Link>
        </div>
      </div>

      <DetailWrapper
        data={cheque}
        title=""
        excludeFields={["id", "createdAt", "updatedAt", "reminders"]}
        loading={loading}
        error={error}
        success={success}
        customRenderers={customRenderers}
        showDefaultActions={false}
      />

      {/* بخش یادآورها */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">یادآورهای مرتبط</h2>
          <Link href={`/dashboard/reminders/create?entityType=CHEQUE&entityId=${id}`}>
            <Button variant="outline" size="sm">
              <DIcon icon="fa-plus" cdi={false} classCustom="ml-2" />
              افزودن یادآور
            </Button>
          </Link>
        </div>
        <p className="text-sm text-gray-500">
          برای مشاهده و مدیریت یادآورهای این چک، به بخش یادآورها مراجعه کنید.
        </p>
      </div>
    </div>
  );
}

