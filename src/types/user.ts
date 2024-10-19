type UserData = {
  hasBatteryStorage: boolean;
  storageCapacity?: number;
  hasSolarPanels: boolean;
  solarCapacity?: number;
  monthlyBill: number;
  primaryGoal: string;
  smartDevices: {
    thermostat: boolean;
    washingMachine: boolean;
    dishwasher: boolean;
    evCharger: boolean;
    other?: string;
  };
};
