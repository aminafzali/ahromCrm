import DIcon from "@/@Client/Components/common/DIcon";
import { Button, Card } from "ndui-ahrom";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRequest } from "../hooks/useRequest";
import { RequestWithRelations } from "../types";

interface RequestDetailsProps {
  id: number;
  isAdmin?: boolean;
}

export default function RequestDetails({
  id,
  isAdmin = false,
}: RequestDetailsProps) {
  const { getById, loading, error } = useRequest();
  const [request, setRequest] = useState<RequestWithRelations | null>(null);

  useEffect(() => {
    if (id) {
      fetchRequestDetails();
    }
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      const data = await getById(id);
    if (data != undefined)   setRequest(data);
    } catch (error) {
      console.error("Error fetching request details:", error);
    }
  };

  if (loading && !request) {
    return <div className="text-center py-8">در حال بارگذاری...</div>;
  }

  if (error || !request) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error || "درخواست یافت نشد"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {request.invoice && (
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold mb-2">اطلاعات فاکتور</h3>
              <p>
                <strong>شماره فاکتور:</strong> {request.invoice.id}
              </p>
              <p>
                <strong>مبلغ کل:</strong>{" "}
                {request.invoice.total.toLocaleString()} تومان
              </p>
              <p>
                <strong>وضعیت:</strong> {request.invoice.status}
              </p>
            </div>
            <Link href={`/dashboard/invoices/${request.invoice.id}`}>
              <Button
                variant="ghost"
                icon={<DIcon icon="fa-eye" cdi={false} classCustom="ml-2" />}
              >
                مشاهده فاکتور
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Rest of request details */}
    </div>
  );
}