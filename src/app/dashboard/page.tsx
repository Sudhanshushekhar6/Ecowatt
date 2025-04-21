"use client";

import DemoDataButton from "@/components/dashboard/DemoData";
import DiscomInfoCard from "@/components/dashboard/DiscomInfoCard";
import EnergyCharts from "@/components/dashboard/EnergyCharts";
import GenerateReportButton from "@/components/dashboard/GenerateReportButton";
import StatsCards from "@/components/dashboard/StatsCards";
import TOURateHistoryCard from "@/components/dashboard/TOURateHistoryCard";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/auth-context";
import { fetchDISCOMData, fetchTOUHistory, fetchWeatherData } from "@/lib/api";
import { db } from "@/lib/firebase";
import { calculateCurrentBatteryPower } from "@/lib/utils";
import { Discom, EnergyData, TOUData, UserData } from "@/types/user";
import { useCopilotReadable } from "@copilotkit/react-core";
import { useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { parse } from "papaparse";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { startTariffMonitoring } from "@/lib/tariff-monitor";

export default function Dashboard() {
  const { user } = useAuthContext();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [discomInfo, setDiscomInfo] = useState<Discom | null>(null);
  const [touHistory, setTOUHistory] = useState<TOUData[]>([]);
  const [dataPoints, setDataPoints] = useState<number>(500);
  const [reportGenerated, setReportGenerated] = useState<Boolean>(false);
  const hasShownToast = useRef(false);

  
  const lastCalculatedBatteryPower = useRef<number>(0);
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

  useCopilotReadable({
    description:
      "User's weather data, includes user's current location, temperature, and wind speed etc.",
    value: weatherData,
  });

  useCopilotChatSuggestions({
    instructions: `Suggest user to:
      - Get an overview of their current energy profile, including electricity provider, monthly bill, solar panels, battery storage, and primary goal.
      - Generate an analysis report of their data and generate recommendations for improvement. Use the generateReport action to generate the report.
      - Explain the generated report in detail. It may not have been generated yet, so you can ask the user to generate it.
    `,
  });

  // Initialize dashboard data and set initial battery power
  useEffect(() => {
    const initializeDashboard = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as UserData;
            setUserData(userData);
            // Initialize the ref with the current battery power from Firestore
            lastCalculatedBatteryPower.current =
              userData.currentBatteryPower || 0;
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
      } else {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [user]);

  useEffect(() => {
    const updateBatteryPower = async () => {
      if (user && userData && energyData.length > 0) {
        const newBatteryPower = calculateCurrentBatteryPower(
          energyData,
          userData,
        );

        if (
          newBatteryPower !== lastCalculatedBatteryPower.current &&
          newBatteryPower !== userData.currentBatteryPower
        ) {
          lastCalculatedBatteryPower.current = newBatteryPower;

          try {
            await updateDoc(doc(db, "users", user.uid), {
              currentBatteryPower: newBatteryPower,
            });
            toast.success("Your battery power has been updated successfully");
          } catch (error) {
            console.error("Error updating battery power:", error);
            toast.error("Failed to update battery power");
          }
        }
      }
    };

    updateBatteryPower();
  }, [energyData, userData, user]);

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
        }
      });
    }
  }, []);

  // Fetch TOU history
  useEffect(() => {
    let isMounted = true;
  
    if (!hasShownToast.current) {
      fetchTOUHistory(userData ? userData.userCategory : "").then((touHistory) => {
        if (
          isMounted &&
          Array.isArray(touHistory) &&
          touHistory.length > 0
        ) {
          const latestTou = touHistory[touHistory.length - 1];
  
          if (latestTou?.rate !== undefined) {
            toast.success("Latest TOU rate fetched", {
              description: `Current TOU rate: ₹${latestTou.rate} /kwh`,
              action: (
                <Button
                  onClick={() => toast.dismiss()}
                  className="ml-auto"
                  variant="outline"
                  size="sm"
                >
                  Ok
                </Button>
              ),
            });
          } else {
            toast.warning("Latest TOU rate is unavailable.");
          }
  
          setTOUHistory(touHistory);
          hasShownToast.current = true;
        }
      }).catch((err) => {
        console.error("Error fetching TOU history:", err);
        toast.error("Failed to fetch TOU rates.");
      });
    }
  
    return () => {
      isMounted = false;
    };
  }, [userData]);
  

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

  useEffect(() => {
    if (userData) {
      const unsubscribe = startTariffMonitoring(userData);
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [userData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[90vh] text-sm text-muted-foreground">
        <div className="loader"></div>
      </div>
    );
  }

  if (!user || !userData) {
    return (
      <div className="flex items-center justify-center min-h-[90vh] flex-col text-sm text-muted-foreground">
        <p className="text-center">
          No user data available.
          <br /> Perhaps you havn't completed the{" "}
          <span className="font-bold">onboarding</span> process?
        </p>
        <Link href="/onboarding">
          <Button className="mt-4" variant={"outline"}>
            Go back to onboarding
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <main className="flex-1 py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {!reportGenerated && (
            <StatsCards
              userData={userData}
              totalSolarPower={totalSolarPower}
              uniqueDays={uniqueDays}
              weatherData={weatherData}
            />
          )}

          {!reportGenerated && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DiscomInfoCard discomInfo={discomInfo} touHistory={touHistory} />
              <TOURateHistoryCard
                category={userData ? userData.userCategory : ""}
                touHistory={touHistory}
              />
            </div>
          )}

          {!reportGenerated && (
            <EnergyCharts
              energyData={energyData.slice(0, dataPoints)}
              handleFileUpload={handleFileUpload}
              fileName={fileName}
              setDataPoints={setDataPoints}
            />
          )}

          {energyData.length === 0 && (
            <DemoDataButton onLoadDemoData={processCSV} />
          )}

          <div className="flex justify-between items-center">
            <GenerateReportButton
              user={user}
              userData={userData}
              energyData={energyData}
              weatherData={weatherData}
              discomInfo={discomInfo}
              touHistory={touHistory}
              setReportGenerated={setReportGenerated}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
