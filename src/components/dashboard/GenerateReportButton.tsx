import { Button } from "@/components/ui/button";
import { Discom, TOUData, UserData, WeatherData } from "@/types/user";
import {
  Document,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { type User } from "firebase/auth";
import { BarChart3 } from "lucide-react";
import React from "react";

// Define styles for the PDF
const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { margin: 10, padding: 10 },
  header: { fontSize: 24, marginBottom: 10 },
  subheader: { fontSize: 18, marginTop: 10, marginBottom: 5 },
  text: { fontSize: 12, marginBottom: 5 },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: { margin: "auto", flexDirection: "row" },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: { margin: "auto", marginTop: 5, fontSize: 10 },
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

// PDF Document component
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
      <View style={styles.section}>
        <Text style={styles.header}>Energy Consumption Report</Text>
        <Text style={styles.text}>
          Generated on: {new Date().toLocaleString()}
        </Text>

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

        <Text style={styles.subheader}>Weather Information</Text>
        <Text style={styles.text}>Location: {weatherData.name}</Text>
        <Text style={styles.text}>Temperature: {weatherData.main.temp}°C</Text>
        <Text style={styles.text}>Humidity: {weatherData.main.humidity}%</Text>
        <Text style={styles.text}>
          Conditions: {weatherData.weather[0].description}
        </Text>

        <Text style={styles.subheader}>Energy Consumption Summary</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
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

        <Text style={styles.subheader}>DISCOM Information</Text>
        <Text style={styles.text}>DISCOM: {discomInfo.DISCOM}</Text>
        <Text style={styles.text}>State: {discomInfo.state}</Text>
        <Text style={styles.text}>Category: {discomInfo.category}</Text>
        <Text style={styles.text}>
          Connections: {discomInfo.connections ? discomInfo.connections : "N/A"}
        </Text>
        <Text style={styles.text}>Rating: {discomInfo.rating}</Text>

        <Text style={styles.subheader}>TOU Rate History</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
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
  if (!weatherData || !discomInfo || !userData) return null;

  return (
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
        <Button
          className="bg-green-600 text-white hover:bg-green-700"
          disabled={loading}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          {loading ? "Generating Report..." : "Generate Report"}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default GenerateReportButton;
