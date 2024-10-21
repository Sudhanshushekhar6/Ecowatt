// pages/dashboard/index.tsx
"use client";

import DiscomInfoCard from "@/components/dashboard/DiscomInfoCard";
import EnergyCharts from "@/components/dashboard/EnergyCharts";
import GenerateReportButton from "@/components/dashboard/GenerateReportButton";
import StatsCards from "@/components/dashboard/StatsCards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthContext } from "@/context/auth-context";
import { fetchDISCOMData, fetchTOUHistory, fetchWeatherData } from "@/lib/api";
import { db } from "@/lib/firebase";
import { Discom, EnergyData, TOUData, UserData } from "@/types/user";
import { doc, getDoc } from "firebase/firestore";
import { parse } from "papaparse";
import { useCallback, useEffect, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

export default function Dashboard() {
  // State declarations
  const { user } = useAuthContext();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [weatherData, setWeatherData] = useState<any>(null);
  const [discomInfo, setDiscomInfo] = useState<Discom | null>(null);
  const [touHistory, setTOUHistory] = useState<TOUData[]>([]); // Specify the type of touHistory

  // CSV processing function
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

  // File upload handler
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

  // Load stored energy data
  useEffect(() => {
    const storedData = localStorage.getItem("energyData");
    if (storedData) {
      setEnergyData(JSON.parse(storedData));
      setFileName("energyData.csv");
    }
  }, []);

  // Fetch geolocation and weather data
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async ({ coords }) => {
        const { latitude, longitude } = coords;
        const data = await fetchWeatherData(latitude, longitude);
        if (data) {
          setWeatherData(data);
          setLocationName(data.name);
        }
      });
    }
  }, []);

  // Initialize dashboard data
  useEffect(() => {
    const initializeDashboard = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as UserData;
            setUserData(userData);
            const discomData = fetchDISCOMData(userData.electricityProvider);
            if (discomData) {
              setDiscomInfo(discomData);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    initializeDashboard();
  }, [user]);

  useEffect(() => {
    let isMounted = true; // Flag to check if the component is mounted
    fetchTOUHistory().then((touHistory) => {
      if (isMounted) {
        // Only set state if the component is still mounted
        const latestTou = touHistory[0];
        toast.success("Latest TOU rate fetched", {
          description: `Current TOU rate: ${latestTou.rate}`,
        });
        setTOUHistory(touHistory);
      }
    });

    return () => {
      isMounted = false; // Cleanup function to set the flag to false
    };
  }, []); // Ensure this effect runs only once

  // Calculate dashboard metrics
  const totalSolarPower = energyData.reduce(
    (sum, data) => sum + data.SolarEnergy,
    0,
  );
  const uniqueDays = new Set(
    energyData.map((data) =>
      new Date(data.SendDate.split(" ")[0]).toDateString(),
    ),
  ).size;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[90vh] text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!user || !userData) {
    return (
      <div className="flex items-center justify-center min-h-[90vh] text-sm text-muted-foreground">
        No user data available.
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex-1 py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Stats Cards Section */}
          <StatsCards
            userData={userData}
            totalSolarPower={totalSolarPower}
            uniqueDays={uniqueDays}
            locationName={locationName}
            weatherData={weatherData}
          />

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DiscomInfoCard discomInfo={discomInfo} />

            {/* TOU Rate History Card */}
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
                      labelFormatter={(label) =>
                        new Date(label).toLocaleString()
                      }
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
          </div>

          {/* Energy Charts Section */}
          <EnergyCharts
            energyData={energyData}
            handleFileUpload={handleFileUpload}
            fileName={fileName}
          />

          <div className="flex mt-6 justify-between items-center">
            <GenerateReportButton
              user={user}
              userData={userData}
              energyData={energyData}
              weatherData={weatherData}
              discomInfo={discomInfo}
              touHistory={touHistory}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
