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
import { UserData, WeatherData } from "@/types/user";
import {
  Battery,
  ExternalLink,
  MapPinHouse,
  Sun,
  TrendingUp,
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

const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  highlight = null,
  trend = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  highlight?: string | null;
  trend?: boolean;
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
      title: "Battery Status",
      value: userData.hasBatteryStorage
        ? `${userData.storageCapacity} kW`
        : "N/A",
      subtitle: userData.hasBatteryStorage
        ? "Total Battery Capacity"
        : "No battery storage",
      icon: Battery,
    },
    {
      title: "Solar System Capacity",
      value: userData.hasSolarPanels ? `${userData.solarCapacity} kW` : "N/A",
      subtitle: "Capacity of Solar Panels",
      icon: Sun,
    },
    {
      title: "Monthly Bill",
      value: `₹${userData.monthlyBill}`,
      subtitle: "Average monthly electricity bill",
      icon: TrendingUp,
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
