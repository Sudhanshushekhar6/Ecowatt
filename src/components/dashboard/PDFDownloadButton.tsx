import { Button } from "@/components/ui/button";
import { UserData, DetailedReport } from "@/types/user";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { User } from "firebase/auth";
import { Download } from "lucide-react";
import PDFReport from "./PDFReport";

interface PDFDownloadButtonProps {
  user: User;
  userData: UserData;
  detailedReport?: DetailedReport;
}

const PDFDownloadButton = ({ user, userData, detailedReport }: PDFDownloadButtonProps) => {
  const defaultReport: DetailedReport = {
    executiveSummary: {
      monthlyBill: userData.monthlyBill || 0,
      primaryGoal: userData.primaryGoal || "Reduce energy bills",
      energyProfile: {
        type: userData.userCategory || "Domestic",
        storageCapacity: Number(userData.storageCapacity) || 0,
        solarCapacity: userData.solarCapacity || 0
      },
      discom: userData.discomInfo?.name || "Unknown"
    },
    tariffAnalysis: {
      averagePowerPurchaseCost: 3.08,
      averageCostOfSupply: 12.11,
      averageBillingRate: 3.70
    },
    consumptionAnalytics: {
      peakDemand: 6.68,
      peakDemandTime: "Late morning hours",
      consumptionPattern: "Highest during daytime",
      mainConsumers: ["Dishwasher", "Thermostat"]
    },
    solarAnalysis: {
      status: userData.hasSolarPanels ? "Installed" : "Not Installed",
      capacity: userData.solarCapacity || 0,
      potential: "High potential for bill reduction through optimization"
    },
    smartDevicesAnalysis: {
      installedDevices: Object.entries(userData.smartDevices || {})
        .filter(([_, status]) => status)
        .map(([device]) => ({
          name: device,
          type: "Energy-intensive"
        })),
      missingDevices: Object.entries(userData.smartDevices || {})
        .filter(([_, status]) => !status)
        .map(([device]) => device)
    },
    recommendations: [
      {
        title: "Optimize Solar Usage",
        details: "Consider upgrading solar panels to increase capacity. This will enable more electricity generation during the day and reduce grid dependency."
      },
      {
        title: "Energy-Efficient Appliances",
        details: "Replace existing appliances with energy-efficient ones, such as a washing machine and EV charger, to reduce consumption and lower bills."
      },
      {
        title: "Smart Home Automation",
        details: "Install smart devices like smart plugs and thermostats to optimize energy usage and reduce waste."
      },
      {
        title: "Timing-Based Consumption",
        details: "Monitor consumption patterns and adjust usage based on TOU rates. Shift energy-intensive tasks to low-rate periods."
      },
      {
        title: "Regular Maintenance",
        details: "Ensure regular maintenance of solar panels and storage system for optimal performance and extended lifespan."
      }
    ]
  };

  function getDeviceRecommendations(device: string): string[] {
    const recommendations: Record<string, string[]> = {
      thermostat: [
        "Set temperature to 24°C during occupied hours",
        "Enable eco-mode during unoccupied hours",
        "Use smart scheduling for different times of day",
        "Implement geofencing for automatic adjustment"
      ],
      dishwasher: [
        "Run during off-peak hours (00:00-06:00)",
        "Use eco-mode for regular loads",
        "Enable delay start for optimal timing",
        "Regularly clean filters for efficiency"
      ],
      washingMachine: [
        "Schedule during off-peak hours",
        "Use cold water settings when possible",
        "Enable smart load detection",
        "Regular maintenance for optimal performance"
      ],
      airConditioner: [
        "Set to 24°C for optimal efficiency",
        "Enable smart scheduling",
        "Use eco-mode during moderate weather",
        "Regular filter cleaning"
      ],
      waterHeater: [
        "Schedule heating during off-peak hours",
        "Set temperature to 50°C",
        "Enable vacation mode when away",
        "Regular maintenance checks"
      ]
    };
    return recommendations[device] || ["No specific recommendations available"];
  }

  return (
    <PDFDownloadLink
      document={
        <PDFReport
          user={user}
          userData={userData}
          detailedReport={detailedReport || defaultReport}
        />
      }
      fileName="energy-report.pdf"
    >
      {({ loading }) => (
          <Button
            className="bg-green-600 text-white hover:bg-green-700"
            disabled={loading}
          >
            <div className="flex items-center">
                <Download className="mr-2 h-4 w-4" />
            {loading ? "Preparing PDF..." : "Download Report"}
            </div>
          </Button>
      )}
    </PDFDownloadLink>
  );
};

export default PDFDownloadButton; 