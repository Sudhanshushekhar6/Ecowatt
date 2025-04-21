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
import { User } from "firebase/auth";
import { AlertCircle, BarChart3, Settings } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ConsumptionAnalyticsCard,
  ExecutiveSummaryCard,
  SmartDevicesAnalysisCard,
  SolarAnalysisCard,
  TariffAnalysisCard,
} from "./ReportCards";
import PDFDownloadButton from "./PDFDownloadButton";

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
  const [allSectionsGenerated, setAllSectionsGenerated] = useState(false);
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
    fullReport: any,
  ) => {
    setSectionStatus((prev) => ({
      ...prev,
      [section]: { isLoading: true, error: null },
    }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const generatedSection = fullReport[section];

      if (generatedSection) {
        setReport((prev) => ({
          ...prev,
          [section]: generatedSection,
        }));
      }
    } catch (error) {
      console.error(`Error generating ${section}:`, error);
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
      toast.error("Missing required data. Please check your settings.");
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsGenerating(true);
    setAllSectionsGenerated(false);
    setReport(INITIAL_REPORT_STATE);
    setSectionStatus(INITIAL_STATUS_STATE);

    try {
      const fullReport = await generateReport(
        userData,
        touHistory,
        weatherData || defaultWeatherData(),
        discomInfo!,
        energyData,
      );

      if (signal.aborted) return;
      setReportGenerated(true);

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

      if (!signal.aborted) {
        setAllSectionsGenerated(true);
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
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report. Please try again.");
    } finally {
      if (!signal.aborted) {
        setIsGenerating(false);
        abortControllerRef.current = null;
      }
    }
  };

  const handleDownloadReport = async () => {
    if (!userData || !discomInfo) {
      toast.error("Missing required data. Please check your settings.");
      return;
    }

    try {
      const fullReport = await generateReport(
        userData,
        touHistory,
        weatherData || defaultWeatherData(),
        discomInfo!,
        energyData,
      );

      if (fullReport) {
        setReportGenerated(true);
        setReport({
          executiveSummary: fullReport.executiveSummary,
          tariffAnalysis: fullReport.tariffAnalysis,
          consumptionAnalytics: fullReport.consumptionAnalytics,
          solarAnalysis: fullReport.solarAnalysis,
          smartDevicesAnalysis: fullReport.smartDevicesAnalysis,
        });
        setAllSectionsGenerated(true);
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report. Please try again.");
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

  const isReportComplete = report.executiveSummary !== null && 
                          report.tariffAnalysis !== null && 
                          report.consumptionAnalytics !== null;

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-start space-x-6 w-full">
        <div>
          {Object.values(report).every((section) => section === null) ? (
            <Button
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Report...
                </div>
              ) : (
                <div className="flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generate Report
                </div>
              )}
            </Button>
          ) : (
            <div className="flex items-center space-x-4">
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleGenerateReport}
                disabled={isGenerating}
              >
                <div className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Regenerate Report
                </div>
              </Button>
            </div>
          )}
          {energyData.length === 0 && (
            <div className="text-sm text-muted-foreground mt-2">
              Please upload energy data to generate a report.
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <PDFDownloadButton user={user} userData={userData} />
          <Link href="/settings">
            <Button
              variant="outline"
              className="text-muted-foreground border-gray-300 hover:bg-muted"
            >
              <Settings className="mr-2 h-4 w-4" /> System Settings
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {renderSection("executiveSummary", ExecutiveSummaryCard)}
        {renderSection("tariffAnalysis", TariffAnalysisCard)}
        {renderSection("consumptionAnalytics", ConsumptionAnalyticsCard)}
        {renderSection("solarAnalysis", SolarAnalysisCard)}
        {renderSection("smartDevicesAnalysis", SmartDevicesAnalysisCard)}
      </div>

      {isReportComplete && allSectionsGenerated && (
        <PDFDownloadButton
          user={user}
          userData={userData}
        />
      )}
    </div>
  );
};

export default GenerateReportButton;