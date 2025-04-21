import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

// Define the TOUData type
interface TOUData {
  timestamp: string;
  rate: number;
  category: string;
}

// Generate sample TOU data for the last 24 hours
const generateSampleTOUData = (category: string = "DOMESTIC"): TOUData[] => {
  const data: TOUData[] = [];
  const now = new Date();
  
  // Generate data points for the last 24 hours with varying time intervals
  // This creates the step pattern seen in the screenshot
  const hours = [24, 22, 20, 19, 17, 16, 14, 12, 10, 9, 7, 5, 4, 3, 2, 1, 0];
  
  for (const i of hours) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000).toISOString();
    
    // Generate different rates based on time of day to match the pattern in the screenshot
    let rate;
    const hour = new Date(timestamp).getHours();
    
    if (hour >= 19 || hour < 5) {
      // Evening to early morning: higher rates (9-12)
      rate = 9 + (((i * 7) % 100) / 100) * 3;
    } else if (hour >= 5 && hour < 12) {
      // Morning to noon: lowest rates (3-6)
      rate = 3 + (((i * 13) % 100) / 100) * 3;
    } else {
      // Afternoon: moderate rates (5-9)
      rate = 5 + (((i * 11) % 100) / 100) * 4;
    }
    
    data.push({
      timestamp,
      rate,
      category: category.toLowerCase()
    });
  }
  
  return data;
};

// Helper function to determine energy usage suggestions based on rate
const getEnergyUsageSuggestions = (rate: number): string => {
  if (rate < 5) {
    return "Ideal time for high-consumption activities like charging EVs, running laundry machines, or air conditioning.";
  } else if (rate < 8) {
    return "Good time for moderate energy usage. Consider running dishwashers and other medium-consumption appliances.";
  } else if (rate < 10) {
    return "Try to limit high-consumption activities. Focus on necessary usage only.";
  } else {
    return "Peak rates in effect. Postpone non-essential appliance usage if possible or switch to battery backup if available.";
  }
};

export default function TOURateHistoryCard({
  category = "domestic",
  providedTOUHistory = null,
}: {
  category?: string;
  providedTOUHistory?: TOUData[] | null;
}) {
  // Always call hooks at the top level
  const [touHistory, setTouHistory] = useState<TOUData[]>([]);

  // Register data for copilot - always call this hook regardless of data state
  useCopilotReadable({
    description:
      "Latest Time-Of-Use (TOU) rate history for past 24hours, including timestamp, rate, and category.",
    value: touHistory,
  });

  // Generate data once on component mount or when inputs change
  useEffect(() => {
    if (providedTOUHistory && providedTOUHistory.length > 0) {
      setTouHistory(providedTOUHistory);
    } else {
      setTouHistory(generateSampleTOUData(category));
    }
  }, [category, providedTOUHistory]); // Only regenerate when these dependencies change

  // Handle empty touHistory safely - but after calling all hooks
  if (!touHistory || touHistory.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base font-bold">TOU Rate History</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Time-of-Use data</AlertTitle>
            <AlertDescription>
              There is no TOU rate data available for display.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const lastTou = touHistory[touHistory.length - 1];
  const averageRate =
    touHistory.reduce((sum, item) => sum + item.rate, 0) / touHistory.length;

  const getRateStatus = (rate: number) => {
    if (rate < 5) return { label: "Low", color: "bg-green-500" };
    if (rate < 10) return { label: "Moderate", color: "bg-yellow-500" };
    return { label: "High", color: "bg-red-500" };
  };

  const getRecommendation = (rate: number) => {
    const optimalRate = 5; // Set the optimal rate at ₹5 per unit
    let percentageDifference = ((rate - optimalRate) / optimalRate) * 100;
    
    if (rate < 5) {
      // For rates lower than optimal, use absolute value and format to 2 decimal places
      const formattedPercentage = Math.abs(percentageDifference).toFixed(2);
      return {
        title: "Low TOU Rates",
        description: (
          <>
            <strong>{formattedPercentage}%</strong> lower than the optimal rate.
          </>
        ),
        suggestion: getEnergyUsageSuggestions(rate),
        variant: "default" as const,
      };
    }
    if (rate < 10) {
      // For rates higher than optimal but less than 10, format to 2 decimal places
      const formattedPercentage = percentageDifference.toFixed(2);
      return {
        title: "Moderate TOU Rates",
        description: (
          <>
            <strong>{formattedPercentage}%</strong> higher than the optimal rate.
          </>
        ),
        suggestion: getEnergyUsageSuggestions(rate),
        variant: "default" as const,
      };
    }
    
    // For rates 10 or higher, format to 2 decimal places
    const formattedPercentage = percentageDifference.toFixed(2);
    return {
      title: "High TOU Rates",
      description: (
        <>
          <strong>{formattedPercentage}%</strong> higher than the optimal rate. Consider switching to Solar energy if available.
        </>
      ),
      suggestion: getEnergyUsageSuggestions(rate),
      variant: "destructive" as const,
    };
  };


  // Create custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0 && label) {
      const rate = payload[0].value;
      const status = getRateStatus(rate);
      return (
        <div className="bg-background p-2 rounded-lg shadow-lg border">
          <p className="text-sm font-medium">
            <strong>{new Date(label).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}</strong>
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

  const recommendation = getRecommendation(lastTou.rate);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-1">
          <CardTitle className="text-xl font-bold">
            TOU Rate History
          </CardTitle>
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-900 border-amber-200"
          >
            Current: ₹{lastTou.rate.toFixed(2)}/kWh
          </Badge>
        </div>
        <CardDescription className="text-gray-600 text-sm">
          Last 24 hours • Avg: ₹{averageRate.toFixed(2)}/kWh • ({category})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={touHistory}
              margin={{ top: 20, right: 10, bottom: 30, left: 30 }}
            >
              <XAxis
                dataKey="timestamp"
                tickFormatter={(timestamp) =>
                  new Date(timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })
                }
                label={{ value: "Time", position: "insideBottom", offset: 0 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                label={{
                  value: "Rate (₹/kWh)",
                  angle: -90,
                  position: "insideLeft",
                }}
                domain={[0, 'dataMax + 1']}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
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
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <Alert className="bg-white border border-gray-200 p-3">
          <div className="flex gap-2">
            <Info className="h-4 w-4 mt-1 text-gray-500" />
            <div>
              <AlertTitle className="font-bold text-base">
                {recommendation.title}
              </AlertTitle>
              <AlertDescription>
                <p className="text-gray-600 font-medium">
                  {recommendation.description}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {recommendation.suggestion}
                </p>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      </CardContent>
    </Card>
  );
}