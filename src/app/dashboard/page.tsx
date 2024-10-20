"use client";

import DiscomInfoCard from "@/components/dashboard/discom-info-card";
import { Button } from "@/components/ui/button";
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
import discomData from "@/data/electricity-providers.json";
import { db } from "@/lib/firebase";
import { Discom } from "@/types/discom";
import { doc, getDoc } from "firebase/firestore";
import {
  BarChart3,
  Battery,
  MapPinHouse,
  Settings,
  Sun,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { parse } from "papaparse";
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
  YAxis,
} from "recharts";

export default function Dashboard() {
  const { user } = useAuthContext();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [energyData, setEnergyData] = useState<
    {
      SendDate: string;
      SolarPower: number;
      SolarEnergy: number;
      Consumption: number;
    }[]
  >([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [weatherData, setWeatherData] = useState<any>(null); // State to hold weather data
  const [discomInfo, setDiscomInfo] = useState<Discom | null>(null);

  const processCSV = useCallback((str: string) => {
    parse(str, {
      header: true,
      complete: (results) => {
        const processedData = results.data.map((row: any) => ({
          SendDate: row["SendDate"],
          SolarPower: parseFloat(row["Solar Power (kW)"]),
          SolarEnergy: parseFloat(row["Solar energy Generation  (kWh)"]),
          Consumption: parseFloat(row["consumptionValue (kW)"]),
        }));
        setEnergyData(processedData);
        localStorage.setItem("energyData", JSON.stringify(processedData));
      },
    });
  }, []);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result;
          if (typeof text === "string") {
            processCSV(text);
          }
        };
        reader.readAsText(file);
      }
    },
    [processCSV],
  );

  const fetchWeatherData = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=metric`,
      );
      const data = await response.json();
      if (data) {
        setWeatherData(data);
        setLocationName(data.name);
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async ({ coords }) => {
        const { latitude, longitude } = coords;
        await fetchWeatherData(latitude, longitude); // Fetch weather data
      });
    }
  }, []);

  useEffect(() => {
    const storedData = localStorage.getItem("energyData");
    if (storedData) {
      setEnergyData(JSON.parse(storedData));
      setFileName("energyData.csv");
    }
  }, []);

  const fetchDISCOMData = (discomName: string) => {
    const discomInfo = discomData.DISCOMs.find(
      (discom) => discom.DISCOM === discomName,
    );
    return discomInfo || null; // Return DISCOM info or null if not found
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as UserData;
            setUserData(userData);

            // Fetch DISCOM data based on the stored electricity provider
            const discomData = fetchDISCOMData(userData.electricityProvider);
            if (discomData) {
              // Set the relevant data to state for display
              setDiscomInfo(discomData); // Assuming you have a state for DISCOM info
            }
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
    return (
      <div className="flex items-center justify-center min-h-[90vh] text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!user || !userData) {
    return <div>No user data available.</div>;
  }

  const totalSolarPower = energyData.reduce(
    (sum, data) => sum + data.SolarPower,
    0,
  );

  const uniqueDays = new Set(energyData.map((data) => data.SendDate)).size;

  const LocationWeatherDetails = ({
    location,
    weather,
  }: {
    location: string;
    weather: any;
  }) => (
    <div className="flex absolute top-[-10px] right-[-10px] items-center text-sm justify-end text-muted-foreground hover:text-foreground">
      <div className="flex items-center justify-center gap-2 rounded-lg bg-white p-2 shadow-md">
        <MapPinHouse />
        <p>{location}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex-1 py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
                <p className="text-xs mb-1 text-muted-foreground">
                  in the past {uniqueDays} days
                </p>
                <p className="text-xs text-muted-foreground">100% from solar</p>
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
            <Card className="relative">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Bill
                </CardTitle>
                {/* <Leaf className="h-4 w-4 text-green-600" /> */}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{userData.monthlyBill}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average monthly electricity bill
                </p>
                <LocationWeatherDetails
                  location={locationName}
                  weather={weatherData}
                />
              </CardContent>
            </Card>
          </div>

          <DiscomInfoCard discomInfo={discomInfo} />

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
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="w-fit"
                      value={fileName ? undefined : ""}
                    />
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={energyData}>
                      <XAxis
                        dataKey="SendDate"
                        label={{ value: "Date", angle: 0, position: "bottom" }}
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
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="Consumption"
                        stroke="#8884d8"
                        name="Consumption (kW)"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="SolarPower"
                        stroke="#82ca9d"
                        name="Solar Power (kW)"
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
                        label={{ value: "Date", angle: 0, position: "bottom" }}
                      />
                      <YAxis
                        label={{
                          value: "Solar Energy (kWh)",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
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
                        label={{ value: "Date", angle: 0, position: "bottom" }}
                      />
                      <YAxis
                        label={{
                          value: "Consumption (kW)",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
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
        </div>
        <div className="flex mt-6 justify-between items-center">
          <Button className="bg-green-600 text-white hover:bg-green-700">
            <BarChart3 className="mr-2 h-4 w-4" /> Generate Report
          </Button>
          <Link href="/settings">
            <Button
              variant="outline"
              className="text-gray-600 border-gray-300 hover:bg-gray-100"
            >
              <Settings className="mr-2 h-4 w-4" /> System Settings
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
