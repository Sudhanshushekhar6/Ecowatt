import { Button } from "@/components/ui/button";
import { generateReport } from "@/lib/ai";
import {
  ConsumptionAnalytics,
  Discom,
  EnergyData,
  ExecutiveSummary,
  SmartDevicesAnalysis,
  SolarAnalysis,
  TariffAnalysis,
  TOUData,
  UserData,
  WeatherData,
} from "@/types/user";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { User } from "firebase/auth";
import { AlertCircle, BarChart3, Download, Settings } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PDFReport from "./PDFReport";
import { ExecutiveSummaryCard } from "./ReportCards";

interface Report {
  executiveSummary: ExecutiveSummary;
  tariffAnalysis: TariffAnalysis;
  consumptionAnalytics: ConsumptionAnalytics;
  solarAnalysis: SolarAnalysis;
  smartDevicesAnalysis: SmartDevicesAnalysis;
}

const GenerateReportButton = ({
  user,
  userData,
  energyData,
  weatherData,
  discomInfo,
  touHistory,
}: {
  user: User;
  userData: UserData;
  energyData: EnergyData[];
  weatherData: WeatherData;
  discomInfo: Discom | null;
  touHistory: TOUData[];
}) => {
  const [report, setReport] = useState<Report | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const defaultWeatherData = useCallback(
    () => ({
      name: "Unknown",
      main: {
        temp: 0,
        humidity: 0,
        feels_like: 0,
      },
      weather: [
        {
          main: "Clear",
          description: "Clear skies",
          icon: "01d",
        },
      ],
      wind: {
        speed: 0,
      },
      visibility: 0,
    }),
    [],
  );

  const handleGenerateReport = async () => {
    if (!userData || !discomInfo) {
      setError("Missing required data");
      return;
    }

    // Cancel any pending report generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this operation
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsGenerating(true);
    setError(null);

    try {
      const reportChunks = await Promise.all([
        generateReportChunk("executiveSummary", signal),
        generateReportChunk("tariffAnalysis", signal),
        generateReportChunk("consumptionAnalytics", signal),
        generateReportChunk("solarAnalysis", signal),
        generateReportChunk("smartDevicesAnalysis", signal),
      ]);

      if (signal.aborted) {
        return;
      }

      const [
        executiveSummary,
        tariffAnalysis,
        consumptionAnalytics,
        solarAnalysis,
        smartDevicesAnalysis,
      ] = reportChunks;

      setReport({
        executiveSummary: executiveSummary as ExecutiveSummary,
        tariffAnalysis: tariffAnalysis as TariffAnalysis,
        consumptionAnalytics: consumptionAnalytics as ConsumptionAnalytics,
        solarAnalysis: solarAnalysis as SolarAnalysis,
        smartDevicesAnalysis: smartDevicesAnalysis as SmartDevicesAnalysis,
      });
    } catch (error) {
      if (!signal.aborted) {
        console.error("Error generating report:", error);
        setError("Failed to generate report. Please try again later.");
      }
    } finally {
      if (!signal.aborted) {
        setIsGenerating(false);
        abortControllerRef.current = null;
      }
    }
  };

  const generateReportChunk = async (
    section: keyof Report,
    signal: AbortSignal,
  ) => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        if (signal.aborted) {
          return;
        }

        const generatedReport = await generateReport(
          userData,
          touHistory,
          weatherData || defaultWeatherData(),
          discomInfo!,
          energyData,
        );

        resolve(generatedReport[section]);
      }, 0);
    });
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useCopilotReadable({
    description:
      "User's analysis report based on their energy data and recommendations for improvement. If the values are empty, then the report hasn't been generated yet.",
    value: report,
  });

  useCopilotAction({
    name: "generateReport",
    description:
      "Generate an analysis report based on the user's data and generate recommendations for improvement.",
    handler: handleGenerateReport,
  });

  const reportCards = useMemo(() => {
    if (!report) return null;

    return (
      <div className="space-y-6">
        <ExecutiveSummaryCard data={report.executiveSummary} />
        {/* <TariffAnalysisCard data={report.tariffAnalysis} />
        <ConsumptionAnalyticsCard data={report.consumptionAnalytics} />
        <SolarAnalysisCard data={report.solarAnalysis} />
        <SmartDevicesAnalysisCard data={report.smartDevicesAnalysis} /> */}
      </div>
    );
  }, [report]);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between w-full">
        <div>
          <Button
            className="bg-green-600 text-white hover:bg-green-700"
            onClick={handleGenerateReport}
            disabled={isGenerating || energyData.length === 0}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating Report..." : "Generate Report"}
          </Button>
          {energyData.length === 0 && (
            <div className="text-sm text-gray-600 mt-2">
              Please upload energy data to generate a report.
            </div>
          )}
        </div>

        <Link href="/settings">
          <Button
            variant="outline"
            className="text-gray-600 border-gray-300 hover:bg-gray-100"
          >
            <Settings className="mr-2 h-4 w-4" /> System Settings
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {reportCards}

      {report && (
        <div className="flex justify-end">
          <PDFDownloadLink
            document={
              <PDFReport
                user={user}
                userData={userData}
                executiveSummary={report.executiveSummary}
                tariffAnalysis={report.tariffAnalysis}
                consumptionAnalytics={report.consumptionAnalytics}
                solarAnalysis={report.solarAnalysis}
              />
            }
            fileName="energy_report.pdf"
          >
            {/* @ts-ignore */}
            {({ loading }) => (
              <Button disabled={loading} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                {loading ? "Preparing PDF..." : "Download PDF Report"}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      )}
    </div>
  );
};

export default GenerateReportButton;
