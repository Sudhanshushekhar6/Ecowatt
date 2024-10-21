import { User } from "firebase/auth";
import {
  Discom,
  EnergyData,
  TOUData,
  UserData,
  WeatherData,
} from "../types/user";

export async function generateReport(
  user: User,
  userData: UserData,
  touData: TOUData[],
  weatherData: WeatherData,
  discomData: Discom,
  energyData: EnergyData[],
): Promise<string> {
  const prompt = `You are Prabhawatt. Generate a comprehensive, formal, and detailed energy report based on the following data:

    User: ${JSON.stringify(user)}
    User Data: ${JSON.stringify(userData)}
    TOU Data: ${JSON.stringify(touData)}
    Weather Data: ${JSON.stringify(weatherData)}
    Discom Data: ${JSON.stringify(discomData)}
    Energy Data: ${JSON.stringify(energyData).slice(0, 100)}

    Please provide a detailed analysis and insights on the following aspects, incorporating tables, charts, and diagrams where appropriate:

    1. Real-Time Tariff Analysis:
       - Current tariff rates and how they compare to historical data
       - Forecasted tariffs for the next 24-48 hours
       - Potential savings opportunities based on tariff variations

    2. Energy Consumption Analytics:
       - Detailed breakdown of energy usage patterns
       - Comparison of current consumption with historical data
       - Identification of peak usage times and high-consumption appliances

    3. Smart Scheduling Recommendations:
       - Specific suggestions for automating appliance usage during low-tariff periods
       - Potential cost savings from implementing these recommendations
       - Any challenges or considerations for implementation

    4. Solar Energy Management:
       - Analysis of current solar energy production
       - Optimization strategies for solar energy usage and storage
       - Cost-benefit analysis of the current solar setup

    5. Machine Learning Forecasts:
       - Predicted energy consumption for the next week/month.
       - Factors influencing the forecast (e.g., weather, historical patterns)
       - Confidence intervals and potential variations in the forecast

    6. Cost-Benefit Analysis:
       - Detailed breakdown of current energy costs
       - Projected savings from implementing recommendations
       - Return on investment calculations for any suggested upgrades or changes

    7. Energy Efficiency Recommendations:
       - Specific suggestions for improving overall energy efficiency
       - Estimated impact of each recommendation on energy consumption and costs
       - Prioritized list of actions based on potential impact and ease of implementation

    Please ensure the report is formal, concise, and to the point. Include relevant tables, charts, and diagrams to illustrate key points and make the data more accessible. Each section should provide actionable insights and clear, data-driven recommendations.`;

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
                "You are an AI assistant specialized in energy analysis and optimization. Provide detailed, formal reports with actionable insights. Include tables, charts, and diagrams where appropriate to illustrate key points.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 4096,
        }),
      },
    );

    const data = await response.json();
    console.log(data);
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error generating report:", error);
    return "An error occurred while generating the report. Please try again later.";
  }
}
