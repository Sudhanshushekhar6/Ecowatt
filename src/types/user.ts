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
  discomInfo?: DiscomInfo;
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
  monthlyBill: number;
  primaryGoal: string;
  energyProfile: {
    type: string;
    storageCapacity: number;
    solarCapacity: number;
  };
  discom: string;
}

export interface TariffAnalysis {
  averagePowerPurchaseCost: number;
  averageCostOfSupply: number;
  averageBillingRate: number;
}

export interface ConsumptionAnalytics {
  peakDemand: number;
  peakDemandTime: string;
  consumptionPattern: string;
  mainConsumers: string[];
}

export interface SolarAnalysis {
  status: string;
  capacity: number;
  potential: string;
}

export interface SmartDevicesAnalysis {
  installedDevices: Array<{
    name: string;
    type: string;
  }>;
  missingDevices: string[];
}

export interface Recommendation {
  title: string;
  details: string;
}

export interface DetailedReport {
  executiveSummary: ExecutiveSummary;
  tariffAnalysis: TariffAnalysis;
  consumptionAnalytics: ConsumptionAnalytics;
  solarAnalysis: SolarAnalysis;
  smartDevicesAnalysis: SmartDevicesAnalysis;
  recommendations: Recommendation[];
}

export interface DiscomInfo {
  name: string;
  // Add other discom-related properties as needed
}
