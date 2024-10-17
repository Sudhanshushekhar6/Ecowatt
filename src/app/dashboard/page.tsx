"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Battery,
  DollarSign,
  Settings,
  Sun,
  Zap,
} from "lucide-react";
import {
  DailyEnergyChart,
  EnergyDistributionChart,
  MonthlyProductionChart,
} from "../../components/dashboard-charts";

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-[90vh] bg-gray-100">
      <main className="flex-1 py-8 px-4 md:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Energy Produced
              </CardTitle>
              <Sun className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45.2 kWh</div>
              <p className="text-xs text-gray-500">+20% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Battery Status
              </CardTitle>
              <Battery className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-gray-500">Fully charged in 2 hours</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Consumption
              </CardTitle>
              <Zap className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.8 kW</div>
              <p className="text-xs text-gray-500">-5% from average</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Savings This Month
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$124.50</div>
              <p className="text-xs text-gray-500">+15% from last month</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <DailyEnergyChart />
          <MonthlyProductionChart />
          <EnergyDistributionChart />
        </div>
        <div className="flex justify-between items-center">
          <Button className="bg-green-600 text-white hover:bg-green-700">
            <BarChart3 className="mr-2 h-4 w-4" /> Generate Report
          </Button>
          <Button
            variant="outline"
            className="text-gray-600 border-gray-300 hover:bg-gray-100"
          >
            <Settings className="mr-2 h-4 w-4" /> System Settings
          </Button>
        </div>
      </main>
      <footer className="py-6 px-4 md:px-6 mt-8 bg-white border-t border-gray-200">
        <p className="text-center text-sm text-gray-600">
          © 2024 PrabhaWatt. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
