// "use client";

// import { Button } from "ndui-ahrom";
// import Link from "next/link";

// export default function UserDashboardPage() {
//   return (
//     <div>
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">داشبورد</h1>
//         <Link href="/panel/requests/create">
//           <Button>درخواست جدید</Button>
//         </Link>
//       </div>
//     </div>
//   );
// }

"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { useRequest } from "@/modules/requests/hooks/useRequest";
import { Button, Card } from "ndui-ahrom";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function UserDashboardPage() {
  const { getAll: getRequests } = useRequest();
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    recentRequests: [],
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const requestsData = await getRequests();

      setStats({
        totalRequests: requestsData.pagination.total,
        pendingRequests: requestsData.data.filter(
          (r: any) => r.status?.name === "در انتظار بررسی"
        ).length,
        completedRequests: requestsData.data.filter(
          (r: any) => r.status?.name === "تکمیل شده"
        ).length,
        recentRequests: requestsData.data as [],
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-info/10 rounded-full">
              <DIcon
                icon="fa-list-check"
                cdi={false}
                classCustom="text-2xl text-info"
              />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">کل درخواست‌ها</p>
              <h3 className="text-2xl font-bold">{stats.totalRequests}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-warning/10 rounded-full">
              <DIcon
                icon="fa-clock"
                cdi={false}
                classCustom="text-2xl text-warning"
              />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">در انتظار بررسی</p>
              <h3 className="text-2xl font-bold">{stats.pendingRequests}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-success/10 rounded-full">
              <DIcon
                icon="fa-check"
                cdi={false}
                classCustom="text-2xl text-success"
              />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">تکمیل شده</p>
              <h3 className="text-2xl font-bold">{stats.completedRequests}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-4 lg:p-6">
        <h2 className="text-lg font-bold mb-2">دسترسی سریع</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <Link href="/panel/requests/create">
            <Button
              variant="ghost"
              className="w-full h-24 flex flex-col items-center justify-center gap-4"
            >
              <DIcon icon="fa-plus" cdi={false} classCustom="text-2xl" />
              <span>درخواست جدید</span>
            </Button>
          </Link>
          <Link href="/panel/requests">
            <Button
              variant="ghost"
              className="w-full h-24 flex flex-col items-center justify-center gap-4"
            >
              <DIcon icon="fa-hand" cdi={false} classCustom="text-2xl" />
              <span>لیست درخواست ها</span>
            </Button>
          </Link>

          <Link href="/panel/profile">
            <Button
              variant="ghost"
              className="w-full h-24 flex flex-col items-center justify-center gap-4"
            >
              <DIcon icon="fa-user" cdi={false} classCustom="text-2xl" />
              <span>پروفایل</span>
            </Button>
          </Link>

          <Link href="/panel/notifications">
            <Button
              variant="ghost"
              className="w-full h-24 flex flex-col items-center justify-center gap-4"
            >
              <DIcon icon="fa-bell" cdi={false} classCustom="text-2xl" />
              <span>اعلان‌ها</span>
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recent Requests */}
      {/* <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">درخواست‌های اخیر</h2>
          <Link href="/panel/requests">
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
                <th>خدمت</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentRequests.map((request: any) => (
                <tr key={request.id}>
                  <td>#{request.id}</td>
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
                    <Link href={`/panel/requests/${request.id}`}>
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
      </Card> */}
    </div>
  );
}
