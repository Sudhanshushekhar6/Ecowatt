import { User } from "firebase/auth";
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
} from "../types/user";

function groupDataByDay(energyData: EnergyData[]): Map<string, EnergyData[]> {
  const dataByDay = new Map<string, EnergyData[]>();

  energyData.forEach((data) => {
    const date = new Date(data.SendDate).toLocaleDateString();
    if (!dataByDay.has(date)) {
      dataByDay.set(date, []);
    }
    dataByDay.get(date)?.push(data);
  });

  return dataByDay;
}

// Calculate executive summary without API call
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
    Analyze this energy consumption data and provide key recommendations:
    Cost comparison: ${costComparisonPercentage}% ${costComparisonPercentage > 0 ? "increase" : "decrease"}
    Solar generation: ${solarGeneration}
    Weather data: ${JSON.stringify(weatherData)}
    User has solar: ${userData.hasSolarPanels}
    User has battery: ${userData.hasBatteryStorage}

    Provide:
    1. List of 3-5 specific, actionable recommendations
    2. Priority level for each recommendation
    3. Estimated impact on energy consumption
    
    Format the response as JSON with structure:
    {
      "recommendations": [
        {
          "text": "recommendation text",
          "priority": "high/medium/low",
          "estimatedImpact": "percentage or kWh value"
        }
      ]
    }
  `;

  const aiResponse = await fetchAIResponse(aiPrompt);
  console.log("Executive Summary", aiResponse);

  const recommendations: {
    text: string;
    priority: "high" | "medium" | "low";
    estimatedImpact: string;
  }[] = aiResponse?.recommendations ? aiResponse.recommendations : [];

  console.log("executive summary recommendations", recommendations);

  return {
    currentMonthCost: parseFloat(currentDayCost.toFixed(2)),
    costComparisonPercentage: parseFloat(costComparisonPercentage.toFixed(2)),
    costTrend: costComparisonPercentage > 0 ? "up" : "down",
    totalEnergySavings: parseFloat(totalEnergySavings.toFixed(2)),
    solarGeneration: solarGeneration
      ? parseFloat(solarGeneration.toFixed(2))
      : null,
    batteryUsage: userData.hasBatteryStorage ? userData.storageCapacity : null,
    keyRecommendations: recommendations,
  };
}

// Generate tariff analysis
async function generateTariffAnalysis(
  touData: TOUData[],
  discomData: Discom,
): Promise<TariffAnalysis> {
  const rates = touData.map((t) => t.rate);
  const averageRate = rates.reduce((a, b) => a + b, 0) / rates.length;
  const peakRate = Math.max(...rates);
  const offPeakRate = Math.min(...rates);

  const aiPrompt = `
    Analyze this tariff data and provide insights:
    Time of Use Data: ${JSON.stringify(touData)}
    DISCOM Info: ${JSON.stringify(discomData)}
    Average Rate: ${averageRate}
    Peak Rate: ${peakRate}
    Off-Peak Rate: ${offPeakRate}

    Provide:
    1. Rate forecasting for next 24 hours
    2. Specific savings opportunities
    3. Pattern analysis of rate variations
    
    Format as JSON with structure:
    {
      "forecasted_rates": [{"time": "HH:MM", "rate": number}],
      "savings_opportunities": ["detailed opportunity 1", "detailed opportunity 2"],
      "pattern_analysis": "string"
    }
  `;

  const aiResponse = await fetchAIResponse(aiPrompt);
  console.log("Tariffs", aiResponse);

  return {
    currentRate: parseFloat(discomData["Average Billing Rate (Rs./kWh)"]),
    averageRate: parseFloat(averageRate.toFixed(2)),
    peakRate: parseFloat(peakRate.toFixed(2)),
    offPeakRate: parseFloat(offPeakRate.toFixed(2)),
    forecastedRates: aiResponse?.forecasted_rates || [],
    savingsOpportunities: aiResponse?.savings_opportunities || [],
    pattern_analysis: aiResponse.pattern_analysis || "",
  };
}

// Generate consumption analytics
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
    Analyze this consumption data and provide insights:
    Daily consumption: ${totalConsumption}
    Peak consumption: ${peakConsumption.consumption} at ${peakConsumption.time}
    Hourly patterns: ${JSON.stringify(hourlyAverages)}
    Weather conditions: ${JSON.stringify(weatherData)}

    Identify:
    1. Unusual consumption patterns
    2. Weather impact on consumption
    3. Optimization opportunities
    4. Time-of-day recommendations
  `;

  const aiResponse = await fetchAIResponse(aiPrompt); // Use insights in future updates
  console.log("Consumption", aiResponse);

  return {
    totalConsumption: parseFloat(totalConsumption.toFixed(2)),
    averageDailyConsumption: parseFloat((totalConsumption / 24).toFixed(2)),
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

  const dataByDay = groupDataByDay(energyData);
  const days = Array.from(dataByDay.keys()).sort();
  const latestDayData = dataByDay.get(days[days.length - 1]) || [];

  const dailyGeneration = latestDayData.reduce(
    (sum, data) => sum + (data.SolarEnergy || 0),
    0,
  );

  const monthlyGeneration = dailyGeneration * 30;
  const theoreticalDaily = userData.solarCapacity * 5.5;
  const efficiency = (dailyGeneration / theoreticalDaily) * 100;
  const savingsFromSolar =
    (dailyGeneration * parseFloat(userData.monthlyBill.toString())) / 30;

  // Get AI recommendations for solar optimization
  const aiPrompt = `
    Analyze solar generation data and provide optimization recommendations:
    Daily generation: ${dailyGeneration}
    System efficiency: ${efficiency}%
    Weather conditions: ${JSON.stringify(weatherData)}
    Solar capacity: ${userData.solarCapacity}
    Battery storage: ${userData.hasBatteryStorage ? userData.storageCapacity : "None"}

    Provide:
    1. Specific optimization recommendations
    2. Maintenance suggestions
    3. Weather impact analysis
    4. Storage optimization if applicable
    
    Format as JSON with structure:
    {
      "optimizations": ["detailed recommendation 1", "detailed recommendation 2"],
      "maintenance_tasks": ["task 1", "task 2"],
      "weather_impact": "string",
      "storage_tips": ["tip 1", "tip 2"]
    }
  `;

  const aiResponse = await fetchAIResponse(aiPrompt);

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

async function fetchAIResponse(prompt: string): Promise<any> {
  try {
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
                "You are an energy analysis expert. Analyze the data and provide detailed insights in JSON format. Focus on actionable recommendations and specific patterns.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1024,
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!response.ok) {
      console.log(response);
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("AI API call failed:", error);
    return null;
  }
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
