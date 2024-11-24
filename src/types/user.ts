// types/user.ts

export interface SmartDevices {
  thermostat: boolean;
  washingMachine: boolean;
  dishwasher: boolean;
  evCharger: boolean;
  other: string;
}

export interface UserData {
  electricityProvider: string;
  monthlyBill: number;
  hasSolarPanels: boolean;
  solarCapacity: number | null;
  userCategory: "domestic" | "non_domestic" | "industry" | null;
  installationDate: string | null;
  hasBatteryStorage: boolean;
  storageCapacity: string;
  smartDevices: SmartDevices;
  primaryGoal: string | null;
  notificationMethod: "email" | "push" | "sms" | "none" | null;
  reportFrequency: "daily" | "weekly" | "monthly" | null;
  currentBatteryPower?: number;
}

export interface TOUData {
  timestamp: string;
  rate: number;
  category: "DOMESTIC" | "NON_DOMESTIC" | "INDUSTRIAL";
}

export interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  visibility: number;
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
  keyRecommendations: Array<{
    text: string;
    priority: "high" | "medium" | "low";
    estimatedImpact: string;
  }>;
}

export interface TariffAnalysis {
  currentRate: number;
  averageRate: number;
  peakRate: number;
  offPeakRate: number;
  forecastedRates: Array<{
    time: string;
    rate: number;
  }>;
  savingsOpportunities: string[];
  patternAnalysis: string;
}

export interface ConsumptionAnalytics {
  totalConsumption: number;
  averageDailyConsumption: number;
  peakConsumptionTime: string;
  peakConsumptionValue: number;
  consumptionByTimeOfDay: Array<{
    hour: number;
    average: number;
  }>;
  unusualPatterns?: string[];
  weatherImpact?: string;
  optimizationOpportunities?: string[];
  timeOfDayRecommendations?: string[];
}

export interface SolarAnalysis {
  dailyGeneration: number;
  monthlyGeneration: number;
  efficiency: number;
  savingsFromSolar: number;
  optimizations: string[];
  maintenance_tasks: string[];
  weather_impact: string;
  storage_tips: string[];
}

export interface SmartDevicesAnalysis {
  deviceSchedules: {
    deviceName: string;
    optimalHours: number[];
    expectedSavings: number;
    currentUsagePattern: string;
    recommendedPattern: string;
    reasonForRecommendation: string;
  }[];
  totalPotentialSavings: number;
  generalRecommendations: string[];
  automationOpportunities: string[];
  peakUsageWarnings: string[];
  deviceIntegrationTips: string[];
}
