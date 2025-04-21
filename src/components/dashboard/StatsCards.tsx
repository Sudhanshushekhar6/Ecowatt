"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SmartDevices, UserData, WeatherData } from "@/types/user";
import { useCopilotReadable } from "@copilotkit/react-core";
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
import React, { useState, useEffect } from "react";

const LocationWeatherDetails = ({
  weatherData,
}: {
  weatherData: WeatherData | null;
}) => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getLocationName = async (lat: number, lon: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      if (data.display_name) {
        setLocationName(data.display_name);
      }
    } catch (error) {
      console.error('Error fetching location name:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
    if (!currentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          setCurrentLocation(newLocation);
          getLocationName(newLocation.lat, newLocation.lon);
        },
        (error) => {
          setLocationError(error.message);
        }
      );
    }
  };

  if (!weatherData) return null;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <div 
          className="flex absolute top-2 right-2 items-center text-sm justify-end hover:text-foreground transition-colors"
          onClick={handleDialogOpen}
        >
          <div className="flex items-center justify-center gap-2 rounded-xl bg-background/90 backdrop-blur-sm p-2 shadow-lg hover:shadow-xl transition-all cursor-pointer border border group">
            <MapPinHouse className="text-green-600 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPinHouse className="text-green-600" />
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                Getting location...
              </span>
            ) : currentLocation ? (
              `Weather Details for ${locationName || 'Current Location'}`
            ) : (
              `Weather Details for ${weatherData.name}`
            )}
          </DialogTitle>
        </DialogHeader>
        <div>
          {locationError && (
            <div className="text-red-500 mb-4">
              <p>Location Error: {locationError}</p>
              <p className="text-sm">Showing weather for default location instead.</p>
            </div>
          )}
          <p>
            Weather conditions greatly affect energy consumption and tariff
            rates.
          </p>
          <div className="grid grid-cols-2 gap-6 mt-4">
            {[
              { label: "Temperature", value: `${weatherData?.main?.temp ?? "N/A"}°C` },
              { label: "Feels Like", value: `${weatherData?.main?.feels_like ?? "N/A"}°C` },
              { label: "Humidity", value: `${weatherData?.main?.humidity ?? "N/A"}%` },
              { label: "Wind Speed", value: `${weatherData?.wind?.speed ?? "N/A"} m/s` },
              { label: "Visibility", value: `${weatherData?.visibility ?? "N/A"} m` },
              { label: "Weather", value: weatherData?.weather?.[0]?.description ?? "N/A" },
            ].map((item, index) => (
              <div key={index} className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-semibold text-foreground">
                  {item.label}
                </p>
                <p className="text-lg mt-1">{item.value}</p>
              </div>
            ))}
          </div>
          {currentLocation && (
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Coordinates: {currentLocation.lat.toFixed(4)}°N, {currentLocation.lon.toFixed(4)}°E</p>
              {locationName && (
                <p className="mt-2">Location: {locationName}</p>
              )}
            </div>
          )}
        </div>
        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button className="w-full">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import { useRouter } from 'next/navigation';

const SmartDevicesDialog = ({
  smartDevices,
}: {
  smartDevices: SmartDevices;
}) => {
  // Device energy consumption data (kWh per use/cycle)
  const router = useRouter(); 
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
  
  const navigateToSchedule = () => {
    router.push('http://192.168.21.27'); // Replace with your actual IP address
  };
  return (
    <Dialog>
    <DialogTrigger asChild>
      <div className="absolute bottom-2 right-2 hidden sm:flex gap-2">
        <Button variant="outline" className="text-xs">
          View Devices
        </Button>
        <Button variant="secondary" onClick={navigateToSchedule} className="text-xs">
          Schedule
        </Button>
      </div>
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
        <div>
          <div className="space-y-6">
            {/* Device Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {devicesList.map((device, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border bg-muted ${
                    device.enabled
                      ? "border-green-300 dark:border-green-700/50"
                      : "border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <device.icon
                        className={`w-5 h-5 ${device.enabled ? "text-green-600" : "text-muted-foreground"}`}
                      />
                      <span
                        className={`font-medium font-semibold ${device.enabled ? "" : "text-muted-foreground"}`}
                      >
                        {device.name}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        device.enabled
                          ? "bg-green-100 text-green-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {device.enabled ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {device.enabled && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">
                            Energy per use
                          </p>
                          <p className="font-medium">
                            {device.energyPerUse} kWh
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Usage</p>
                          <p className="font-medium">{device.usageFrequency}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Monthly usage</p>
                          <p className="font-medium">
                            {device.monthlyUsage} kWh
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Monthly cost</p>
                          <p className="font-medium">₹{device.costPerMonth}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Summary Section */}
            <div className="mt-6 p-4 rounded-lg bg-muted border border">
              <h4 className="font-medium font-semibold mb-3">
                Combined Energy Analysis
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Active Devices
                  </p>
                  <p className="text-lg font-medium">{enabledDevices.length}</p>
                </div>
                <div className="p-3 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground">Monthly Usage</p>
                  <p className="text-lg font-medium">
                    {totalMonthlyUsage.toFixed(1)} kWh
                  </p>
                </div>
                <div className="p-3 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground">Daily Average</p>
                  <p className="text-lg font-medium">
                    {averageDaily.toFixed(1)} kWh
                  </p>
                </div>
                <div className="p-3 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground">Monthly Cost</p>
                  <p className="text-lg font-medium">₹{totalMonthlyCost}</p>
                </div>
              </div>
            </div>

            {smartDevices.other && (
              <div className="p-4 rounded-lg bg-muted border border">
                <p className="font-medium mb-2 font-semibold">
                  Other Connected Devices
                </p>
                <p className="text-sm text-muted-foreground">
                  {smartDevices.other}
                </p>
              </div>
            )}
          </div>
        </div>
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
    <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-green-100 dark:from-green-900/50 to-transparent opacity-50" />
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
        <div className="mt-2 text-xs bg-muted p-2 rounded-lg">
          <span className="font-medium">Battery Storage:</span>{" "}
          {userData.storageCapacity} kW
        </div>
      ),
    },
    {
      title: "Smart Home Setup",
      value:
        Object.values(userData.smartDevices).filter((v) => v === true).length +
        (userData.smartDevices.other
          ? userData.smartDevices.other.split(",").length
          : 0) +
        " Device(s)",
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
            <div className="text-xs bg-muted p-2 rounded-lg">
              Goal: {userData.primaryGoal}
            </div>
          )}
        </div>
      ),
    },
  ];

  useCopilotReadable({
    description:
      "Details about user's energy profile, including electricity provider, monthly bill, solar panels, battery storage, and primary goal",
    value: userData,
  });

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
