"use client";

import DailyChart from "@/components/Dashboard/Charts/DailyChart";
import MonthlyChart from "@/components/Dashboard/Charts/MonthlyChart";
import ServiceChart from "@/components/Dashboard/Charts/ServiceChart";
import RecentRequestsTable from "@/components/Dashboard/RecentRequests/RecentRequestsTable";
import StatsGrid from "@/components/Dashboard/Stats/StatsGrid";
//import { useRequest } from "@/modules/requests/hooks/useRequest";
//import { useUser } from "@/modules/users/hooks/useUser";
import { DashboardStats } from "@/types/stat";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  // const { getAll: getRequests } = useRequest();
  // const { getAll: getUsers } = useUser();
  //
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    totalUsers: 0,
    recentRequests: [],
    monthlyStats: [],
    dailyStats: [],
    serviceStats: [],
  });

  useEffect(() => {
    // fetchStats();
  }, []);

  // const fetchStats = async () => {
  //   try {
  //     const [requestsData, usersData] = await Promise.all([
  //       getRequests(),
  //       getUsers(),
  //     ]);

  //     const monthlyStats = [
  //       { name: "فروردین", درآمد: 4000, تعداد: 24 },
  //       { name: "اردیبهشت", درآمد: 3000, تعداد: 13 },
  //       { name: "خرداد", درآمد: 2000, تعداد: 18 },
  //       { name: "تیر", درآمد: 2780, تعداد: 39 },
  //       { name: "مرداد", درآمد: 1890, تعداد: 48 },
  //       { name: "شهریور", درآمد: 2390, تعداد: 38 },
  //     ];

  //     const dailyStats = [
  //       { name: "شنبه", تعداد: 4 },
  //       { name: "یکشنبه", تعداد: 3 },
  //       { name: "دوشنبه", تعداد: 2 },
  //       { name: "سه‌شنبه", تعداد: 7 },
  //       { name: "چهارشنبه", تعداد: 5 },
  //       { name: "پنج‌شنبه", تعداد: 3 },
  //       { name: "جمعه", تعداد: 2 },
  //     ];

  //     const serviceStats = [
  //       { name: "تعمیر یخچال", تعداد: 40 },
  //       { name: "تعمیر لباسشویی", تعداد: 30 },
  //       { name: "تعمیر کولر", تعداد: 20 },
  //       { name: "تعمیر تلویزیون", تعداد: 27 },
  //       { name: "تعمیر ظرفشویی", تعداد: 18 },
  //     ];

  //     setStats({
  //       totalRequests: requestsData.pagination.total,
  //       pendingRequests: requestsData.data.filter(
  //         (r: any) => r.status?.name === "در انتظار بررسی"
  //       ).length,
  //       completedRequests: requestsData.data.filter(
  //         (r: any) => r.status?.name === "تکمیل شده"
  //       ).length,
  //       totalUsers: usersData.pagination.total,
  //       recentRequests: requestsData.data,
  //       monthlyStats,
  //       dailyStats,
  //       serviceStats,
  //     });
  //   } catch (error) {
  //     console.error("Error fetching stats:", error);
  //   }
  // };

  return (
    <div className="space-y-6">
      <StatsGrid
        stats={{
          totalUsers: stats?.totalUsers,
          totalRequests: stats?.totalRequests,
          pendingRequests: stats?.pendingRequests,
          completedRequests: stats?.completedRequests,
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyChart data={stats?.monthlyStats} />
        <DailyChart data={stats?.dailyStats} />
        <ServiceChart data={stats?.serviceStats} />
        <RecentRequestsTable requests={stats?.recentRequests} />
      </div>
    </div>
  );
}
