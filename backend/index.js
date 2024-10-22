const cron = require("node-cron");
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc } = require("firebase/firestore");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Base TOU rate configuration
const baseTouRates = [
  { startHour: 0, endHour: 4, baseRate: 3.5, variation: 0.3 },
  { startHour: 4, endHour: 8, baseRate: 4.2, variation: 0.4 },
  { startHour: 8, endHour: 12, baseRate: 5.8, variation: 0.6 },
  { startHour: 12, endHour: 16, baseRate: 6.2, variation: 0.5 },
  { startHour: 16, endHour: 20, baseRate: 7.5, variation: 0.8 },
  { startHour: 20, endHour: 24, baseRate: 5.2, variation: 0.4 },
];

const SEASON_MULTIPLIER = {
  SUMMER: 1.15,
  WINTER: 0.9,
  MONSOON: 1.0,
};

const DEMAND_MULTIPLIER = {
  WEEKDAY: 1.1,
  WEEKEND: 0.95,
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

function getCurrentTOURate() {
  const now = new Date();
  const currentHour = now.getHours();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const currentSeason = getCurrentSeason();

  const currentRate = baseTouRates.find(
    (rate) => currentHour >= rate.startHour && currentHour < rate.endHour,
  );

  if (!currentRate) return 5.0;

  let rate = currentRate.baseRate;
  rate += generateRandomVariation(currentRate.variation);
  rate *= SEASON_MULTIPLIER[currentSeason];
  rate *= isWeekend ? DEMAND_MULTIPLIER.WEEKEND : DEMAND_MULTIPLIER.WEEKDAY;
  rate *= 1 + (Math.random() * 0.02 - 0.01);

  return Math.round(rate * 100) / 100;
}

async function generateAndStoreTOUData() {
  const currentRate = getCurrentTOURate();
  const timestamp = new Date().toISOString();

  try {
    const touCollection = collection(db, "tou-rates");
    await addDoc(touCollection, { rate: currentRate, timestamp });
    console.log(`Stored TOU rate: ${currentRate} at ${timestamp}`);
  } catch (error) {
    console.error("Error storing TOU rate:", error);
  }
}

// Run the job every hour
cron.schedule("0 * * * *", generateAndStoreTOUData);

console.log("Background process for TOU data generation started");

// Initial run
generateAndStoreTOUData();
