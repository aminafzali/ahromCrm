import DIcon from "@/@Client/Components/common/DIcon";
import { Button, Card } from "ndui-ahrom";
import Link from "next/link";

interface RecentRequestsTableProps {
  requests: Array<any>;
}

const RecentRequestsTable = ({ requests }: RecentRequestsTableProps) => {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">درخواست‌های اخیر</h2>
        <Link href="/dashboard/requests">
          <Button variant="ghost" size="sm">
            مشاهده همه
            <DIcon icon="fa-arrow-left" cdi={false} classCustom="mr-2" />
          </Button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>شماره</th>
              <th>کاربر</th>
              <th>خدمت</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request: any) => (
              <tr key={request.id}>
                <td>#{request.id}</td>
                <td>{request.user?.name || request.user?.phone}</td>
                <td>{request.serviceType?.name}</td>
                <td>
                  <span
                    className={`badge ${
                      request.status?.name === "تکمیل شده"
                        ? "badge-success"
                        : request.status?.name === "در انتظار بررسی"
                        ? "badge-warning"
                        : "badge-info"
                    }`}
                  >
                    {request.status?.name}
                  </span>
                </td>
                <td>
                  <Link href={`/dashboard/requests/${request.id}`}>
                    <Button variant="ghost" size="sm">
                      <DIcon icon="fa-eye" cdi={false} />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default RecentRequestsTable;