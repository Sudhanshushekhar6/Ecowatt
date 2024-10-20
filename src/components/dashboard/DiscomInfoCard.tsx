import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Discom } from "@/types/discom";
import { DollarSign, Percent, Users, Zap } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DiscomInfoCard = ({ discomInfo }: { discomInfo: Discom | null }) => {
  if (!discomInfo) return null;

  const chartData = [
    {
      name: "Avg Power Purchase Cost",
      value: parseFloat(discomInfo["Average power purchase cost (Rs./kWh)"]),
    },
    {
      name: "Avg Cost of Supply",
      value: parseFloat(discomInfo["Average Cost of Supply (Rs./kWh)"]),
    },
    {
      name: "Avg Billing Rate",
      value: parseFloat(discomInfo["Average Billing Rate (Rs./kWh)"]),
    },
  ];

  return (
    <Card className="w-full text-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-lg font-bold">
          {discomInfo.DISCOM}
        </CardTitle>
        <CardDescription>{discomInfo.State}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span className="font-semibold">Total Consumers:</span>
              <span>
                {discomInfo["Total Number of consumers (Millions)"]} Million
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span className="font-semibold">Total Electricity Sales:</span>
              <span>{discomInfo["Total Electricity Sales (MU)"]} MU</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span className="font-semibold">Total Revenue:</span>
              <span>₹{discomInfo["Total Revenue (Rs. Crore)"]} Crore</span>
            </div>
            <div className="flex items-center space-x-2">
              <Percent className="h-5 w-5" />
              <span className="font-semibold">AT&C Losses:</span>
              <span>{discomInfo["AT&C Losses (%)"]}%</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" unit=" Rs/kWh" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscomInfoCard;
