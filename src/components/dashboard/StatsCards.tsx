// components/dashboard/StatsCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserData } from "@/types/user";
import { Battery, MapPinHouse, Sun, Zap } from "lucide-react";

interface StatsCardsProps {
  userData: UserData;
  totalSolarPower: number;
  uniqueDays: number;
  locationName: string;
  weatherData: any;
}

const LocationWeatherDetails = ({ location }: { location: string }) => (
  <div className="flex absolute top-[-10px] right-[-10px] items-center text-sm justify-end text-muted-foreground hover:text-foreground">
    <div className="flex items-center justify-center gap-2 rounded-lg bg-white p-2 shadow-md">
      <MapPinHouse />
      <p>{location}</p>
    </div>
  </div>
);

export default function StatsCards({
  userData,
  totalSolarPower,
  uniqueDays,
  locationName,
}: StatsCardsProps) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Energy Produced
          </CardTitle>
          <Zap className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalSolarPower.toFixed(2)} kWh
          </div>
          <p className="text-xs mb-1 text-muted-foreground">
            in the past {uniqueDays} days
          </p>
          <p className="text-xs text-muted-foreground">100% from solar</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Battery Status</CardTitle>
          <Battery className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {userData.hasBatteryStorage
              ? `${userData.storageCapacity} kW`
              : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            {userData.hasBatteryStorage
              ? "Total Battery Capacity"
              : "No battery storage"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Solar System</CardTitle>
          <Sun className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {userData.hasSolarPanels ? `${userData.solarCapacity} kW` : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            {userData.hasSolarPanels ? "System Capacity" : "No solar panels"}
          </p>
        </CardContent>
      </Card>

      <Card className="relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Bill</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{userData.monthlyBill}</div>
          <p className="text-xs text-muted-foreground">
            Average monthly electricity bill
          </p>
          <LocationWeatherDetails location={locationName} />
        </CardContent>
      </Card>
    </div>
  );
}
