import {
  ConsumptionAnalytics,
  ExecutiveSummary,
  SolarAnalysis,
  TariffAnalysis,
} from "@/types/user";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { User } from "firebase/auth";

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: "#1a365d",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: "#2d3748",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  gridItem: {
    width: "50%",
    padding: 10,
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
  },
  listItem: {
    fontSize: 12,
    marginBottom: 5,
    color: "#4a5568",
  },
});

interface PDFReportProps {
  user: User;
  executiveSummary: ExecutiveSummary;
  tariffAnalysis: TariffAnalysis;
  consumptionAnalytics: ConsumptionAnalytics;
  solarAnalysis: SolarAnalysis | null;
}

const PDFReport = ({
  user,
  executiveSummary,
  tariffAnalysis,
  consumptionAnalytics,
  solarAnalysis,
}: PDFReportProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <Text style={styles.title}>Energy Report for {user.displayName}</Text>

      {/* Executive Summary Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Current Month's Cost</Text>
            <Text style={styles.value}>
              ₹{executiveSummary.currentMonthCost.toLocaleString()}
            </Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Cost Trend</Text>
            <Text style={styles.value}>
              {executiveSummary.costTrend === "up" ? "↑" : "↓"}{" "}
              {Math.abs(executiveSummary.costComparisonPercentage)}%
            </Text>
          </View>
          {executiveSummary.solarGeneration && (
            <View style={styles.gridItem}>
              <Text style={styles.label}>Solar Generation</Text>
              <Text style={styles.value}>
                {executiveSummary.solarGeneration} kWh
              </Text>
            </View>
          )}
          {executiveSummary.batteryUsage && (
            <View style={styles.gridItem}>
              <Text style={styles.label}>Battery Usage</Text>
              <Text style={styles.value}>
                {executiveSummary.batteryUsage} kWh
              </Text>
            </View>
          )}
        </View>
        {executiveSummary.keyRecommendations.length > 0 && (
          <View style={styles.list}>
            {executiveSummary.keyRecommendations.map((rec, index) => (
              <Text key={index} style={styles.listItem}>
                • {rec}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Tariff Analysis Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tariff Analysis</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Current Rate</Text>
            <Text style={styles.value}>₹{tariffAnalysis.currentRate}/kWh</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Average Rate</Text>
            <Text style={styles.value}>₹{tariffAnalysis.averageRate}/kWh</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Peak Rate</Text>
            <Text style={styles.value}>₹{tariffAnalysis.peakRate}/kWh</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Off-Peak Rate</Text>
            <Text style={styles.value}>₹{tariffAnalysis.offPeakRate}/kWh</Text>
          </View>
        </View>
        {tariffAnalysis.savingsOpportunities.length > 0 && (
          <View style={styles.list}>
            {tariffAnalysis.savingsOpportunities.map((opportunity, index) => (
              <Text key={index} style={styles.listItem}>
                • {opportunity}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Consumption Analytics Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consumption Analytics</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Total Consumption</Text>
            <Text style={styles.value}>
              {consumptionAnalytics.totalConsumption} kWh
            </Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Daily Average</Text>
            <Text style={styles.value}>
              {consumptionAnalytics.averageDailyConsumption} kWh
            </Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Peak Consumption</Text>
            <Text style={styles.value}>
              {consumptionAnalytics.peakConsumptionValue} kW
            </Text>
            <Text style={styles.label}>
              at{" "}
              {new Date(
                consumptionAnalytics.peakConsumptionTime,
              ).toLocaleTimeString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Solar Analysis Section */}
      {solarAnalysis && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Solar Analysis</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Daily Generation</Text>
              <Text style={styles.value}>
                {solarAnalysis.dailyGeneration} kWh
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Monthly Generation</Text>
              <Text style={styles.value}>
                {solarAnalysis.monthlyGeneration} kWh
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>System Efficiency</Text>
              <Text style={styles.value}>{solarAnalysis.efficiency}%</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Monthly Savings</Text>
              <Text style={styles.value}>
                ₹{solarAnalysis.savingsFromSolar}
              </Text>
            </View>
          </View>
          {solarAnalysis.potentialOptimizations.length > 0 && (
            <View style={styles.list}>
              {solarAnalysis.potentialOptimizations.map(
                (optimization, index) => (
                  <Text key={index} style={styles.listItem}>
                    • {optimization}
                  </Text>
                ),
              )}
            </View>
          )}
        </View>
      )}
    </Page>
  </Document>
);

export default PDFReport;
