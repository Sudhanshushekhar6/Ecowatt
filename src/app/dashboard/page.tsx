"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthContext } from "@/context/auth-context";
import { auth, db } from "@/lib/firebase"; // Update this path if necessary
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Battery, Leaf, Sun, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const energyProductionData = [
  { time: "00:00", solar: 0, grid: 2 },
  { time: "04:00", solar: 0, grid: 1.8 },
  { time: "08:00", solar: 2, grid: 1 },
  { time: "12:00", solar: 5, grid: 0 },
  { time: "16:00", solar: 3, grid: 0.5 },
  { time: "20:00", solar: 0.5, grid: 1.5 },
];

const energyConsumptionData = [
  { device: "HVAC", consumption: 35 },
  { device: "Lighting", consumption: 20 },
  { device: "Appliances", consumption: 25 },
  { device: "Electronics", consumption: 15 },
  { device: "Other", consumption: 5 },
];

export default function Dashboard() {
  const { user } = useAuthContext();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data() as UserData);
          } else {
            console.log("No user data found!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirect to home page or login page after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !userData) {
    return <div>No user data available.</div>;
  }

  const totalEnergyProduced = energyProductionData.reduce(
    (sum, data) => sum + data.solar + data.grid,
    0,
  );
  const totalSolarProduced = energyProductionData.reduce(
    (sum, data) => sum + data.solar,
    0,
  );
  const solarPercentage = (totalSolarProduced / totalEnergyProduced) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex-1 py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold">
            Welcome back, {user.displayName || "User"}!
          </h1>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Energy Produced
                </CardTitle>
                <Zap className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalEnergyProduced.toFixed(2)} kWh
                </div>
                <p className="text-xs text-muted-foreground">
                  {solarPercentage.toFixed(1)}% from solar
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Battery Status
                </CardTitle>
                <Battery className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userData.hasBatteryStorage
                    ? `${userData.storageCapacity} kWh`
                    : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {userData.hasBatteryStorage
                    ? "Total Capacity"
                    : "No battery storage"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Solar System
                </CardTitle>
                <Sun className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userData.hasSolarPanels
                    ? `${userData.solarCapacity} kW`
                    : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {userData.hasSolarPanels
                    ? "System Capacity"
                    : "No solar panels"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Bill
                </CardTitle>
                <Leaf className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${userData.monthlyBill}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average monthly electricity bill
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="energy-production">
            <TabsList>
              <TabsTrigger value="energy-production">
                Energy Production
              </TabsTrigger>
              <TabsTrigger value="energy-consumption">
                Energy Consumption
              </TabsTrigger>
            </TabsList>
            <TabsContent value="energy-production">
              <Card>
                <CardHeader>
                  <CardTitle>Energy Production</CardTitle>
                  <CardDescription>
                    Your energy production over the last 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      solar: {
                        label: "Solar",
                        color: "hsl(var(--chart-1))",
                      },
                      grid: {
                        label: "Grid",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={energyProductionData}>
                        <XAxis dataKey="time" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="solar"
                          stroke="var(--color-solar)"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="grid"
                          stroke="var(--color-grid)"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="energy-consumption">
              <Card>
                <CardHeader>
                  <CardTitle>Energy Consumption</CardTitle>
                  <CardDescription>
                    Your energy consumption by device category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      consumption: {
                        label: "Consumption",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={energyConsumptionData}>
                        <XAxis dataKey="device" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="consumption"
                          fill="var(--color-consumption)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Energy Saving Tips</CardTitle>
              <CardDescription>
                Based on your energy profile and goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {userData.primaryGoal === "reduceBills" && (
                  <>
                    <li>
                      Consider upgrading to energy-efficient appliances to
                      reduce your electricity consumption.
                    </li>
                    <li>
                      Use smart power strips to eliminate standby power
                      consumption from electronics.
                    </li>
                  </>
                )}
                {userData.primaryGoal === "maximizeSolar" && (
                  <>
                    <li>
                      Schedule high-energy tasks like laundry or dishwashing
                      during peak sunlight hours.
                    </li>
                    <li>
                      Consider adding a battery storage system to store excess
                      solar energy for nighttime use.
                    </li>
                  </>
                )}
                {userData.primaryGoal === "reduceCarbon" && (
                  <>
                    <li>
                      Replace any remaining incandescent bulbs with LED lighting
                      to reduce energy waste.
                    </li>
                    <li>
                      Consider upgrading to a smart thermostat to optimize your
                      HVAC energy usage.
                    </li>
                  </>
                )}
                {userData.primaryGoal === "gridStability" && (
                  <>
                    <li>
                      Participate in demand response programs offered by your
                      utility to help balance grid load.
                    </li>
                    <li>
                      If you have an EV, consider using it as a temporary power
                      source during peak grid demand.
                    </li>
                  </>
                )}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Smart Devices</CardTitle>
              <CardDescription>Connected devices in your home</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {userData.smartDevices.thermostat && <li>Smart Thermostat</li>}
                {userData.smartDevices.washingMachine && (
                  <li>Smart Washing Machine</li>
                )}
                {userData.smartDevices.dishwasher && <li>Smart Dishwasher</li>}
                {userData.smartDevices.evCharger && <li>EV Charger</li>}
                {userData.smartDevices.other && (
                  <li>{userData.smartDevices.other}</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="py-6 px-4 md:px-6 mt-8 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-gray-600">
            © 2024 PrabhaWatt. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
