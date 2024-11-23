import {
  ConsumptionAnalytics,
  Discom,
  EnergyData,
  ExecutiveSummary,
  SolarAnalysis,
  TariffAnalysis,
  TOUData,
  UserData,
  WeatherData,
} from "@/types/user";
import Instructor from "@instructor-ai/instructor";
import Groq from "groq-sdk";
import { z } from "zod";
import { groupDataByDay } from "./utils";

const groqClient = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

const client = Instructor({
  client: groqClient,
  mode: "FUNCTIONS",
});

const executiveSummarySchema = z.object({
  recommendations: z.array(
    z.object({
      text: z.string(),
      priority: z.enum(["high", "medium", "low"]),
      estimatedImpact: z.string(),
      potentialMonthlySavings: z.string().optional(),
      implementationEffort: z.enum(["low", "medium", "high"]).optional(),
    }),
  ),
});

const tariffAnalysisSchema = z.object({
  forecasted_rates: z.array(
    z.object({
      time: z.string(),
      rate: z.number(),
      variationPercentage: z.number().optional(),
    }),
  ),
  savings_opportunities: z.array(z.string()),
  pattern_analysis: z.string(),
  peak_to_off_peak_ratio: z.number().optional(),
});

const consumptionAnalysisSchema = z.object({
  totalConsumption: z.number(),
  averageDailyConsumption: z.number(),
  peakConsumptionTime: z.string(),
  peakConsumptionValue: z.number(),
  consumptionByTimeOfDay: z.array(
    z.object({
      hour: z.number(),
      average: z.number(),
      varianceFromMean: z.number().optional(),
    }),
  ),
  unusualPatterns: z.array(z.string()),
  weatherImpact: z.string(),
  weatherCorrectedConsumption: z.number().optional(),
  optimizationOpportunities: z.array(z.string()),
  potentialAnnualSavings: z.number().optional(),
  timeOfDayRecommendations: z.array(z.string()),
});

const solarAnalysisSchema = z.object({
  optimizations: z.array(z.string()),
  maintenance_tasks: z.array(z.string()),
  weather_impact: z.string(),
  storage_tips: z.array(z.string()),
  degradationRate: z.number().optional(),
  potentialUpgradeBenefits: z
    .array(
      z.object({
        type: z.string(),
        estimatedAnnualSavings: z.number(),
        implementationCost: z.number().optional(),
      }),
    )
    .optional(),
});

const SYSTEM_PROMPT = `You are an advanced energy analytics expert with deep expertise in:
- Residential and commercial energy consumption patterns
- Solar power systems and battery storage optimization
- Time-of-use electricity pricing and tariff structures
- Weather impact on energy usage
- Energy-saving recommendations and ROI calculations

Follow these guidelines for all responses:
1. Always support recommendations with specific data points and calculations
2. Provide numerical estimates for potential savings
3. Consider local context (weather, tariffs, infrastructure)
4. Focus on actionable, prioritized insights
5. Include both immediate actions and long-term strategies
6. Explain the reasoning behind each recommendation
7. Reference industry benchmarks when available

Response requirements:
- Use precise numerical values instead of ranges where possible
- Include confidence levels for predictions
- Prioritize recommendations by ROI
- Consider implementation complexity
- Account for seasonal variations
- Factor in peak vs. off-peak timing`;

async function fetchAIResponse(prompt: string, schema: any): Promise<any> {
  try {
    const response = await client.chat.completions.create({
      model: "llama-3.2-90b-text-preview",
      max_tokens: 4096,
      temperature: 0.7,
      top_p: 0.9,
      response_model: { schema: schema, name: "response" },
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        { role: "user", content: prompt },
      ],
    });

    return response;
  } catch (error) {
    console.error("AI API call failed:", error);
    return null;
  }
}

async function calculateExecutiveSummary(
  energyData: EnergyData[],
  touData: TOUData[],
  userData: UserData,
  weatherData: WeatherData,
): Promise<ExecutiveSummary> {
  const dataByDay = groupDataByDay(energyData);
  const days = Array.from(dataByDay.keys()).sort();
  const latestDay = days[days.length - 1];
  const previousDay = days[days.length - 2];

  const currentDayData = dataByDay.get(latestDay) || [];
  const previousDayData = dataByDay.get(previousDay) || [];

  const averageRate =
    touData.reduce((sum, data) => sum + data.rate, 0) / touData.length;
  const calculateDayCost = (dayData: EnergyData[]) =>
    dayData.reduce((sum, data) => sum + data.Consumption * averageRate, 0);

  const currentDayCost = calculateDayCost(currentDayData);
  const previousDayCost = calculateDayCost(previousDayData);
  const costComparisonPercentage = previousDayCost
    ? ((currentDayCost - previousDayCost) / previousDayCost) * 100
    : 0;

  const solarGeneration = userData.hasSolarPanels
    ? currentDayData.reduce((sum, data) => sum + (data.SolarEnergy || 0), 0)
    : null;

  const totalEnergySavings = solarGeneration
    ? solarGeneration * averageRate
    : 0;

  // Get AI recommendations based on all available data
  const aiPrompt = `
    Analyze household energy metrics and provide actionable recommendations:

    CONSUMPTION METRICS:
    - Cost trend: ${costComparisonPercentage.toFixed(2)}% ${costComparisonPercentage > 0 ? "increase" : "decrease"}
    - Current day cost: ${currentDayCost.toFixed(2)}
    - Previous day cost: ${previousDayCost.toFixed(2)}

    ENERGY INFRASTRUCTURE:
    - Solar installed: ${userData.hasSolarPanels ? "Yes" : "No"}
    - Solar capacity: ${userData.hasSolarPanels ? userData.solarCapacity + " kW" : "N/A"}
    - Battery storage: ${userData.hasBatteryStorage ? userData.storageCapacity + " kWh" : "No"}
    - Monthly bill: ${userData.monthlyBill} Rs
    - Electricity provider: ${userData.electricityProvider}

    WEATHER CONDITIONS:
    - Temperature: ${weatherData.main.temp}°C
    - Humidity: ${weatherData.main.humidity}%
    - Weather: ${weatherData.weather[0].main}
    - Description: ${weatherData.weather[0].description}

    Based on this data, provide recommendations that:
    1. Address the most impactful cost-saving opportunities
    2. Consider existing infrastructure (solar/battery if present)
    3. Account for current weather conditions
    4. Can be implemented immediately
    5. Have measurable impact on energy costs
  `;

  const aiResponse = await fetchAIResponse(aiPrompt, executiveSummarySchema);

  const recommendations: {
    text: string;
    priority: "high" | "medium" | "low";
    estimatedImpact: string;
  }[] = aiResponse?.recommendations ? aiResponse.recommendations : [];

  return {
    currentMonthCost: parseFloat(currentDayCost.toFixed(2)),
    costComparisonPercentage: parseFloat(costComparisonPercentage.toFixed(2)),
    costTrend: costComparisonPercentage > 0 ? "up" : "down",
    totalEnergySavings: parseFloat(totalEnergySavings.toFixed(2)),
    solarGeneration: solarGeneration
      ? parseFloat(solarGeneration.toFixed(2))
      : null,
    batteryUsage: userData.hasBatteryStorage
      ? parseFloat(userData.storageCapacity)
      : null,
    keyRecommendations: recommendations,
  };
}

async function generateTariffAnalysis(
  touData: TOUData[],
  discomData: Discom,
): Promise<TariffAnalysis> {
  const rates = touData.map((t) => t.rate);
  const averageRate = rates.reduce((a, b) => a + b, 0) / rates.length;
  const peakRate = Math.max(...rates);
  const offPeakRate = Math.min(...rates);

  const aiPrompt = `
    Analyze electricity tariffs and identify cost-saving opportunities:

    CURRENT TARIFF METRICS:
    - Average rate: ${averageRate.toFixed(2)} Rs/kWh
    - Peak rate: ${peakRate.toFixed(2)} Rs/kWh
    - Off-peak rate: ${offPeakRate.toFixed(2)} Rs/kWh

    UTILITY PROVIDER DETAILS:
    - State: ${discomData.State}
    - DISCOM: ${discomData.DISCOM}
    - Consumer base: ${discomData["Total Number of consumers (Millions)"]} million
    - Power purchase cost: ${discomData["Average power purchase cost (Rs./kWh)"]} Rs/kWh
    - Supply cost: ${discomData["Average Cost of Supply (Rs./kWh)"]} Rs/kWh
    - Billing rate: ${discomData["Average Billing Rate (Rs./kWh)"]} Rs/kWh
    - AT&C losses: ${discomData["AT&C Losses (%)"]}%

    TIME OF USE PATTERNS:
    ${touData.map((t) => `- ${new Date(t.timestamp).toLocaleTimeString()}: ${t.rate} Rs/kWh`).join("\n    ")}

    Analyze the data and return a JSON response following these strict requirements:

    1. Provide forecasted rates for each hour that MUST vary throughout the day:
    - Early morning (00:00-05:59): Rates should be near off-peak (${offPeakRate.toFixed(2)} Rs/kWh)
    - Morning peak (06:00-09:59): Rates should be near peak (${peakRate.toFixed(2)} Rs/kWh)
    - Mid-day (10:00-16:59): Rates should be near average (${averageRate.toFixed(2)} Rs/kWh)
    - Evening peak (17:00-21:59): Rates should be near peak (${peakRate.toFixed(2)} Rs/kWh)
    - Night (22:00-23:59): Rates should be near off-peak (${offPeakRate.toFixed(2)} Rs/kWh)

    2. Add random variations of ±10% to prevent constant rates
    `;

  try {
    const aiResponse = await fetchAIResponse(aiPrompt, tariffAnalysisSchema);

    return {
      currentRate: parseFloat(discomData["Average Billing Rate (Rs./kWh)"]),
      averageRate: parseFloat(averageRate.toFixed(2)),
      peakRate: parseFloat(peakRate.toFixed(2)),
      offPeakRate: parseFloat(offPeakRate.toFixed(2)),
      forecastedRates: aiResponse.forecasted_rates,
      savingsOpportunities: aiResponse?.savings_opportunities || [],
      pattern_analysis: aiResponse.pattern_analysis || "",
    };
  } catch (error) {
    console.error("Error generating tariff analysis:", error);
    return {
      currentRate: parseFloat(discomData["Average Billing Rate (Rs./kWh)"]),
      averageRate: parseFloat(averageRate.toFixed(2)),
      peakRate: parseFloat(peakRate.toFixed(2)),
      offPeakRate: parseFloat(offPeakRate.toFixed(2)),
      forecastedRates: [],
      savingsOpportunities: [],
      pattern_analysis:
        "There was an error generating the tariff analysis. Please try again.",
    };
  }
}

async function generateConsumptionAnalytics(
  energyData: EnergyData[],
  weatherData: WeatherData,
): Promise<ConsumptionAnalytics> {
  const dataByDay = groupDataByDay(energyData);
  const days = Array.from(dataByDay.keys()).sort();
  const latestDayData = dataByDay.get(days[days.length - 1]) || [];

  const totalConsumption = latestDayData.reduce(
    (sum, data) => sum + data.Consumption,
    0,
  );

  const peakConsumption = latestDayData.reduce(
    (max, data) =>
      data.Consumption > max.consumption
        ? { time: data.SendDate, consumption: data.Consumption }
        : max,
    { time: "", consumption: 0 },
  );

  const hourlyConsumption = latestDayData.reduce(
    (acc, data) => {
      const hour = new Date(data.SendDate).getHours();
      if (!acc[hour]) acc[hour] = [];
      acc[hour].push(data.Consumption);
      return acc;
    },
    {} as Record<number, number[]>,
  );

  const hourlyAverages = Object.entries(hourlyConsumption)
    .map(([hour, values]) => ({
      hour: parseInt(hour),
      average: values.reduce((a, b) => a + b, 0) / values.length,
    }))
    .sort((a, b) => a.hour - b.hour);

  // Get AI insights for consumption patterns
  const aiPrompt = `
    Analyze the following energy consumption data and return a JSON response.

    CONSUMPTION METRICS:
    - Daily total: ${totalConsumption.toFixed(2)} kWh
    - Peak consumption: ${peakConsumption.consumption.toFixed(2)} kWh at ${new Date(peakConsumption.time).toLocaleTimeString()}
    - Average hourly: ${(totalConsumption / 24).toFixed(2)} kWh

    HOURLY CONSUMPTION PATTERN:
    ${hourlyAverages
      .map(
        (h) =>
          `- Hour ${h.hour.toString().padStart(2, "0")}: ${h.average.toFixed(2)} kWh`,
      )
      .join("\n    ")}

    WEATHER CONDITIONS:
    - Temperature: ${weatherData.main.temp}°C
    - Humidity: ${weatherData.main.humidity}%
    - Conditions: ${weatherData.weather[0].main}
    - Details: ${weatherData.weather[0].description}

    Analyze the data and provide insights in the following JSON structure. Ensure all numbers are provided as numbers, not strings:

    Important formatting rules:
    1. Ensure the response is valid JSON
    2. All number values should be actual numbers, not strings
    3. Arrays should contain string elements for text fields
    4. Keep time format consistent as "M/D/YYYY HH:mm"
    5. Hour values in consumptionByTimeOfDay should be numbers 0-23
    6. All text descriptions should be clear and actionable
    7. Ensure weatherImpact is a single comprehensive string
    8. Recommendations should be specific and practical
`;

  const aiResponse = await fetchAIResponse(aiPrompt, consumptionAnalysisSchema); // Use insights in future updates

  return {
    totalConsumption: parseFloat(totalConsumption.toFixed(2)),
    averageDailyConsumption: parseFloat((totalConsumption / 24).toFixed(2)),
    peakConsumptionTime: peakConsumption.time,
    peakConsumptionValue: parseFloat(peakConsumption.consumption.toFixed(2)),
    consumptionByTimeOfDay: hourlyAverages,
    unusualPatterns: aiResponse?.unusualPatterns,
    weatherImpact: aiResponse?.weatherImpact,
    optimizationOpportunities: aiResponse?.optimizationOpportunities,
    timeOfDayRecommendations: aiResponse?.timeOfDayRecommendations,
  };
}

async function generateSolarAnalysis(
  energyData: EnergyData[],
  userData: UserData,
  weatherData: WeatherData,
): Promise<SolarAnalysis | null> {
  if (!userData.hasSolarPanels) return null;

  const dataByDay = groupDataByDay(energyData);
  const days = Array.from(dataByDay.keys()).sort();
  const latestDayData = dataByDay.get(days[days.length - 1]) || [];

  const dailyGeneration = latestDayData.reduce(
    (sum, data) => sum + (data.SolarEnergy || 0),
    0,
  );

  const monthlyGeneration = dailyGeneration * 30;
  const theoreticalDaily = userData.solarCapacity
    ? userData.solarCapacity * 5.5
    : 1;
  const efficiency = (dailyGeneration / theoreticalDaily) * 100;
  const savingsFromSolar =
    (dailyGeneration * parseFloat(userData.monthlyBill.toString())) / 30;

  const aiPrompt = `
    Analyze solar system performance and provide optimization guidance:

    SYSTEM SPECIFICATIONS:
    - Solar capacity: ${userData.solarCapacity} kW
    - Battery storage: ${userData.hasBatteryStorage ? userData.storageCapacity + " kWh" : "None"}
    - Daily generation: ${dailyGeneration.toFixed(2)} kWh
    - System efficiency: ${efficiency.toFixed(2)}%
    - Monthly generation: ${monthlyGeneration.toFixed(2)} kWh
    - Daily savings: ${savingsFromSolar.toFixed(2)} Rs

    WEATHER IMPACT:
    - Temperature: ${weatherData.main.temp}°C
    - Weather condition: ${weatherData.weather[0].main}
    - Detailed weather: ${weatherData.weather[0].description}
    - Humidity: ${weatherData.main.humidity}%

    GENERATION DATA:
    ${energyData
      .slice(-24)
      .map(
        (d) =>
          `- ${new Date(d.SendDate).toLocaleTimeString()}: ${d.SolarEnergy?.toFixed(2) || 0} kWh`,
      )
      .join("\n    ")}

    Analyze and provide:
    1. Specific optimization recommendations
    2. Required maintenance tasks
    3. Analysis of weather impact on generation
    4. Battery storage optimization tips (if applicable)
  `;

  const aiResponse = await fetchAIResponse(aiPrompt, solarAnalysisSchema);

  return {
    dailyGeneration: parseFloat(dailyGeneration.toFixed(2)),
    monthlyGeneration: parseFloat(monthlyGeneration.toFixed(2)),
    efficiency: parseFloat(efficiency.toFixed(2)),
    savingsFromSolar: parseFloat(savingsFromSolar.toFixed(2)),
    optimizations: aiResponse?.optimizations || [
      "Clean solar panels regularly to maintain efficiency",
      "Consider adjusting panel angles seasonally",
      "Monitor shading patterns throughout the day",
    ],
    maintenance_tasks: aiResponse?.maintenance_tasks || [
      "Clean solar panels regularly to maintain efficiency",
      "Consider adjusting panel angles seasonally",
      "Monitor shading patterns throughout the day",
    ],
    weather_impact: aiResponse?.weather_impact || "",
    storage_tips: aiResponse?.storage_tips || [
      "Consider installing a battery storage system",
      "Regularly monitor battery usage and adjust usage accordingly",
    ],
  };
}

export async function generateReport(
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
    const sortedEnergyData = [...energyData].sort(
      (a, b) => new Date(a.SendDate).getTime() - new Date(b.SendDate).getTime(),
    );

    const [
      executiveSummary,
      tariffAnalysis,
      consumptionAnalytics,
      solarAnalysis,
    ] = await Promise.all([
      calculateExecutiveSummary(
        sortedEnergyData,
        touData,
        userData,
        weatherData,
      ),
      generateTariffAnalysis(touData, discomData),
      generateConsumptionAnalytics(sortedEnergyData, weatherData),
      userData.hasSolarPanels
        ? generateSolarAnalysis(sortedEnergyData, userData, weatherData)
        : Promise.resolve(null),
    ]);

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
