// types/user.ts
export interface UserData {
  hasSolarPanels: boolean;
  hasBatteryStorage: boolean;
  solarCapacity: number;
  storageCapacity: number;
  monthlyBill: number;
  electricityProvider: string;
}

export interface TOUData {
  timestamp: string;
  rate: number;
}

export interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
}

export interface Discom {
  State: string;
  DISCOM: string;
  "Total Number of consumers (Millions)": string;
  "Total Electricity Sales (MU)": string;
  "Total Revenue (Rs. Crore)": string;
  "AT&C Losses (%)": string;
  "Average power purchase cost (Rs./kWh)": string;
  "Average Cost of Supply (Rs./kWh)": string;
  "Average Billing Rate (Rs./kWh)": string;
  "Profit/(Loss) of the DISCOM (Rs. Crore)": string;
}

export interface EnergyData {
  SendDate: string;
  SolarPower: number;
  SolarEnergy: number;
  Consumption: number;
}

export interface ExecutiveSummary {
  currentMonthCost: number;
  costComparisonPercentage: number;
  costTrend: "up" | "down";
  totalEnergySavings: number;
  solarGeneration: number | null;
  batteryUsage: number | null;
  keyRecommendations: string[];
}

export interface TariffAnalysis {
  currentRate: number;
  averageRate: number;
  peakRate: number;
  offPeakRate: number;
  forecastedRates: Array<{ time: string; rate: number }>;
  savingsOpportunities: string[];
}

export interface ConsumptionAnalytics {
  totalConsumption: number;
  averageDailyConsumption: number;
  peakConsumptionTime: string;
  peakConsumptionValue: number;
  consumptionByTimeOfDay: Array<{ hour: number; average: number }>;
}

export interface SolarAnalysis {
  dailyGeneration: number;
  monthlyGeneration: number;
  efficiency: number;
  savingsFromSolar: number;
  potentialOptimizations: string[];
}
