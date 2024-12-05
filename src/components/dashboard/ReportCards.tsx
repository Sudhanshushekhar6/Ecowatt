import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ConsumptionAnalytics,
  ExecutiveSummary,
  SmartDevicesAnalysis,
  SolarAnalysis,
  TariffAnalysis,
} from "@/types/user";
import {
  AlertCircle,
  AlertTriangle,
  Battery,
  BatteryLow,
  BatteryWarning,
  BellRing,
  CheckCircle,
  Clock,
  CloudRain,
  NotepadText,
  PlugZap,
  Settings,
  Smartphone,
  Sun,
  Timer,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Tooltip as Tooltip2,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const ExecutiveSummaryCard = ({ data }: { data: ExecutiveSummary }) => (
  <Card className="w-full mb-6">
    <CardHeader>
      <CardTitle className="text-xl font-bold flex items-center gap-2">
        Executive Summary
        {data.costTrend === "up" ? (
          <TrendingUp className="h-5 w-5 text-red-500" />
        ) : (
          <TrendingDown className="h-5 w-5 text-green-500" />
        )}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-muted">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Current Month's Cost</span>
            <Zap className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">
            ₹{data.currentMonthCost.toLocaleString()}
          </p>
          <p
            className={`text-sm mt-2 ${data.costTrend === "up" ? "text-red-500" : "text-green-500"}`}
          >
            {Math.abs(data.costComparisonPercentage)}% vs last month
          </p>
        </div>

        {data.solarGeneration !== null && (
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Solar Generation</span>
              <Sun className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold">{data.solarGeneration} kWh</p>
            <p className="text-sm text-green-500 mt-2">
              Savings: ₹{data.totalEnergySavings.toLocaleString()}
            </p>
          </div>
        )}

        {data.batteryUsage !== null && (
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Battery Usage</span>
              <Battery className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold">{data.batteryUsage} kWh</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Key Recommendations</h3>
        <div className="grid gap-3">
          {data.keyRecommendations.map((rec, index) => (
            <Alert key={index}>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    rec.priority === "high"
                      ? "destructive"
                      : rec.priority === "medium"
                        ? "default"
                        : "secondary"
                  }
                >
                  {rec.priority}
                </Badge>
                <AlertDescription className="flex-1">
                  {rec.text}
                </AlertDescription>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Impact: {rec.estimatedImpact}
              </p>
            </Alert>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

const TariffAnalysisCard = ({ data }: { data: TariffAnalysis }) => (
  <Card className="w-full mb-6">
    <CardHeader>
      <CardTitle className="text-xl font-bold">Tariff Analysis</CardTitle>
      <CardDescription>{data.patternAnalysis}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Current Rate</p>
          <p className="text-xl font-bold">₹{data.currentRate}/kWh</p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Average Rate</p>
          <p className="text-xl font-bold">₹{data.averageRate}/kWh</p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Peak Rate</p>
          <p className="text-xl font-bold">₹{data.peakRate}/kWh</p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Off-Peak Rate</p>
          <p className="text-xl font-bold">₹{data.offPeakRate}/kWh</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-4">Forecasted Rates</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.forecastedRates}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (
                      active &&
                      payload?.[0]?.payload?.time &&
                      payload?.[0]?.value
                    ) {
                      return (
                        <div className="bg-background border border-gray-300 p-2 rounded">
                          <p>{`Time: ${payload[0].payload.time}`}</p>
                          <p>{`Rate: ₹${Number(payload[0].value).toFixed(2)}/kWh`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#2563eb"
                  name="Rate (₹/kWh)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Savings Opportunities</h3>
          <div className="space-y-2">
            {data.savingsOpportunities.map((opportunity, index) => (
              <Alert key={index}>
                <AlertDescription>{opportunity}</AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ConsumptionAnalyticsCard = ({ data }: { data: ConsumptionAnalytics }) => (
  <Card className="w-full mb-6">
    <CardHeader>
      <CardTitle className="text-xl font-bold">Consumption Analytics</CardTitle>
      <CardDescription>
        Get a detailed overview of your energy consumption and consumption
        trends over time.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Total Consumption</p>
          <p className="text-xl font-bold">{data.totalConsumption} kWh</p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Daily Average</p>
          <p className="text-xl font-bold">
            {data.averageDailyConsumption} kWh
          </p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Peak Consumption</p>
          <p className="text-xl font-bold">{data.peakConsumptionValue} kW</p>
          <p className="text-sm text-muted-foreground">
            at {new Date(data.peakConsumptionTime).toLocaleTimeString()}
          </p>
        </div>
      </div>

      <Tabs defaultValue="consumption" className="w-full">
        <TabsList>
          <TabsTrigger value="consumption">Hourly Consumption</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        <TabsContent value="consumption">
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.consumptionByTimeOfDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (
                      active &&
                      payload?.[0]?.payload?.hour &&
                      payload?.[0]?.value
                    ) {
                      return (
                        <div className="bg-background border border-gray-300 p-2 rounded">
                          <p>{`Hour: ${payload[0].payload.hour}`}</p>
                          <p>{`Average: ${Number(payload[0].value).toFixed(2)} kW`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="#2563eb"
                  name="Average Consumption (kW)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        <TabsContent value="insights" className="space-y-4">
          {data.unusualPatterns && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <h4 className="font-semibold mb-2">
                  Unusual Consumption Patterns
                </h4>
                <ul className="list-disc pl-4">
                  {data.unusualPatterns.map((pattern, index) => (
                    <li key={index}>{pattern}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {data.weatherImpact && (
            <Alert>
              <CloudRain className="h-4 w-4" />
              <AlertDescription>
                <span className="font-bold mr-2">Weather Impact:</span>
                {data.weatherImpact}
              </AlertDescription>
            </Alert>
          )}

          {data.timeOfDayRecommendations && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <h4 className="font-semibold mb-2">
                  Time-of-Day Recommendations
                </h4>
                <ul className="list-disc pl-4">
                  {data.timeOfDayRecommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
);

const SolarAnalysisCard = ({ data }: { data: SolarAnalysis }) => {
  if (!data) return null;

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Solar Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Daily Generation</p>
            <p className="text-xl font-bold">{data.dailyGeneration} kWh</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Monthly Generation</p>
            <p className="text-xl font-bold">{data.monthlyGeneration} kWh</p>
          </div>
          <div className="p-4 bg-muted rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">System Efficiency</p>
              <p className="text-xl font-bold">{data.efficiency}%</p>
            </div>
            {data.efficiency > 100 && (
              <TooltipProvider>
                <Tooltip2>
                  <TooltipTrigger asChild>
                    <BatteryWarning className="h-6 w-6 text-red-600 mr-2" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-background text-foreground rounded-md shadow-lg max-w-xs">
                    There is some error in the system efficiency calculation.
                    Please check the input data and adjust as needed.
                  </TooltipContent>
                </Tooltip2>
              </TooltipProvider>
            )}
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Monthly Savings</p>
            <p className="text-xl font-bold">₹{data.savingsFromSolar}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          These values are based on the current system configuration and may not
          reflect the actual performance of your system. If any of the values
          don't make sense, please check the input data and adjust as needed.
        </p>

        <Tabs defaultValue="optimizations" className="w-full">
          <TabsList>
            <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="storage">Storage Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="optimizations" className="space-y-2">
            {data.optimizations.map((opt, index) => (
              <Alert key={index}>
                <AlertDescription className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  {opt}
                </AlertDescription>
              </Alert>
            ))}
            <Alert>
              <AlertDescription className="flex items-center">
                <CloudRain className="h-4 w-4 text-blue-600 mr-2" />
                {data.weather_impact}
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-2">
            {data.maintenance_tasks.map((task, index) => (
              <Alert key={index}>
                <AlertDescription className="flex items-center">
                  <NotepadText className="h-4 w-4 text-foreground-600 mr-2" />
                  {task}
                </AlertDescription>
              </Alert>
            ))}
          </TabsContent>

          <TabsContent value="storage" className="space-y-2">
            {data.storage_tips.map((tip, index) => (
              <Alert key={index}>
                <AlertDescription className="flex items-center">
                  <BatteryLow className="h-4 w-4 text-red-600 mr-2" />
                  {tip}
                </AlertDescription>
              </Alert>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const SmartDevicesAnalysisCard = ({ data }: { data: SmartDevicesAnalysis }) => (
  <Card className="w-full mb-6">
    <CardHeader>
      <CardTitle className="text-xl font-bold flex items-center gap-2">
        Smart Devices Analysis
        <Smartphone className="h-5 w-5 text-blue-500" />
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="p-4 rounded-lg bg-muted mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted-foreground">Total Potential Savings</span>
          <Zap className="h-5 w-5 text-green-500" />
        </div>
        <p className="text-2xl font-bold">
          ₹{data.totalPotentialSavings.toLocaleString()}
        </p>
      </div>

      <Tabs defaultValue="devices" className="w-full">
        <TabsList>
          <TabsTrigger value="devices">Device Schedules</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="warnings">Warnings</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          {data.deviceSchedules.map((device, index) => (
            <Alert key={index} className="relative">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlugZap className="h-4 w-4 text-blue-500" />
                    <h4 className="font-semibold">{device.deviceName}</h4>
                  </div>
                  <Badge variant="secondary">
                    ₹{device.expectedSavings.toLocaleString()} potential savings
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Current Usage (assumed):
                    </p>
                    <p className="text-sm">{device.currentUsagePattern}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Recommended Usage:
                    </p>
                    <p className="text-sm">{device.recommendedPattern}</p>
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    Optimal Hours:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {device.optimalHours.map((hour) => (
                      <Badge key={hour} variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {hour}:00
                      </Badge>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mt-2">
                  {device.reasonForRecommendation}
                </p>
              </div>
            </Alert>
          ))}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                General Recommendations
              </h3>
              {data.generalRecommendations.map((rec, index) => (
                <Alert key={index}>
                  <AlertDescription>{rec}</AlertDescription>
                </Alert>
              ))}
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Automation Opportunities
              </h3>
              {data.automationOpportunities.map((opp, index) => (
                <Alert key={index}>
                  <AlertDescription>{opp}</AlertDescription>
                </Alert>
              ))}
              {data.automationOpportunities.length === 0 && (
                <Alert>
                  <AlertDescription>
                    No automation opportunities found.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <BellRing className="h-4 w-4" />
                Integration Tips
              </h3>
              {data.deviceIntegrationTips.map((tip, index) => (
                <Alert key={index}>
                  <AlertDescription>{tip}</AlertDescription>
                </Alert>
              ))}
              {data.deviceIntegrationTips.length === 0 && (
                <Alert>
                  <AlertDescription>
                    No integration tips found.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="warnings" className="space-y-4">
          {data.peakUsageWarnings.map((warning, index) => (
            <Alert key={index}>
              <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
              <AlertDescription className="mt-1">{warning}</AlertDescription>
            </Alert>
          ))}
          {data.peakUsageWarnings.length === 0 && (
            <Alert>
              <AlertDescription>No peak usage warnings found.</AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
);

export {
  ConsumptionAnalyticsCard,
  ExecutiveSummaryCard,
  SmartDevicesAnalysisCard,
  SolarAnalysisCard,
  TariffAnalysisCard,
};
