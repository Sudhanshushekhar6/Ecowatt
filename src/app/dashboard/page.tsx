// pages/dashboard/index.tsx
"use client";

import DiscomInfoCard from "@/components/dashboard/DiscomInfoCard";
import EnergyCharts from "@/components/dashboard/EnergyCharts";
import GenerateReportButton from "@/components/dashboard/GenerateReportButton";
import StatsCards from "@/components/dashboard/StatsCards";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthContext } from "@/context/auth-context";
import { fetchDISCOMData, fetchWeatherData } from "@/lib/api";
import { db } from "@/lib/firebase";
import { Discom, TOUData, UserData } from "@/types/user";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { Settings } from "lucide-react";
import Link from "next/link";
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

export default function Dashboard() {
  // State declarations
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
  const [weatherData, setWeatherData] = useState<any>(null);
  const [discomInfo, setDiscomInfo] = useState<Discom | null>(null);
  const [currentTOU, setCurrentTOU] = useState<number | null>(null);
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

  async function fetchTOUHistory() {
    const touCollection = collection(db, "tou-rates");
    const q = query(touCollection, orderBy("timestamp", "desc"), limit(24)); // Last 24 entries
    const querySnapshot = await getDocs(q);
    const history = querySnapshot.docs.map((doc) => ({
      timestamp: doc.data().timestamp,
      rate: doc.data().rate,
    }));
    return history.reverse(); // Reverse to show oldest first
  }

  const fetchTOUData = useCallback(async () => {
    try {
      const response = await fetch("/api/tou");
      const data = await response.json();
      setCurrentTOU(data.rate);
      setTOUHistory((prevHistory) => {
        const newHistory = [
          ...prevHistory,
          { timestamp: data.timestamp, rate: data.rate },
        ];
        return newHistory.slice(-24); // Keep only the last 24 entries
      });
    } catch (error) {
      console.error("Error fetching TOU data:", error);
    }
  }, []);

  useEffect(() => {
    fetchTOUHistory().then(setTOUHistory);
  }, []);

  useEffect(() => {
    fetchTOUData();
    const interval = setInterval(fetchTOUData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

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
            <Link href="/settings">
              <Button
                variant="outline"
                className="text-gray-600 border-gray-300 hover:bg-gray-100"
              >
                <Settings className="mr-2 h-4 w-4" /> System Settings
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
