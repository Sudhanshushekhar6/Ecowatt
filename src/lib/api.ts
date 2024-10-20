// lib/api.ts
import discomData from "@/data/electricity-providers.json";
import { TOUData, WeatherData } from "@/types/user";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";

export async function fetchWeatherData(
  latitude: number,
  longitude: number,
): Promise<WeatherData | null> {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=metric`,
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

export async function fetchTOUData(): Promise<{
  rate: number;
  timestamp: string;
}> {
  try {
    const response = await fetch("/api/tou");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching TOU data:", error);
    return { rate: 0, timestamp: new Date().toISOString() };
  }
}

export async function fetchTOUHistory(): Promise<TOUData[]> {
  try {
    const touCollection = collection(db, "tou-rates");
    const q = query(touCollection, orderBy("timestamp", "desc"), limit(24));
    const querySnapshot = await getDocs(q);
    const history = querySnapshot.docs.map((doc) => ({
      timestamp: doc.data().timestamp,
      rate: doc.data().rate,
    }));
    return history.reverse(); // Reverse to show oldest first
  } catch (error) {
    console.error("Error fetching TOU history:", error);
    return [];
  }
}

export function fetchDISCOMData(discomName: string): any | null {
  return (
    discomData.DISCOMs.find((discom) => discom.DISCOM === discomName) || null
  );
}
