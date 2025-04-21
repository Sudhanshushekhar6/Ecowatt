'use client';

import { Button } from "@/components/ui/button";
import { AlertCircle, Download } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PDFReport from "./PDFReport";
import { User } from "firebase/auth";
import { UserData } from "@/types/user";
import { ExecutiveSummary, TariffAnalysis, ConsumptionAnalytics, SolarAnalysis } from "@/types/user";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface PDFGeneratorProps {
  user: User;
  userData: UserData;
  executiveSummary: ExecutiveSummary;
  tariffAnalysis: TariffAnalysis;
  consumptionAnalytics: ConsumptionAnalytics;
  solarAnalysis: SolarAnalysis | null;
}

const PDFGenerator = ({
  user,
  userData,
  executiveSummary,
  tariffAnalysis,
  consumptionAnalytics,
  solarAnalysis,
}: PDFGeneratorProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Validate required data
  if (!executiveSummary || !tariffAnalysis || !consumptionAnalytics) {
    console.error('Missing required data for PDF generation:', {
      executiveSummary: !!executiveSummary,
      tariffAnalysis: !!tariffAnalysis,
      consumptionAnalytics: !!consumptionAnalytics
    });
    return (
      <Button
        className="bg-red-600 text-white hover:bg-red-700"
        disabled={true}
      >
        <div className="flex items-center">
          <AlertCircle className="mr-2 h-4 w-4" />
          Missing required data
        </div>
      </Button>
    );
  }

  const handleDownload = () => {
    setIsDownloading(true);
    toast.info("Preparing PDF for download...");
  };

  const handleDownloadComplete = () => {
    setIsDownloading(false);
    toast.success("PDF downloaded successfully!");
  };

  const handleDownloadError = (error: any) => {
    console.error("PDF download error:", error);
    setIsDownloading(false);
    setError(error.message || "Failed to download PDF");
    toast.error("Failed to download PDF. Please try again.");
  };

  return (
    <PDFDownloadLink
      document={
        <PDFReport
          user={user}
          userData={userData}
          executiveSummary={executiveSummary}
          tariffAnalysis={tariffAnalysis}
          consumptionAnalytics={consumptionAnalytics}
          solarAnalysis={solarAnalysis}
        />
      }
      fileName={`energy-report-${new Date().toISOString().split('T')[0]}.pdf`}
      onClick={handleDownload}
      onError={handleDownloadError}
    >
      {({ loading, error, blob, url }) => {
        if (error) {
          handleDownloadError(error);
          return (
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={true}
            >
              <div className="flex items-center">
                <AlertCircle className="mr-2 h-4 w-4" />
                Error generating PDF
              </div>
            </Button>
          );
        }

        if (blob && url) {
          handleDownloadComplete();
        }

        return (
          <Button
            className="bg-green-600 text-white hover:bg-green-700"
            disabled={loading || isDownloading}
          >
            <div className="flex items-center">
              {loading || isDownloading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {loading || isDownloading ? "Preparing PDF..." : "Download PDF"}
            </div>
          </Button>
        );
      }}
    </PDFDownloadLink>
  );
};

export default PDFGenerator; 