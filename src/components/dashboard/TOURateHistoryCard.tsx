import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TOUData } from "@/types/user";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function TOURateHistoryCard({
  touHistory,
}: {
  touHistory: TOUData[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>TOU Rate History</CardTitle>
        <CardDescription>Last 24 hours</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={touHistory}>
            <XAxis
              dataKey="timestamp"
              tickFormatter={(timestamp) =>
                new Date(timestamp).toLocaleTimeString()
              }
              label={{
                value: "Time",
                position: "insideBottom",
                offset: -5,
              }}
            />
            <YAxis
              label={{
                value: "Rate (₹/kWh)",
                angle: -90,
                position: "insideLeft",
                offset: 15,
              }}
            />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleString()}
              formatter={(value) => [
                `₹${Number(value).toFixed(2)}/kWh`,
                "Rate",
              ]}
            />
            <Line type="stepAfter" dataKey="rate" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
