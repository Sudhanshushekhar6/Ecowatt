// src/worker.js
import { initializeApp } from "firebase/app";
import { addDoc, collection, getFirestore } from "firebase/firestore";

const baseTouRates = {
  DOMESTIC: [
    { startHour: 0, endHour: 4, baseRate: 3.0, variation: 0.3 },
    { startHour: 4, endHour: 8, baseRate: 4.5, variation: 0.4 },
    { startHour: 8, endHour: 12, baseRate: 6.5, variation: 0.5 },
    { startHour: 12, endHour: 16, baseRate: 7.0, variation: 0.6 },
    { startHour: 16, endHour: 20, baseRate: 8.0, variation: 0.7 },
    { startHour: 20, endHour: 24, baseRate: 5.2, variation: 0.4 },
  ],
  INDUSTRIAL: [{ startHour: 0, endHour: 24, baseRate: 7.75, variation: 0.5 }],
  NON_DOMESTIC: [{ startHour: 0, endHour: 24, baseRate: 8.5, variation: 0.6 }],
};

const SEASON_MULTIPLIER = {
  SUMMER: 1.15,
  WINTER: 0.9,
  MONSOON: 1.0,
};

const DEMAND_MULTIPLIER = {
  WEEKDAY: 1.1,
  WEEKEND: 0.95,
};

const SURCHARGES = {
  ACCUMULATED_DEFICIT: 1.08,
  PENSION_TRUST: 1.05,
};

function getCurrentSeason() {
  const month = new Date().getMonth();
  if (month >= 3 && month <= 5) return "SUMMER";
  if (month >= 6 && month <= 9) return "MONSOON";
  return "WINTER";
}

function generateRandomVariation(baseVariation) {
  const u1 = Math.random();
  const u2 = Math.random();
  const normalRandom =
    Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return normalRandom * baseVariation;
}

function getCurrentTOURate(category) {
  const now = new Date();
  const currentHour = now.getHours();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const currentSeason = getCurrentSeason();

  const currentRateConfig = baseTouRates[category].find(
    (rate) => currentHour >= rate.startHour && currentHour < rate.endHour,
  );
  if (!currentRateConfig) return 5.0;

  let rate = currentRateConfig.baseRate;

  rate += generateRandomVariation(currentRateConfig.variation);
  rate *= SEASON_MULTIPLIER[currentSeason];
  rate *= isWeekend ? DEMAND_MULTIPLIER.WEEKEND : DEMAND_MULTIPLIER.WEEKDAY;

  if (category !== "DOMESTIC") {
    const peakHours = [14, 15, 16, 22, 23, 0];
    const offPeakHours = [4, 5, 6, 7, 8, 9];
    if (peakHours.includes(currentHour)) {
      rate *= 1.2;
    } else if (offPeakHours.includes(currentHour)) {
      rate *= 0.8;
    }
  }

  rate *= 1 + (Math.random() * 0.02 - 0.01);
  rate *= SURCHARGES.ACCUMULATED_DEFICIT;
  rate *= SURCHARGES.PENSION_TRUST;

  return Math.round(rate * 100) / 100;
}

async function generateAndStoreTOUData(category, env) {
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  };
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const currentRate = getCurrentTOURate(category);
  const timestamp = new Date().toISOString();

  try {
    const touCollection = collection(db, "tou-rates");
    await addDoc(touCollection, { category, rate: currentRate, timestamp });
    console.log(`Stored ${category} TOU rate: ${currentRate}`);
  } catch (error) {
    console.error("Error storing TOU rate:", error);
  }
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(
      Promise.all(
        ["DOMESTIC", "INDUSTRIAL", "NON_DOMESTIC"].map((industry) => {
          return generateAndStoreTOUData(industry, env);
        }),
      ),
    );
  },

  async fetch(request, env, ctx) {
    return new Response("TOU Rate Generator Worker is running!", {
      headers: { "content-type": "text/plain" },
    });
  },
};
