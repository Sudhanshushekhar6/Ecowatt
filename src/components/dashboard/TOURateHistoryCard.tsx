import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TOUData } from "@/types/user";
import { useCopilotReadable } from "@copilotkit/react-core";
import { Info } from "lucide-react";
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function TOURateHistoryCard({
  category = "DOMESTIC",
  touHistory = [],
}: {
  category: string | null;
  touHistory: TOUData[];
}) {
  const lastTou = touHistory[touHistory.length - 1];
  const averageRate =
    touHistory.reduce((sum, item) => sum + item.rate, 0) / touHistory.length;

  const getRateStatus = (rate: number) => {
    if (rate < 5) return { label: "Low", color: "bg-green-500" };
    if (rate < 10) return { label: "Moderate", color: "bg-yellow-500" };
    return { label: "High", color: "bg-red-500" };
  };

  const getRecommendation = (rate: number) => {
    const optimalRate = 5; // Set the optimal rate at ₹10 per unit
    let percentageDifference = ((rate - optimalRate) / optimalRate) * 100;

    if (rate < 5) {
      return {
        title: "Low TOU Rates",
        description:
          Math.abs(percentageDifference).toFixed(2) +
          "% lower than the optimal rate.",
        variant: "default" as "default",
      };
    }
    if (rate < 10) {
      return {
        title: "Moderate TOU Rates",
        description:
          percentageDifference.toFixed(2) + "% higher than the optimal rate.",
        variant: "default" as "default",
      };
    }
    return {
      title: "High TOU Rates",
      description:
        percentageDifference.toFixed(2) +
        "% higher than the optimal rate. Consider switching to Solar energy if available.",
      variant: "destructive" as "destructive",
    };
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active: boolean;
    payload: any;
    label: string;
  }) => {
    if (active && payload && payload.length) {
      const rate = payload[0].value;
      const status = getRateStatus(rate);
      return (
        <div className="bg-background p-3 rounded-lg shadow-lg border">
          <p className="text-sm font-medium">
            {new Date(label).toLocaleTimeString([], {
              hour12: true,
            })}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${status.color}`} />
            <p className="text-sm">
              ₹{rate.toFixed(2)}/kWh - {status.label}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!lastTou) return null;

  const recommendation = getRecommendation(lastTou.rate);
  const status = getRateStatus(lastTou.rate);

  useCopilotReadable({
    description:
      "Latest Time-Of-Use (TOU) rate history for past 24hours, including timestamp, rate, and category.",
    value: touHistory,
  });

  return (
    <Card className="w-full">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold">
            TOU Rate History
          </CardTitle>
          <Badge
            variant="outline"
            className={`${status.color} bg-opacity-10 text-foreground`}
          >
            Current: ₹{lastTou.rate.toFixed(2)}/kWh
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2">
          <span>Last 24 hours</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            Avg: ₹{averageRate.toFixed(2)}/kWh
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            {category ? `(${category.toLowerCase()})` : ""}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={touHistory}
              margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
            >
              <XAxis
                dataKey="timestamp"
                tickFormatter={(timestamp) =>
                  new Date(timestamp).toLocaleTimeString()
                }
                label={{ value: "Time", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                label={{
                  value: "Rate (₹/kWh)",
                  angle: -90,
                  position: "insideLeft",
                  offset: 15,
                }}
                domain={[0, "auto"]}
              />
              <Tooltip
                content={<CustomTooltip active={false} payload={[]} label="" />}
              />
              <ReferenceLine
                y={averageRate}
                stroke="#666"
                strokeDasharray="3 3"
              />
              <Line
                type="stepAfter"
                dataKey="rate"
                stroke="#8884d8"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <Alert variant={recommendation.variant}>
          <div className="flex gap-2">
            <Info className="h-4 w-4 mt-1" />
            <div>
              <AlertTitle className="font-bold">
                {recommendation.title}
              </AlertTitle>
              <AlertDescription>
                <p className="text-muted-foreground">
                  {recommendation.description}
                </p>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      </CardContent>
    </Card>
  );
}
