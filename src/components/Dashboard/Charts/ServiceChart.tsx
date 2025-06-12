import { Card } from "ndui-ahrom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ServiceChartProps {
  data: Array<{
    name: string;
    تعداد: number;
  }>;
}

const ServiceChart = ({ data }: ServiceChartProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold mb-4">توزیع خدمات</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="تعداد" fill="#00796B" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default ServiceChart;