"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthContext } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Battery, Leaf, Sun, Zap } from "lucide-react";
import { parse } from 'papaparse';
import { useCallback, useEffect, useState } from "react";
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
  YAxis
} from "recharts";

export default function Dashboard() {
  const { user } = useAuthContext();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [energyData, setEnergyData] = useState<{ SendDate: string; SolarPower: number; SolarEnergy: number; Consumption: number; }[]>([]);

  const processCSV = useCallback((str: string) => {
    parse(str, {
      header: true,
      complete: (results) => {
        const processedData = results.data.map((row: any) => ({
          SendDate: row['SendDate'],
          SolarPower: parseFloat(row['Solar Power (kW)']),
          SolarEnergy: parseFloat(row['Solar energy Generation  (kWh)']),
          Consumption: parseFloat(row['consumptionValue (kW)']),
        }));
        setEnergyData(processedData);
        // Save to local storage
        localStorage.setItem('energyData', JSON.stringify(processedData));
      },
    });
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          processCSV(text);
        }
      };
      reader.readAsText(file);
    }
  }, [processCSV]);

  useEffect(() => {
    // Load data from local storage on component mount
    const storedData = localStorage.getItem('energyData');
    if (storedData) {
      setEnergyData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data() as UserData); // Cast to UserData
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !userData) {
    return <div>No user data available.</div>;
  }

  const totalSolarPower = energyData.reduce((sum, data) => sum + data.SolarPower, 0);
  const totalConsumption = energyData.reduce((sum, data) => sum + data.Consumption, 0);

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
                  {totalSolarPower.toFixed(2)} kWh
                </div>
                <p className="text-xs text-muted-foreground">
                  100% from solar
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

          <Tabs defaultValue="power-consumption">
            <TabsList>
              <TabsTrigger value="power-consumption">
                Power Consumption vs. Solar Generation
              </TabsTrigger>
              <TabsTrigger value="solar-energy">
                Cumulative Solar Energy Generation
              </TabsTrigger>
              <TabsTrigger value="hourly-consumption">
                Hourly Energy Consumption
              </TabsTrigger>
            </TabsList>
            <TabsContent value="power-consumption">
              <Card>
                <CardHeader>
                  <CardTitle>Power Consumption vs. Solar Generation</CardTitle>
                  <CardDescription className="flex items-center justify-between">
                    <p>Comparison of consumption and solar generation</p>
                    <Input type="file" accept=".csv" onChange={handleFileUpload} className="w-fit" />
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={energyData}>
                      <XAxis dataKey="SendDate" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="Consumption" stroke="#8884d8" name="Consumption (kW)" />
                      <Line yAxisId="right" type="monotone" dataKey="SolarPower" stroke="#82ca9d" name="Solar Power (kW)" />
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
                      <XAxis dataKey="SendDate" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="SolarEnergy" stroke="#82ca9d" fill="#82ca9d" name="Solar Energy (kWh)" />
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
                      <XAxis dataKey="SendDate" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="Consumption" fill="#8884d8" name="Consumption (kW)" />
                    </BarChart>
                  </ResponsiveContainer>
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
