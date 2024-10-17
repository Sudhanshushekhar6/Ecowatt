"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const dailyEnergyData = [
  { time: "00:00", solar: 0, consumption: 2 },
  { time: "04:00", solar: 0, consumption: 1 },
  { time: "08:00", solar: 3, consumption: 4 },
  { time: "12:00", solar: 7, consumption: 3 },
  { time: "16:00", solar: 5, consumption: 5 },
  { time: "20:00", solar: 1, consumption: 4 },
];

const monthlyProductionData = [
  { month: "Jan", production: 300 },
  { month: "Feb", production: 400 },
  { month: "Mar", production: 500 },
  { month: "Apr", production: 700 },
  { month: "May", production: 800 },
  { month: "Jun", production: 1000 },
];

const energyDistributionData = [
  { name: "Solar Used", value: 65 },
  { name: "Grid Import", value: 25 },
  { name: "Battery", value: 10 },
];

export function DailyEnergyChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Energy Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            solar: {
              label: "Solar Production",
              color: "hsl(var(--chart-1))",
            },
            consumption: {
              label: "Energy Consumption",
              color: "hsl(var(--chart-2))",
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyEnergyData}>
              <XAxis dataKey="time" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="solar"
                stroke="var(--color-solar)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="consumption"
                stroke="var(--color-consumption)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function MonthlyProductionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Energy Production</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            production: {
              label: "Energy Production",
              color: "hsl(var(--chart-1))",
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyProductionData}>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="production" fill="var(--color-production)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function EnergyDistributionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Energy Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            value: {
              label: "Percentage",
              color: "hsl(var(--chart-1))",
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={energyDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="var(--color-value)"
                dataKey="value"
                label
              />
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
