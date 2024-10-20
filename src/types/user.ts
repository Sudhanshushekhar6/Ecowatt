// types/user.ts
export interface UserData {
  uid: string;
  email: string;
  name: string;
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
  DISCOM: string;
  state: string;
  category: string;
  connections: number;
  rating: string;
}
