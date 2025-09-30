import { Card } from "ndui-ahrom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MonthlyChartProps {
  data: Array<{
    name: string;
    درآمد: number;
    تعداد: number;
  }>;
}

const MonthlyChart = ({ data }: MonthlyChartProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold mb-4">آمار ماهانه</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="درآمد"
            stroke="#00796B"
            fill="#00796B"
            fillOpacity={0.3}
          />
          <Area
            type="monotone"
            dataKey="تعداد"
            stroke="#64B5F6"
            fill="#64B5F6"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default MonthlyChart;