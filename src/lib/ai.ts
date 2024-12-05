import { groupDataByDay } from "@/lib/utils";
import {
  ConsumptionAnalytics,
  Discom,
  EnergyData,
  ExecutiveSummary,
  SmartDevicesAnalysis,
  SolarAnalysis,
  TariffAnalysis,
  TOUData,
  UserData,
  WeatherData,
} from "@/types/user";
import Instructor from "@instructor-ai/instructor";
import Groq from "groq-sdk";
import { z } from "zod";

const groqClient = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY!,
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
      potentialMonthlySavings: z.string(),
      implementationEffort: z.enum(["low", "medium", "high"]),
    }),
  ),
});

const tariffAnalysisSchema = z.object({
  forecastedRates: z.array(
    z.object({
      time: z.string(),
      rate: z.number(),
      variationPercentage: z.number(),
    }),
  ),
  savingsOpportunities: z.array(z.string()),
  patternAnalysis: z.string(),
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
      varianceFromMean: z.number(),
    }),
  ),
  unusualPatterns: z.array(z.string()),
  weatherImpact: z.string(),
  optimizationOpportunities: z.array(z.string()),
  timeOfDayRecommendations: z.array(z.string()),
});

const solarAnalysisSchema = z.object({
  optimizations: z.array(z.string()),
  maintenance_tasks: z.array(z.string()),
  weather_impact: z.string(),
  storage_tips: z.array(z.string()),
});

const deviceScheduleSchema = z.object({
  deviceName: z.string(),
  optimalHours: z.array(z.number()),
  expectedSavings: z.number(),
  currentUsagePattern: z.string(),
  recommendedPattern: z.string(),
  reasonForRecommendation: z.string(),
});

const smartDevicesAnalysisSchema = z.object({
  deviceSchedules: z.array(deviceScheduleSchema),
  totalPotentialSavings: z.number(),
  generalRecommendations: z.array(z.string()),
  automationOpportunities: z.array(z.string()),
  peakUsageWarnings: z.array(z.string()),
  deviceIntegrationTips: z.array(z.string()),
});

const SYSTEM_PROMPT = `You are an expert energy analyst focused on maximizing cost savings through data-driven insights.

Core capabilities:
- Energy consumption pattern analysis
- TOU pricing optimization
- Solar/battery system recommendations
- Weather impact assessment
- ROI-based recommendations

Key response criteria:
1. All insights must include:
   - Specific data points
   - Numerical savings estimates
   - Implementation complexity (1-5)
   - ROI timeframe
   - Confidence level (%)

2. Analysis framework:
   - Immediate vs long-term actions
   - Peak/off-peak optimization
   - Seasonal adjustments
   - Local infrastructure constraints
   - Industry benchmarks

Always provide concrete, actionable recommendations prioritized by ROI.`;

async function fetchAIResponse(prompt: string, schema: any): Promise<any> {
  try {
    const response = await client.chat.completions.create({
      model: "llama-3.1-70b-versatile",
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
    throw new Error(`AI API call failed: ${error}`);
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

  const aiPrompt = `
    Based on these metrics, provide actionable energy recommendations:
    
    METRICS:
    - Cost: ${costComparisonPercentage.toFixed(2)}% ${costComparisonPercentage > 0 ? "increase" : "decrease"}
    - Today: ${currentDayCost.toFixed(2)} Rs
    - Yesterday: ${previousDayCost.toFixed(2)} Rs
    - Solar: ${userData.hasSolarPanels ? `${userData.solarCapacity} kW` : "No"}
    - Battery: ${userData.hasBatteryStorage ? `${userData.storageCapacity} kWh` : "No"}
    - Monthly bill: ${userData.monthlyBill} Rs
    - Weather: ${weatherData.main.temp}°C, ${weatherData.weather[0].main}
    
    Provide recommendations in this JSON format:
    {
      "recommendations": [{
        "text": "detailed recommendation",
        "priority": "high" | "medium" | "low",
        "estimatedImpact": "quantified impact",
        "potentialMonthlySavings": "amount in Rs",
        "implementationEffort": "low" | "medium" | "high"
      }]
    }
    
    Include device schedules, maintenance needs, and efficiency improvements.
    `;

  const aiResponse = await fetchAIResponse(aiPrompt, executiveSummarySchema);

  const recommendations: {
    text: string;
    priority: "high" | "medium" | "low";
    estimatedImpact: string;
  }[] = aiResponse?.recommendations
    ? aiResponse.recommendations
    : [
        {
          text: "No recommendations found.",
          priority: "low",
          estimatedImpact: "0% impact",
        },
      ];

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
{
  "context": {
    "rates": {
      "avg": ${averageRate.toFixed(2)},
      "peak": ${peakRate.toFixed(2)},
      "offPeak": ${offPeakRate.toFixed(2)}
    },
    "discom": {
      "state": "${discomData.State}",
      "name": "${discomData.DISCOM}",
      "consumers": ${discomData["Total Number of consumers (Millions)"]},
      "costs": {
        "purchase": ${discomData["Average power purchase cost (Rs./kWh)"]},
        "supply": ${discomData["Average Cost of Supply (Rs./kWh)"]},
        "billing": ${discomData["Average Billing Rate (Rs./kWh)"]}
      },
      "losses": ${discomData["AT&C Losses (%)"]}
    },
    "usage": ${JSON.stringify(touData)}
  }

  Return JSON matching:
  {
    "forecastedRates": [{
      "time": "HH:00",       // 24 entries, one per hour
      "rate": number,        // Rs/kWh with ±10% variation
      "variationPercentage": number
    }],
    "savingsOpportunities": string[],
    "patternAnalysis": string
  }

  Rate guidelines (Rs/kWh):
  00:00-05:59: ~${offPeakRate.toFixed(2)}
  06:00-09:59: ~${peakRate.toFixed(2)}
  10:00-16:59: ~${averageRate.toFixed(2)}
  17:00-21:59: ~${peakRate.toFixed(2)}
  22:00-23:59: ~${offPeakRate.toFixed(2)}
}`;

  try {
    const aiResponse = await fetchAIResponse(aiPrompt, tariffAnalysisSchema);

    return {
      currentRate: parseFloat(discomData["Average Billing Rate (Rs./kWh)"]),
      averageRate: parseFloat(averageRate.toFixed(2)),
      peakRate: parseFloat(peakRate.toFixed(2)),
      offPeakRate: parseFloat(offPeakRate.toFixed(2)),
      forecastedRates: aiResponse.forecastedRates,
      savingsOpportunities: aiResponse?.savingsOpportunities || [],
      patternAnalysis: aiResponse.patternAnalysis || "",
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
      patternAnalysis:
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

  const totalConsumption = Math.abs(
    latestDayData.reduce((sum, data) => sum + data.Consumption, 0),
  );

  const peakConsumption = latestDayData.reduce(
    (max, data) => {
      const consumption = Math.abs(data.Consumption);
      return consumption > max.consumption
        ? { time: data.SendDate, consumption }
        : max;
    },
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

  type HourlyData = {
    hour: number;
    average: number;
    varianceFromMean: number;
  };

  const hourlyAverages = Object.entries(hourlyConsumption)
    .map(([hour, values]) => {
      const average = values.reduce((a, b) => a + b, 0) / values.length;
      return {
        hour: parseInt(hour),
        average,
        varianceFromMean: Math.abs(average - totalConsumption / 24),
      } as HourlyData;
    })
    .sort((a, b) => a.hour - b.hour);

  const aiPrompt = `
    {
      "context": {
        "consumption": {
          "total": ${totalConsumption.toFixed(2)},
          "peak": {
            "value": ${peakConsumption.consumption.toFixed(2)},
            "time": "${new Date(peakConsumption.time).toLocaleString()}"
          },
          "hourlyAvg": ${(totalConsumption / 24).toFixed(2)},
          "hourly": ${JSON.stringify(hourlyAverages)}
        },
        "weather": {
          "temp": ${weatherData.main.temp},
          "humidity": ${weatherData.main.humidity},
          "condition": "${weatherData.weather[0].main}",
          "details": "${weatherData.weather[0].description}"
        }
      }
    
      Return JSON matching exactly:
      {
        "totalConsumption": number,
        "averageDailyConsumption": number,
        "peakConsumptionTime": "M/D/YYYY HH:mm",
        "peakConsumptionValue": number,
        "consumptionByTimeOfDay": [{
          "hour": number,      // 0-23
          "average": number,
          "varianceFromMean": number
        }],
        "unusualPatterns": string[],
        "weatherImpact": string,
        "optimizationOpportunities": string[],
        "timeOfDayRecommendations": string[]
      }
    
      All numbers must be actual numbers, not strings.
    }`;

  const aiResponse = await fetchAIResponse(aiPrompt, consumptionAnalysisSchema); // Use insights in future updates

  return {
    totalConsumption: Math.abs(parseFloat(totalConsumption.toFixed(2))),
    averageDailyConsumption: Math.abs(
      parseFloat((totalConsumption / 24).toFixed(2)),
    ),
    peakConsumptionTime: peakConsumption.time,
    peakConsumptionValue: Math.abs(
      parseFloat(peakConsumption.consumption.toFixed(2)),
    ),
    consumptionByTimeOfDay: hourlyAverages.map((hour) => ({
      ...hour,
      average: Math.abs(hour.average),
      varianceFromMean: hour.varianceFromMean
        ? Math.abs(hour.varianceFromMean)
        : 0,
    })),
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
): Promise<SolarAnalysis> {
  if (!userData.hasSolarPanels)
    return {
      dailyGeneration: 0,
      monthlyGeneration: 0,
      efficiency: 0,
      savingsFromSolar: 0,
      optimizations: [],
      maintenance_tasks: [],
      weather_impact: "",
      storage_tips: [
        "Uh... You don't have a solar panel. Consider installing one.",
      ],
    };

  const dataByDay = groupDataByDay(energyData);
  const days = Array.from(dataByDay.keys()).sort();
  const latestDayData = dataByDay.get(days[days.length - 1]) || [];

  const dailyGeneration = Math.abs(
    latestDayData.reduce((sum, data) => sum + (data.SolarEnergy || 0), 0),
  );

  const monthlyGeneration = Math.abs(dailyGeneration * 30);
  const theoreticalDaily = userData.solarCapacity
    ? Math.abs(userData.solarCapacity * 5.5)
    : 1;
  const efficiency = Math.min(
    100,
    Math.abs((dailyGeneration / theoreticalDaily) * 100),
  );
  const savingsFromSolar = Math.abs(
    (dailyGeneration * parseFloat(userData.monthlyBill.toString())) / 30,
  );

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
    dailyGeneration: Math.abs(parseFloat(dailyGeneration.toFixed(2))),
    monthlyGeneration: Math.abs(parseFloat(monthlyGeneration.toFixed(2))),
    efficiency: Math.min(100, Math.abs(parseFloat(efficiency.toFixed(2)))),
    savingsFromSolar: Math.abs(parseFloat(savingsFromSolar.toFixed(2))),
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

async function generateSmartDevicesAnalysis(
  userData: UserData,
  touData: TOUData[],
  weatherData: WeatherData,
): Promise<SmartDevicesAnalysis> {
  const smartDevices = userData.smartDevices;
  const activeDevices = Object.entries(smartDevices)
    .filter(([key, value]) => value === true && key !== "other")
    .map(([key]) => key);

  // Get the lowest rate hours from TOU data
  const ratesByHour = touData.reduce(
    (acc, data) => {
      const hour = new Date(data.timestamp).getHours();
      acc[hour] = data.rate;
      return acc;
    },
    {} as Record<number, number>,
  );

  const sortedHoursByRate = Object.entries(ratesByHour)
    .sort(([, a], [, b]) => a - b)
    .map(([hour]) => parseInt(hour));

  const aiPrompt = `
    Analyze smart device usage patterns and provide scheduling recommendations:

    ACTIVE DEVICES:
    ${activeDevices.map((device) => `- ${device}`).join("\n    ")}
    ${smartDevices.other ? `- Other devices: ${smartDevices.other}` : ""}

    ELECTRICITY RATES BY HOUR:
    ${Object.entries(ratesByHour)
      .map(([hour, rate]) => `- Hour ${hour}: ${rate.toFixed(2)} Rs/kWh`)
      .join("\n    ")}

    USER CONTEXT:
    - Monthly bill: ${userData.monthlyBill} Rs
    - Primary goal: ${userData.primaryGoal || "Not specified"}
    - Has solar: ${userData.hasSolarPanels ? "Yes" : "No"}
    - Has battery: ${userData.hasBatteryStorage ? "Yes" : "No"}

    WEATHER CONDITIONS:
    - Temperature: ${weatherData.main.temp}°C
    - Weather: ${weatherData.weather[0].main}
    - Description: ${weatherData.weather[0].description}

    For each device, provide:
    1. Optimal operating hours based on electricity rates
    2. Expected savings from schedule optimization
    3. Current usage patterns from energy data
    4. Recommended usage patterns
    5. Reasoning for recommendations
    
    Consider:
    - Peak vs. off-peak rates
    - Weather impact on device efficiency
    - Solar generation times (if applicable)
    - Battery storage availability (if applicable)
    - Integration opportunities between devices
  `;

  const aiResponse = await fetchAIResponse(
    aiPrompt,
    smartDevicesAnalysisSchema,
  );

  return {
    deviceSchedules: aiResponse.deviceSchedules.map(
      (schedule: typeof deviceScheduleSchema._type) => ({
        ...schedule,
        expectedSavings: Math.abs(schedule.expectedSavings),
      }),
    ),
    totalPotentialSavings: Math.abs(aiResponse.totalPotentialSavings),
    generalRecommendations: aiResponse.generalRecommendations,
    automationOpportunities: aiResponse.automationOpportunities,
    peakUsageWarnings: aiResponse.peakUsageWarnings,
    deviceIntegrationTips: aiResponse.deviceIntegrationTips,
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
  solarAnalysis: SolarAnalysis;
  smartDevicesAnalysis: SmartDevicesAnalysis;
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
      smartDevicesAnalysis,
    ] = await Promise.all([
      calculateExecutiveSummary(
        sortedEnergyData,
        touData,
        userData,
        weatherData,
      ),
      generateTariffAnalysis(touData, discomData),
      generateConsumptionAnalytics(sortedEnergyData, weatherData),
      generateSolarAnalysis(sortedEnergyData, userData, weatherData),
      generateSmartDevicesAnalysis(userData, touData, weatherData),
    ]);

    return {
      executiveSummary,
      tariffAnalysis,
      consumptionAnalytics,
      solarAnalysis,
      smartDevicesAnalysis,
    };
  } catch (error) {
    console.error("Error generating report:", error);
    throw new Error("Failed to generate complete report");
  }
}
