import { RequestWithRelations } from "@/modules/requests/types";

export type MonthlyStat = {
  name: string;
  درآمد: number;
  تعداد: number;
};

export type DailyStat = {
  name: string;
  تعداد: number;
};

export type ServiceStat = {
  name: string;
  تعداد: number;
};

export type DashboardStats = {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  totalUsers: number;
  recentRequests: RequestWithRelations[];
  monthlyStats: MonthlyStat[];
  dailyStats: DailyStat[];
  serviceStats: ServiceStat[];
};