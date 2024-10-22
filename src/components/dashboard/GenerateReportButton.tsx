import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ConsumptionAnalytics,
  Discom,
  EnergyData,
  ExecutiveSummary,
  SolarAnalysis,
  TariffAnalysis,
  TOUData,
  UserData,
  WeatherData,
} from "@/types/user";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { User } from "firebase/auth";
import {
  AlertCircle,
  BarChart3,
  Battery,
  Download,
  Settings,
  Sun,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { generateReport } from "@/lib/ai";
import PDFReport from "./PDFReport";

// Report Section Components
const ExecutiveSummaryCard = ({ data }: { data: ExecutiveSummary }) => (
  <Card className="w-full mb-6 bg-white">
    <CardHeader>
      <CardTitle className="text-xl font-bold">Executive Summary</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Current Month's Cost</span>
            <Zap className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">
            ₹{data.currentMonthCost.toLocaleString()}
          </p>
          <div className="flex items-center mt-2 text-sm">
            {data.costTrend === "up" ? (
              <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
            )}
            <span
              className={
                data.costTrend === "up" ? "text-red-500" : "text-green-500"
              }
            >
              {Math.abs(data.costComparisonPercentage)}% vs last month
            </span>
          </div>
        </div>

        {data.solarGeneration !== null && (
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Solar Generation</span>
              <Sun className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold">{data.solarGeneration} kWh</p>
            <p className="text-sm text-gray-500 mt-2">
              Savings: ₹{data.totalEnergySavings.toLocaleString()}
            </p>
          </div>
        )}

        {data.batteryUsage !== null && (
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Battery Usage</span>
              <Battery className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold">{data.batteryUsage} kWh</p>
          </div>
        )}
      </div>

      {data.keyRecommendations.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Key Recommendations</h3>
          <ul className="list-disc pl-5 space-y-1">
            {data.keyRecommendations.map((rec, index) => (
              <li key={index} className="text-gray-700">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </CardContent>
  </Card>
);

const TariffAnalysisCard = ({ data }: { data: TariffAnalysis }) => (
  <Card className="w-full mb-6">
    <CardHeader>
      <CardTitle className="text-xl font-bold">Tariff Analysis</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Current Rate</p>
          <p className="text-lg font-bold">₹{data.currentRate}/kWh</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Average Rate</p>
          <p className="text-lg font-bold">₹{data.averageRate}/kWh</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Peak Rate</p>
          <p className="text-lg font-bold">₹{data.peakRate}/kWh</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Off-Peak Rate</p>
          <p className="text-lg font-bold">₹{data.offPeakRate}/kWh</p>
        </div>
      </div>

      {data.savingsOpportunities.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Savings Opportunities</h3>
          <ul className="list-disc pl-5 space-y-1">
            {data.savingsOpportunities.map((opportunity, index) => (
              <li key={index} className="text-gray-700">
                {opportunity}
              </li>
            ))}
          </ul>
        </div>
      )}
    </CardContent>
  </Card>
);

const ConsumptionAnalyticsCard = ({ data }: { data: ConsumptionAnalytics }) => (
  <Card className="w-full mb-6">
    <CardHeader>
      <CardTitle className="text-xl font-bold">Consumption Analytics</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Total Consumption</p>
          <p className="text-xl font-bold">{data.totalConsumption} kWh</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Daily Average</p>
          <p className="text-xl font-bold">
            {data.averageDailyConsumption} kWh
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Peak Consumption</p>
          <p className="text-xl font-bold">{data.peakConsumptionValue} kW</p>
          <p className="text-sm text-gray-500">
            at {new Date(data.peakConsumptionTime).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const SolarAnalysisCard = ({ data }: { data: SolarAnalysis }) => {
  if (!data) return null;

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Solar Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Daily Generation</p>
            <p className="text-xl font-bold">{data.dailyGeneration} kWh</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Monthly Generation</p>
            <p className="text-xl font-bold">{data.monthlyGeneration} kWh</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">System Efficiency</p>
            <p className="text-xl font-bold">{data.efficiency}%</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Monthly Savings</p>
            <p className="text-xl font-bold">₹{data.savingsFromSolar}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

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
  const [report, setReport] = useState<{
    executiveSummary: ExecutiveSummary;
    tariffAnalysis: TariffAnalysis;
    consumptionAnalytics: ConsumptionAnalytics;
    solarAnalysis: SolarAnalysis | null;
  } | null>(null); // Update state type to match the report structure
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null); // Update state type to allow string

  const handleGenerateReport = async () => {
    if (!weatherData || !userData || !discomInfo) {
      setError("Missing required data");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const generatedReport = await generateReport(
        user,
        userData,
        touHistory,
        weatherData,
        discomInfo,
        energyData,
      );
      setReport(generatedReport);
    } catch (error) {
      console.error("Error generating report:", error);
      setError("Failed to generate report. Please try again later.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between w-full">
        <Button
          className="bg-green-600 text-white hover:bg-green-700"
          onClick={handleGenerateReport}
          disabled={isGenerating}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating Report..." : "Generate Report"}
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

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {report && (
        <div className="space-y-6">
          <ExecutiveSummaryCard data={report.executiveSummary} />
          <TariffAnalysisCard data={report.tariffAnalysis} />
          <ConsumptionAnalyticsCard data={report.consumptionAnalytics} />
          {report.solarAnalysis && (
            <SolarAnalysisCard data={report.solarAnalysis} />
          )}

          <div className="flex justify-end">
            <PDFDownloadLink
              document={
                <PDFReport
                  user={user}
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
        </div>
      )}
    </div>
  );
};

export default GenerateReportButton;
