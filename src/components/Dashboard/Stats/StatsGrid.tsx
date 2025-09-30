import StatsCard from "./StatsCard";

interface StatsGridProps {
  stats: {
    totalUsers: number;
    totalRequests: number;
    pendingRequests: number;
    completedRequests: number;
  };
}

const StatsGrid = ({ stats }: StatsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        icon="fa-users"
        iconBgColor="bg-primary/10"
        iconColor="text-primary"
        title="کل کاربران"
        value={stats.totalUsers}
      />
      <StatsCard
        icon="fa-list-check"
        iconBgColor="bg-info/10"
        iconColor="text-info"
        title="کل درخواست‌ها"
        value={stats.totalRequests}
      />
      <StatsCard
        icon="fa-clock"
        iconBgColor="bg-warning/10"
        iconColor="text-warning"
        title="در انتظار بررسی"
        value={stats.pendingRequests}
      />
      <StatsCard
        icon="fa-check"
        iconBgColor="bg-success/10"
        iconColor="text-success"
        title="تکمیل شده"
        value={stats.completedRequests}
      />
    </div>
  );
};

export default StatsGrid;