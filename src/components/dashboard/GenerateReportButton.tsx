import { Button } from "@/components/ui/button";
import { generateReport } from "@/lib/ai";
import { Discom, TOUData, UserData, WeatherData } from "@/types/user";
import {
  Document,
  Image,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { type User } from "firebase/auth";
import { BarChart3, Download, Settings } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

// Define styles for the PDF
const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: "Helvetica" },
  section: { marginBottom: 20 },
  header: {
    fontSize: 24,
    marginBottom: 20,
    color: "#2c3e50",
    textAlign: "center",
  },
  subheader: {
    fontSize: 18,
    marginTop: 15,
    marginBottom: 10,
    color: "#34495e",
    borderBottom: "1 solid #bdc3c7",
  },
  text: { fontSize: 12, marginBottom: 5, color: "#2c3e50" },
  table: { width: "auto", marginTop: 10, marginBottom: 10 },
  tableRow: { flexDirection: "row", borderBottom: "1 solid #bdc3c7" },
  tableHeader: { backgroundColor: "#ecf0f1", fontWeight: "bold" },
  tableCol: { width: "25%", padding: 5 },
  tableCell: { fontSize: 10, color: "#2c3e50" },
  logo: { width: 50, height: 50, marginBottom: 20, alignSelf: "center" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#7f8c8d",
  },
});

interface EnergyData {
  SendDate: string;
  SolarPower: number;
  SolarEnergy: number;
  Consumption: number;
}

interface MyDocumentProps {
  user: User;
  userData: UserData;
  energyData: EnergyData[];
  weatherData: WeatherData;
  discomInfo: Discom;
  touHistory: TOUData[];
}

const MyDocument: React.FC<MyDocumentProps> = ({
  user,
  userData,
  energyData,
  weatherData,
  discomInfo,
  touHistory,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Image src="icon.svg" style={styles.logo} />
      <Text style={styles.header}>Energy Consumption Report</Text>

      <View style={styles.section}>
        <Text style={styles.subheader}>User Information</Text>
        <Text style={styles.text}>Name: {user.displayName}</Text>
        <Text style={styles.text}>Email: {user.email}</Text>
        <Text style={styles.text}>
          Electricity Provider: {userData.electricityProvider}
        </Text>
        <Text style={styles.text}>
          Solar Capacity: {userData.solarCapacity} kW
        </Text>
        <Text style={styles.text}>
          Storage Capacity: {userData.storageCapacity} kWh
        </Text>
        <Text style={styles.text}>Monthly Bill: ₹{userData.monthlyBill}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subheader}>Weather Information</Text>
        <Text style={styles.text}>Location: {weatherData.name}</Text>
        <Text style={styles.text}>Temperature: {weatherData.main.temp}°C</Text>
        <Text style={styles.text}>Humidity: {weatherData.main.humidity}%</Text>
        <Text style={styles.text}>
          Conditions: {weatherData.weather[0].description}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subheader}>Energy Consumption Summary</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Date</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Solar Power (kW)</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Solar Energy (kWh)</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Consumption (kW)</Text>
            </View>
          </View>
          {energyData.slice(0, 5).map((data, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{data.SendDate}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {data.SolarPower.toFixed(2)}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {data.SolarEnergy.toFixed(2)}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {data.Consumption.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subheader}>DISCOM Information</Text>
        <Text style={styles.text}>DISCOM: {discomInfo["DISCOM"]}</Text>
        <Text style={styles.text}>State: {discomInfo["State"]}</Text>
        <Text style={styles.text}>
          Total Number of consumers:{" "}
          {discomInfo["Total Number of consumers (Millions)"]} Million
        </Text>
        <Text style={styles.text}>
          Total Electricity Sales: {discomInfo["Total Electricity Sales (MU)"]}{" "}
          MU
        </Text>
        <Text style={styles.text}>
          Total Revenue: ₹{discomInfo["Total Revenue (Rs. Crore)"]} Crore
        </Text>
        <Text style={styles.text}>
          AT&C Losses: {discomInfo["AT&C Losses (%)"]}%
        </Text>
        <Text style={styles.text}>
          Average power purchase cost: ₹
          {discomInfo["Average power purchase cost (Rs./kWh)"]} /kWh
        </Text>
        <Text style={styles.text}>
          Average Cost of Supply: ₹
          {discomInfo["Average Cost of Supply (Rs./kWh)"]} /kWh
        </Text>
        <Text style={styles.text}>
          Average Billing Rate: ₹{discomInfo["Average Billing Rate (Rs./kWh)"]}{" "}
          /kWh
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subheader}>TOU Rate History</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Time</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Rate (₹/kWh)</Text>
            </View>
          </View>
          {touHistory.slice(-5).map((data, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {new Date(data.timestamp).toLocaleTimeString()}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{data.rate.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.footer}>
        Generated on: {new Date().toLocaleString()} | Page 1 of 1
      </Text>
    </Page>
  </Document>
);

interface GenerateReportButtonProps {
  user: User;
  userData: UserData;
  energyData: EnergyData[];
  weatherData: WeatherData | null;
  discomInfo: Discom | null;
  touHistory: TOUData[];
}

const GenerateReportButton: React.FC<GenerateReportButtonProps> = ({
  user,
  userData,
  energyData,
  weatherData,
  discomInfo,
  touHistory,
}) => {
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    if (!weatherData || !discomInfo || !userData) return;

    setIsGenerating(true);
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
      alert(
        "An error occurred while generating the report. Please try again later.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (!weatherData || !discomInfo || !userData) return null;

  return (
    <div className="w-full">
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

      {report && (
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h2 className="text-2xl font-bold mb-4">Generated Report</h2>
          <p className="whitespace-pre-wrap">{report}</p>
          <PDFDownloadLink
            document={
              <MyDocument
                user={user}
                userData={userData}
                energyData={energyData}
                weatherData={weatherData}
                discomInfo={discomInfo}
                touHistory={touHistory}
              />
            }
            fileName="energy_consumption_report.pdf"
          >
            {/* @ts-ignore */}
            {({ blob, url, loading, error }) => (
              <Button className="mt-4" disabled={loading} variant={`outline`}>
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
