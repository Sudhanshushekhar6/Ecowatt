import {
  ConsumptionAnalytics,
  ExecutiveSummary,
  SolarAnalysis,
  TariffAnalysis,
  UserData,
  DetailedReport,
} from "@/types/user";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { User } from "firebase/auth";

// Enhanced styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: "#2c3e50",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: "#2d3748",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 5,
  },
  subSectionTitle: {
    fontSize: 14,
    marginTop: 15,
    marginBottom: 8,
    color: "#4a5568",
    fontWeight: "bold",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  gridItem: {
    width: "50%",
    padding: 5,
  },
  label: {
    fontSize: 12,
    color: "#4a5568",
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: "#1a202c",
    fontWeight: "bold",
  },
  list: {
    marginLeft: 15,
    marginTop: 5,
  },
  listItem: {
    fontSize: 12,
    marginBottom: 5,
    color: "#4a5568",
  },
  priorityHigh: {
    color: "#e53e3e",
  },
  priorityMedium: {
    color: "#d69e2e",
  },
  priorityLow: {
    color: "#38a169",
  },
  smallText: {
    fontSize: 10,
    color: "#718096",
    marginTop: 2,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    marginVertical: 10,
  },
  dateGenerated: {
    fontSize: 10,
    color: "#718096",
    marginTop: 20,
    textAlign: "right",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
    color: "#34495e"
  },
  text: {
    fontSize: 12,
    marginBottom: 5
  },
  recommendation: {
    marginBottom: 10,
    padding: 5
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5
  },
  userInfo: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 5
  },
  userInfoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2c3e50"
  },
  userInfoItem: {
    fontSize: 12,
    marginBottom: 5,
    color: "#4a5568"
  }
});

interface PDFReportProps {
  user: User;
  userData: UserData;
  detailedReport: DetailedReport;
}

const PDFReport = ({ user, userData, detailedReport }: PDFReportProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>Energy Consumption Report</Text>
          
          {/* User Information Section */}
          <View style={styles.userInfo}>
            <Text style={styles.userInfoTitle}>Report Analysis</Text>
            <Text style={styles.userInfoItem}>Name: {user.displayName || 'User'}</Text>
            <Text style={styles.userInfoItem}>Email: {user.email || 'Not provided'}</Text>
            <Text style={styles.userInfoItem}>Electricity Provider: {userData.electricityProvider || 'Not specified'}</Text>
            <Text style={styles.userInfoItem}>User Category: {userData.userCategory || 'Not specified'}</Text>
            <Text style={styles.userInfoItem}>Report Generated On: {new Date().toLocaleDateString()}</Text>
          </View>

          <Text style={styles.subtitle}>Executive Summary</Text>
          <Text style={styles.text}>
            Your monthly electricity bill is Rs. {detailedReport.executiveSummary.monthlyBill}
                </Text>
          <Text style={styles.text}>
            Your primary goal is to {detailedReport.executiveSummary.primaryGoal}
              </Text>
          <Text style={styles.text}>
            You have a {detailedReport.executiveSummary.energyProfile.type} energy profile with a storage capacity of {detailedReport.executiveSummary.energyProfile.storageCapacity} kWh and solar capacity of {detailedReport.executiveSummary.energyProfile.solarCapacity} kW
              </Text>
          <Text style={styles.text}>
            Your DISCOM is {detailedReport.executiveSummary.discom}
              </Text>

          <Text style={styles.subtitle}>Tariff Analysis</Text>
          <Text style={styles.text}>
            Your average power purchase cost is Rs. {detailedReport.tariffAnalysis.averagePowerPurchaseCost} per kWh
              </Text>
          <Text style={styles.text}>
            Your average cost of supply is Rs. {detailedReport.tariffAnalysis.averageCostOfSupply} per kWh
              </Text>
          <Text style={styles.text}>
            Your average billing rate is Rs. {detailedReport.tariffAnalysis.averageBillingRate} per kWh
              </Text>

          <Text style={styles.subtitle}>Consumption Analytics</Text>
          <Text style={styles.text}>
            Your energy usage is quite high, considering your solar installation and storage capacity
              </Text>
          <Text style={styles.text}>
            You have a peak demand of {detailedReport.consumptionAnalytics.peakDemand} kW during the {detailedReport.consumptionAnalytics.peakDemandTime}
                  </Text>
          <Text style={styles.text}>
            Your energy consumption is {detailedReport.consumptionAnalytics.consumptionPattern}, likely due to the usage of your {detailedReport.consumptionAnalytics.mainConsumers.join(" and ")}
              </Text>

          <Text style={styles.subtitle}>Solar Analysis</Text>
          <Text style={styles.text}>
            Your solar panels are {detailedReport.solarAnalysis.status}, but your solar capacity is relatively low compared to your energy demand
              </Text>
          <Text style={styles.text}>
            {detailedReport.solarAnalysis.potential}
                    </Text>

          <Text style={styles.subtitle}>Smart Devices Analysis</Text>
          <Text style={styles.text}>
            You have {detailedReport.smartDevicesAnalysis.installedDevices.map(device => device.name).join(" and ")} installed, which are energy-intensive appliances
              </Text>
          <Text style={styles.text}>
            You don't have any other smart devices installed, such as {detailedReport.smartDevicesAnalysis.missingDevices.join(" or ")}
                    </Text>

          <Text style={styles.subtitle}>Recommendations for Energy Efficiency</Text>
          {detailedReport.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendation}>
              <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
              <Text style={styles.text}>{recommendation.details}</Text>
            </View>
              ))}
            </View>
      </Page>
    </Document>
  );
};

export default PDFReport;

