import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface EnergyChartsProps {
  energyData: Array<{
    SendDate: string;
    SolarPower: number;
    SolarEnergy: number;
    Consumption: number;
  }>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileName: string | null;
  setDataPoints: React.Dispatch<React.SetStateAction<number>>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    name: string;
    color: string;
  }>;
  label?: string;
}

export default function EnergyCharts({
  energyData,
  handleFileUpload,
  fileName,
  setDataPoints,
}: EnergyChartsProps) {
  function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload) return null;

    return (
      <div className="rounded-lg border bg-background p-2 shadow-lg">
        <div className="text-sm font-medium mb-1">
          {new Date(label || "").toLocaleString()}
        </div>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span>{item.name}:</span>
            <span className="font-medium">{item.value.toFixed(2)} kW</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Tabs defaultValue="power-consumption">
      <TabsList>
        <TabsTrigger value="power-consumption">
          <span className="hidden md:inline">
            Power Consumption vs. Solar Generation
          </span>
          <span className="inline md:hidden">PC vs. SG</span>
        </TabsTrigger>
        <TabsTrigger value="solar-energy">
          <span className="hidden md:inline">
            Cumulative Solar Energy Generation
          </span>
          <span className="inline md:hidden">Cumulative Solar</span>
        </TabsTrigger>
        <TabsTrigger value="hourly-consumption">
          <span className="hidden md:inline">Hourly Energy Consumption</span>
          <span className="inline md:hidden">Hourly Consumption</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="power-consumption">
        <Card>
          <CardHeader>
            <CardTitle>Power Consumption vs. Solar Generation</CardTitle>
            <CardDescription className="flex items-center justify-between flex-col md:flex-row">
              <p>Comparison of consumption and solar generation</p>
              <div className="flex items-center gap-2 flex-col sm:flex-row">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="w-fit"
                  id="energy-data-file"
                  value={fileName ? undefined : ""}
                />
                <Select
                  onValueChange={(value: string) => {
                    const numValue = parseInt(value, 10);
                    setDataPoints(numValue);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select data points" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500">500</SelectItem>
                    <SelectItem value="1000">1000</SelectItem>
                    <SelectItem value="1500">1500</SelectItem>
                    <SelectItem value="2000">2000</SelectItem>
                    <SelectItem value="5000">5000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={energyData}>
                <XAxis
                  dataKey="SendDate"
                  label={{ angle: 0, position: "bottom" }}
                />
                <YAxis
                  yAxisId="left"
                  label={{
                    value: "Power (kW)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{
                    value: "Solar Power (kW)",
                    angle: -90,
                    position: "insideRight",
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="Consumption"
                  stroke="#8884d8"
                  name="Consumption (kW)"
                  dot={{
                    stroke: "#8884d8",
                    strokeWidth: 1,
                    fill: "hsl(var(--background))",
                    r: 2,
                  }}
                  activeDot={{
                    stroke: "#8884d8",
                    strokeWidth: 1,
                    fill: "hsl(var(--background))",
                    r: 2,
                  }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="SolarPower"
                  stroke="#82ca9d"
                  name="Solar Power (kW)"
                  dot={{
                    stroke: "#82ca9d",
                    strokeWidth: 1,
                    fill: "hsl(var(--background))",
                    r: 2,
                  }}
                  activeDot={{
                    stroke: "#82ca9d",
                    strokeWidth: 1,
                    fill: "hsl(var(--background))",
                    r: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="solar-energy">
        <Card>
          <CardHeader>
            <CardTitle>Cumulative Solar Energy Generation</CardTitle>
            <CardDescription>
              Total solar energy generated over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={energyData}>
                <XAxis
                  dataKey="SendDate"
                  label={{ angle: 0, position: "bottom" }}
                />
                <YAxis
                  label={{
                    value: "Solar Energy (kWh)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="SolarEnergy"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  name="Solar Energy (kWh)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="hourly-consumption">
        <Card>
          <CardHeader>
            <CardTitle>Hourly Energy Consumption</CardTitle>
            <CardDescription>
              Energy consumption for each time interval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={energyData}>
                <XAxis
                  dataKey="SendDate"
                  label={{ angle: 0, position: "bottom" }}
                />
                <YAxis
                  label={{
                    value: "Consumption (kW)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="Consumption"
                  fill="#8884d8"
                  name="Consumption (kW)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
