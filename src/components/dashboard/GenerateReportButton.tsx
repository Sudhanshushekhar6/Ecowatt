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
import { useCopilotReadable } from "@copilotkit/react-core";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { User } from "firebase/auth";
import { AlertCircle, BarChart3, Download, Settings } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import PDFReport from "./PDFReport";
import {
  ConsumptionAnalyticsCard,
  ExecutiveSummaryCard,
  SmartDevicesAnalysisCard,
  SolarAnalysisCard,
  TariffAnalysisCard,
} from "./ReportCards";

interface Report {
  executiveSummary: ExecutiveSummary | null;
  tariffAnalysis: TariffAnalysis | null;
  consumptionAnalytics: ConsumptionAnalytics | null;
  solarAnalysis: SolarAnalysis | null;
  smartDevicesAnalysis: SmartDevicesAnalysis | null;
}

interface SectionStatus {
  isLoading: boolean;
  error: string | null;
}

const INITIAL_REPORT_STATE: Report = {
  executiveSummary: null,
  tariffAnalysis: null,
  consumptionAnalytics: null,
  solarAnalysis: null,
  smartDevicesAnalysis: null,
};

const INITIAL_STATUS_STATE: Record<keyof Report, SectionStatus> = {
  executiveSummary: { isLoading: false, error: null },
  tariffAnalysis: { isLoading: false, error: null },
  consumptionAnalytics: { isLoading: false, error: null },
  solarAnalysis: { isLoading: false, error: null },
  smartDevicesAnalysis: { isLoading: false, error: null },
};

const GenerateReportButton = ({
  user,
  userData,
  energyData,
  weatherData,
  discomInfo,
  touHistory,
  setReportGenerated,
}: {
  user: User;
  userData: UserData;
  energyData: EnergyData[];
  weatherData: WeatherData;
  discomInfo: Discom | null;
  touHistory: TOUData[];
  setReportGenerated: React.Dispatch<React.SetStateAction<Boolean>>;
}) => {
  const [report, setReport] = useState<Report>(INITIAL_REPORT_STATE);
  const [sectionStatus, setSectionStatus] = useState(INITIAL_STATUS_STATE);
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const defaultWeatherData = useCallback(
    () => ({
      name: "Unknown",
      main: { temp: 0, humidity: 0, feels_like: 0 },
      weather: [{ main: "Clear", description: "Clear skies", icon: "01d" }],
      wind: { speed: 0 },
      visibility: 0,
    }),
    [],
  );

  const generateReportSection = async (
    section: keyof Report,
    fullReport: any, // Add the full report as an argument
  ) => {
    setSectionStatus((prev) => ({
      ...prev,
      [section]: { isLoading: true, error: null },
    }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Extract the section from the full report
      const generatedSection = fullReport[section];

      if (generatedSection) {
        setReport((prev) => ({
          ...prev,
          [section]: generatedSection,
        }));
      }
    } catch (error) {
      setSectionStatus((prev) => ({
        ...prev,
        [section]: {
          isLoading: false,
          error: "Failed to generate this section",
        },
      }));
    } finally {
      setSectionStatus((prev) => ({
        ...prev,
        [section]: { ...prev[section], isLoading: false },
      }));
    }
  };

  const handleGenerateReport = async () => {
    if (!userData || !discomInfo) {
      setSectionStatus(INITIAL_STATUS_STATE);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsGenerating(true);
    setReport(INITIAL_REPORT_STATE);
    setSectionStatus(INITIAL_STATUS_STATE);

    try {
      // Generate the full report once
      const fullReport = await generateReport(
        userData,
        touHistory,
        weatherData || defaultWeatherData(),
        discomInfo!,
        energyData,
      );

      if (signal.aborted) return;
      setReportGenerated(true);

      toast.success("Report generated successfully!", {
        description: "Scroll down to view the report",
        action: {
          label: "View",
          onClick: () => {
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: "smooth",
            });
          },
        },
      });

      // Generate individual sections after the full report is generated
      const sections: (keyof Report)[] = [
        "executiveSummary",
        "tariffAnalysis",
        "consumptionAnalytics",
        "solarAnalysis",
        "smartDevicesAnalysis",
      ];

      for (const section of sections) {
        if (signal.aborted) break;
        await generateReportSection(section, fullReport);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      setIsGenerating(false);
      setSectionStatus(INITIAL_STATUS_STATE);
    }

    if (!signal.aborted) {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
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
      "User's analysis report based on their energy data and recommendations for improvement.",
    value: report,
  });

  const renderSection = (
    section: keyof Report,
    Component: React.ComponentType<any>,
  ) => {
    const status = sectionStatus[section];
    const data = report[section];

    if (status.isLoading) {
      return (
        <div className="animate-pulse bg-muted rounded-lg p-6">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      );
    }

    if (status.error) {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {status.error}
        </div>
      );
    }

    return data && <Component data={data} />;
  };

  const isReportComplete = Object.values(report).every(
    (section) => section !== null,
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-start space-x-6 w-full">
        <div>
          {Object.values(report).every((section) => section === null) ? (
            <Button
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={handleGenerateReport}
              disabled={isGenerating || energyData.length === 0}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              {isGenerating ? "Generating Report..." : "Generate Report"}
            </Button>
          ) : (
            <></>
          )}
          {energyData.length === 0 && (
            <div className="text-sm text-muted-foreground mt-2">
              Please upload energy data to generate a report.
            </div>
          )}
        </div>

        {Object.values(report).every((section) => section === null) && (
          <Link href="/settings">
            <Button
              variant="outline"
              className="text-muted-foreground border-gray-300 hover:bg-muted"
            >
              <Settings className="mr-2 h-4 w-4" /> System Settings
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-6">
        {renderSection("executiveSummary", ExecutiveSummaryCard)}
        {renderSection("tariffAnalysis", TariffAnalysisCard)}
        {renderSection("consumptionAnalytics", ConsumptionAnalyticsCard)}
        {renderSection("solarAnalysis", SolarAnalysisCard)}
        {renderSection("smartDevicesAnalysis", SmartDevicesAnalysisCard)}
      </div>

      {isReportComplete && (
        <div className="flex justify-start">
          <PDFDownloadLink
            document={
              <PDFReport
                user={user}
                userData={userData}
                executiveSummary={report.executiveSummary!}
                tariffAnalysis={report.tariffAnalysis!}
                consumptionAnalytics={report.consumptionAnalytics!}
                solarAnalysis={report.solarAnalysis!}
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
