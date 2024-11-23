import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SmartDevices, UserData, WeatherData } from "@/types/user";
import {
  Car,
  ExternalLink,
  Home,
  Laptop,
  MapPinHouse,
  Power,
  Sun,
  Target,
  TrendingUp,
  Waves,
  Zap,
} from "lucide-react";
import React from "react";

const LocationWeatherDetails = ({
  weatherData,
}: {
  weatherData: WeatherData | null;
}) => {
  if (!weatherData) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex absolute top-2 right-2 items-center text-sm justify-end hover:text-foreground transition-colors">
          <div className="flex items-center justify-center gap-2 rounded-xl bg-white/90 backdrop-blur-sm p-2 shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-100 group">
            <MapPinHouse className="text-green-600 group-hover:scale-110 transition-transform" />
            <p className="font-medium">{weatherData.name}</p>
            <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPinHouse className="text-green-600" />
            Weather Details for {weatherData.name}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div className="grid grid-cols-2 gap-6 mt-4">
            {[
              { label: "Temperature", value: `${weatherData.main.temp}°C` },
              {
                label: "Feels Like",
                value: `${weatherData.main.feels_like}°C`,
              },
              { label: "Humidity", value: `${weatherData.main.humidity}%` },
              { label: "Wind Speed", value: `${weatherData.wind.speed} m/s` },
              { label: "Visibility", value: `${weatherData.visibility} m` },
              { label: "Weather", value: weatherData.weather[0].description },
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-semibold text-foreground">
                  {item.label}
                </p>
                <p className="text-lg mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </DialogDescription>
        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button className="w-full">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SmartDevicesDialog = ({
  smartDevices,
}: {
  smartDevices: SmartDevices;
}) => {
  // Device energy consumption data (kWh per use/cycle)
  const devicesList = [
    {
      name: "Thermostat",
      enabled: smartDevices.thermostat,
      icon: Home,
      energyPerUse: 1.5,
      usageFrequency: "24 hours/day",
      monthlyUsage: 36, // estimated monthly kWh
      tip: "Set to 24°C for optimal efficiency",
      peakHours: "2 PM - 6 PM",
      costPerMonth: 288, // estimated monthly cost in ₹
    },
    {
      name: "Washing Machine",
      enabled: smartDevices.washingMachine,
      icon: Waves,
      energyPerUse: 2.0,
      usageFrequency: "10 cycles/month",
      monthlyUsage: 20,
      tip: "Run full loads at off-peak hours",
      peakHours: "Morning/Evening",
      costPerMonth: 160,
    },
    {
      name: "Dishwasher",
      enabled: smartDevices.dishwasher,
      icon: Power,
      energyPerUse: 1.2,
      usageFrequency: "15 cycles/month",
      monthlyUsage: 18,
      tip: "Use eco mode for regular loads",
      peakHours: "After meals",
      costPerMonth: 144,
    },
    {
      name: "EV Charger",
      enabled: smartDevices.evCharger,
      icon: Car,
      energyPerUse: 10,
      usageFrequency: "12 charges/month",
      monthlyUsage: 120,
      tip: "Charge during solar peak or off-peak hours",
      peakHours: "Night-time",
      costPerMonth: 960,
    },
  ];

  const enabledDevices = devicesList.filter((device) => device.enabled);
  const totalMonthlyUsage = enabledDevices.reduce(
    (acc, device) => acc + device.monthlyUsage,
    0,
  );
  const totalMonthlyCost = enabledDevices.reduce(
    (acc, device) => acc + device.costPerMonth,
    0,
  );
  const averageDaily = totalMonthlyUsage / 30;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="absolute bottom-2 right-2 text-xs">
          View Devices
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Laptop className="text-green-600" />
            Smart Device Energy Analysis
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Monitor and optimize your smart device energy consumption
          </p>
        </DialogHeader>
        <DialogDescription>
          <div className="space-y-6">
            {/* Device Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {devicesList.map((device, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    device.enabled
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <device.icon
                        className={`w-5 h-5 ${device.enabled ? "text-green-600" : "text-gray-400"}`}
                      />
                      <span
                        className={`font-medium ${device.enabled ? "" : "text-gray-500"}`}
                      >
                        {device.name}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        device.enabled
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {device.enabled ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {device.enabled && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Energy per use</p>
                          <p className="font-medium">
                            {device.energyPerUse} kWh
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Usage</p>
                          <p className="font-medium">{device.usageFrequency}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Monthly usage</p>
                          <p className="font-medium">
                            {device.monthlyUsage} kWh
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Monthly cost</p>
                          <p className="font-medium">₹{device.costPerMonth}</p>
                        </div>
                      </div>
                      <div className="mt-2 text-xs bg-green-100/50 p-2 rounded">
                        <p className="font-medium text-green-800">
                          Energy Saving Tip:
                        </p>
                        <p className="text-green-700 mt-1">{device.tip}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Summary Section */}
            <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
              <h4 className="font-medium mb-3">Combined Energy Analysis</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-600">Active Devices</p>
                  <p className="text-lg font-medium">{enabledDevices.length}</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-600">Monthly Usage</p>
                  <p className="text-lg font-medium">
                    {totalMonthlyUsage.toFixed(1)} kWh
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-600">Daily Average</p>
                  <p className="text-lg font-medium">
                    {averageDaily.toFixed(1)} kWh
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-600">Monthly Cost</p>
                  <p className="text-lg font-medium">₹{totalMonthlyCost}</p>
                </div>
              </div>
            </div>

            {smartDevices.other && (
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="font-medium mb-2">Other Connected Devices</p>
                <p className="text-sm text-gray-600">{smartDevices.other}</p>
              </div>
            )}
          </div>
        </DialogDescription>
        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button className="w-full">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  highlight = null,
  trend = false,
  additionalInfo = null,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  highlight?: string | null;
  trend?: boolean;
  additionalInfo?: React.ReactNode;
}) => (
  <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
    <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-green-50 to-transparent opacity-50" />
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium flex items-center gap-2">
        {title}
        {trend && <TrendingUp className="w-4 h-4 text-green-600" />}
      </CardTitle>
      <Icon className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
    </CardHeader>
    <CardContent>
      <div className="flex flex-col gap-1">
        <div className="text-2xl font-bold flex items-center gap-2">
          {value}
          {highlight && (
            <span className="text-xs font-normal px-2 py-1 rounded-full bg-green-100 text-green-700">
              {highlight}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
        {additionalInfo}
      </div>
    </CardContent>
  </Card>
);

export default function StatsCards({
  userData,
  totalSolarPower,
  uniqueDays,
  weatherData,
}: {
  userData: UserData;
  totalSolarPower: number;
  uniqueDays: number;
  weatherData: WeatherData | null;
}) {
  const cards = [
    {
      title: "Current Battery Power",
      value: `${userData.currentBatteryPower?.toFixed(1) || 0} kW`,
      subtitle: `${totalSolarPower.toFixed(2)} kW produced in the past ${uniqueDays} days`,
      icon: Zap,
      highlight:
        userData.currentBatteryPower?.toFixed(1) ===
        userData.storageCapacity?.toString()
          ? "Full"
          : null,
      trend: true,
    },
    {
      title: "Energy System",
      value: userData.hasSolarPanels
        ? `${userData.solarCapacity} kW`
        : "No Solar",
      subtitle: userData.hasSolarPanels
        ? `Installed on ${new Date(userData.installationDate || "").toLocaleDateString()}`
        : "Consider installing solar panels",
      icon: Sun,
      additionalInfo: userData.hasBatteryStorage && (
        <div className="mt-2 text-xs bg-green-50 p-2 rounded-lg">
          <span className="font-medium">Battery Storage:</span>{" "}
          {userData.storageCapacity} kW
        </div>
      ),
    },
    {
      title: "Smart Home Setup",
      value:
        Object.values(userData.smartDevices).filter((v) => v === true).length +
        " Devices",
      subtitle: "Connected smart devices",
      icon: Laptop,
      additionalInfo: (
        <SmartDevicesDialog smartDevices={userData.smartDevices} />
      ),
    },
    {
      title: "Energy Goals",
      value: `₹${userData.monthlyBill}`,
      subtitle: "Monthly electricity bill",
      icon: Target,
      additionalInfo: (
        <div className="mt-2 flex flex-col gap-2">
          {userData.primaryGoal && (
            <div className="text-xs bg-green-50 p-2 rounded-lg">
              Goal: {userData.primaryGoal}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <React.Fragment key={index}>
          {index === 3 ? (
            <div className="relative h-full">
              <StatsCard {...card} />
              <LocationWeatherDetails weatherData={weatherData} />
            </div>
          ) : (
            <StatsCard {...card} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
