import { Card } from "ndui-ahrom";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DailyChartProps {
  data: Array<{
    name: string;
    تعداد: number;
  }>;
}

const DailyChart = ({ data }: DailyChartProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold mb-4">درخواست‌های روزانه</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="تعداد"
            stroke="#00796B"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default DailyChart;