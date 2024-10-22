import { User } from "firebase/auth";
import {
  Discom,
  EnergyData,
  TOUData,
  UserData,
  WeatherData,
} from "../types/user";

// Enhanced interfaces for the report sections
interface ExecutiveSummary {
  currentMonthCost: number;
  costComparisonPercentage: number;
  costTrend: "up" | "down";
  totalEnergySavings: number;
  solarGeneration: number | null;
  batteryUsage: number | null;
  keyRecommendations: string[];
}

interface TariffAnalysis {
  currentRate: number;
  averageRate: number;
  peakRate: number;
  offPeakRate: number;
  forecastedRates: Array<{ time: string; rate: number }>;
  savingsOpportunities: string[];
}

interface ConsumptionAnalytics {
  totalConsumption: number;
  averageDailyConsumption: number;
  peakConsumptionTime: string;
  peakConsumptionValue: number;
  consumptionByTimeOfDay: Array<{ hour: number; average: number }>;
}

interface SolarAnalysis {
  dailyGeneration: number;
  monthlyGeneration: number;
  efficiency: number;
  savingsFromSolar: number;
  potentialOptimizations: string[];
}

// Calculate executive summary without API call
function calculateExecutiveSummary(
  energyData: EnergyData[],
  touData: TOUData[],
  userData: UserData,
): ExecutiveSummary {
  // Get current and previous month's data
  const now = new Date();
  const currentMonthData = energyData.filter((data) => {
    const date = new Date(data.SendDate);
    return date.getMonth() === now.getMonth();
  });

  const previousMonthData = energyData.filter((data) => {
    const date = new Date(data.SendDate);
    return date.getMonth() === now.getMonth() - 1;
  });

  // Calculate costs
  const averageRate =
    touData.reduce((sum, data) => sum + data.rate, 0) / touData.length;

  const currentMonthCost = currentMonthData.reduce(
    (sum, data) => sum + data.Consumption * averageRate,
    0,
  );

  const previousMonthCost = previousMonthData.reduce(
    (sum, data) => sum + data.Consumption * averageRate,
    0,
  );

  // Calculate solar generation if applicable
  const solarGeneration = userData.hasSolarPanels
    ? currentMonthData.reduce((sum, data) => sum + data.SolarEnergy, 0)
    : null;

  // Calculate cost comparison
  const costComparisonPercentage = previousMonthCost
    ? ((currentMonthCost - previousMonthCost) / previousMonthCost) * 100
    : 0;

  // Calculate energy savings from solar
  const totalEnergySavings = solarGeneration
    ? solarGeneration * averageRate
    : 0;

  return {
    currentMonthCost: parseFloat(currentMonthCost.toFixed(2)),
    costComparisonPercentage: parseFloat(costComparisonPercentage.toFixed(2)),
    costTrend: costComparisonPercentage > 0 ? "up" : "down",
    totalEnergySavings: parseFloat(totalEnergySavings.toFixed(2)),
    solarGeneration: solarGeneration
      ? parseFloat(solarGeneration.toFixed(2))
      : null,
    batteryUsage: userData.hasBatteryStorage ? userData.storageCapacity : null,
    keyRecommendations: [], // Will be populated after analysis
  };
}

// Generate tariff analysis
async function generateTariffAnalysis(
  touData: TOUData[],
  discomData: Discom,
): Promise<TariffAnalysis> {
  const prompt = `Analyze the following Time of Use (TOU) data and DISCOM information:
    TOU Data: ${JSON.stringify(touData)}
    DISCOM Info: ${JSON.stringify(discomData)}
    
    Provide:
    1. Peak and off-peak rate analysis
    2. Rate forecasting for next 24 hours
    3. Specific savings opportunities based on rate patterns`;

  const response = await fetchAIResponse(prompt);

  // Calculate basic metrics ourselves
  const rates = touData.map((t) => t.rate);
  const averageRate = rates.reduce((a, b) => a + b, 0) / rates.length;
  const peakRate = Math.max(...rates);
  const offPeakRate = Math.min(...rates);

  return {
    currentRate: parseFloat(discomData["Average Billing Rate (Rs./kWh)"]),
    averageRate: parseFloat(averageRate.toFixed(2)),
    peakRate: parseFloat(peakRate.toFixed(2)),
    offPeakRate: parseFloat(offPeakRate.toFixed(2)),
    forecastedRates: response.forecasted_rates || [],
    savingsOpportunities: response.opportunities || [],
  };
}

// Generate consumption analytics
async function generateConsumptionAnalytics(
  energyData: EnergyData[],
  weatherData: WeatherData,
): Promise<ConsumptionAnalytics> {
  // Calculate basic metrics
  const total = energyData.reduce((sum, data) => sum + data.Consumption, 0);
  const daily = total / energyData.length;

  // Find peak consumption
  const peakConsumption = energyData.reduce(
    (max, data) =>
      data.Consumption > max.consumption
        ? { time: data.SendDate, consumption: data.Consumption }
        : max,
    { time: "", consumption: 0 },
  );

  // Group consumption by hour
  const hourlyConsumption = energyData.reduce(
    (acc, data) => {
      const hour = new Date(data.SendDate).getHours();
      if (!acc[hour]) acc[hour] = [];
      acc[hour].push(data.Consumption);
      return acc;
    },
    {} as Record<number, number[]>,
  );

  // Calculate hourly averages
  const hourlyAverages = Object.entries(hourlyConsumption).map(
    ([hour, values]) => ({
      hour: parseInt(hour),
      average: values.reduce((a, b) => a + b, 0) / values.length,
    }),
  );

  return {
    totalConsumption: parseFloat(total.toFixed(2)),
    averageDailyConsumption: parseFloat(daily.toFixed(2)),
    peakConsumptionTime: peakConsumption.time,
    peakConsumptionValue: parseFloat(peakConsumption.consumption.toFixed(2)),
    consumptionByTimeOfDay: hourlyAverages,
  };
}

// Generate solar analysis if applicable
async function generateSolarAnalysis(
  energyData: EnergyData[],
  userData: UserData,
  weatherData: WeatherData,
): Promise<SolarAnalysis | null> {
  if (!userData.hasSolarPanels) return null;

  const dailyGeneration =
    energyData.reduce((sum, data) => sum + data.SolarEnergy, 0) /
    energyData.length;

  const monthlyGeneration = dailyGeneration * 30;

  // Calculate efficiency (actual vs theoretical based on capacity)
  const theoreticalDaily = userData.solarCapacity * 5.5; // Assuming 5.5 peak sun hours
  const efficiency = (dailyGeneration / theoreticalDaily) * 100;

  return {
    dailyGeneration: parseFloat(dailyGeneration.toFixed(2)),
    monthlyGeneration: parseFloat(monthlyGeneration.toFixed(2)),
    efficiency: parseFloat(efficiency.toFixed(2)),
    savingsFromSolar: parseFloat(
      (monthlyGeneration * parseFloat(userData.monthlyBill.toString())).toFixed(
        2,
      ),
    ),
    potentialOptimizations: [], // Will be populated by AI response
  };
}

// Helper function for AI API calls
async function fetchAIResponse(prompt: string) {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-groq-70b-8192-tool-use-preview",
        messages: [
          {
            role: "system",
            content:
              "You are an energy analysis expert. Provide detailed insights in JSON format.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    },
  );

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

// Main report generation function
export async function generateReport(
  user: User,
  userData: UserData,
  touData: TOUData[],
  weatherData: WeatherData,
  discomData: Discom,
  energyData: EnergyData[],
): Promise<{
  executiveSummary: ExecutiveSummary;
  tariffAnalysis: TariffAnalysis;
  consumptionAnalytics: ConsumptionAnalytics;
  solarAnalysis: SolarAnalysis | null;
}> {
  try {
    // Generate executive summary first (no API call)
    const executiveSummary = calculateExecutiveSummary(
      energyData,
      touData,
      userData,
    );

    // Generate all other sections in parallel
    const [tariffAnalysis, consumptionAnalytics, solarAnalysis] =
      await Promise.all([
        generateTariffAnalysis(touData, discomData),
        generateConsumptionAnalytics(energyData, weatherData),
        userData.hasSolarPanels
          ? generateSolarAnalysis(energyData, userData, weatherData)
          : Promise.resolve(null),
      ]);

    // Update executive summary recommendations based on all analyses
    executiveSummary.keyRecommendations = [
      ...tariffAnalysis.savingsOpportunities.slice(0, 2),
      ...(solarAnalysis?.potentialOptimizations.slice(0, 2) || []),
    ];

    return {
      executiveSummary,
      tariffAnalysis,
      consumptionAnalytics,
      solarAnalysis,
    };
  } catch (error) {
    console.error("Error generating report:", error);
    throw new Error("Failed to generate complete report");
  }
}
