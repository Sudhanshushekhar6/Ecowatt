const cron = require("node-cron");
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
} = require("firebase/firestore");
const { initializeApp: adminInit } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const path = require("path");
const { Resend } = require("resend");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

const resend = new Resend(process.env.RESEND_API_KEY);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
initializeApp(firebaseConfig);

adminInit({
  credential: require("firebase-admin").credential.cert(
    require("../serviceAccountKey.json"),
  ),
});

const db = getFirestore();
const auth = getAuth();

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

const SEASON_MULTIPLIER = { SUMMER: 1.15, WINTER: 0.9, MONSOON: 1.0 };
const DEMAND_MULTIPLIER = { WEEKDAY: 1.1, WEEKEND: 0.95 };
const SURCHARGES = { ACCUMULATED_DEFICIT: 1.08, PENSION_TRUST: 1.05 };
const RATE_THRESHOLD = 10.0;

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
  rate *= SURCHARGES.ACCUMULATED_DEFICIT;
  rate *= SURCHARGES.PENSION_TRUST;

  return Math.round(rate * 100) / 100;
}

async function fetchUsersWithEmailNotifications() {
  const usersCollection = collection(db, "users");
  const querySnapshot = await getDocs(
    query(usersCollection, where("notificationMethod", "==", "email")),
  );

  const users = [];
  for (const doc of querySnapshot.docs) {
    const userId = doc.id;
    try {
      const userRecord = await auth.getUser(userId);
      const email = userRecord.email;
      if (email) {
        users.push({ email, ...doc.data() });
      }
    } catch (error) {
      console.error(`Failed to fetch email for user ID ${userId}:`, error);
    }
  }

  return users;
}

async function sendEmailToUsers(users, rate) {
  for (const user of users) {
    try {
      await resend.emails.send({
        from: "Prabhawatt <alerts@chiragaggarwal.tech>",
        to: [user.email],
        subject: "High Tariff Rate Alert!",
        html: `<p>Dear User,</p><p>The current tariff rate has reached <b>${rate}</b>, which is higher the normal threshold.</p><p>Consider adjusting your electricity usage during this period.</p><br>For more information, please visit <a href="https://prabhawatt.vercel.app/">https://prabhawatt.vercel.app/</a>`,
      });
      console.log(`Email sent to ${user.email}`);
    } catch (error) {
      console.error(`Failed to send email to ${user.email}:`, error);
    }
  }
}

async function generateAndStoreTOUData(category) {
  const currentRate = getCurrentTOURate(category);
  const timestamp = new Date().toISOString();

  try {
    const touCollection = collection(db, "tou-rates");
    await addDoc(touCollection, { category, rate: currentRate, timestamp });
    console.log(`Stored ${category} TOU rate: ${currentRate} at ${timestamp}`);

    if (currentRate > RATE_THRESHOLD) {
      const users = await fetchUsersWithEmailNotifications();
      await sendEmailToUsers(users, currentRate);
    }
  } catch (error) {
    console.error("Error storing TOU rate or sending emails:", error);
  }
}

cron.schedule("0 * * * *", () => {
  ["DOMESTIC", "INDUSTRIAL", "NON_DOMESTIC"].forEach(generateAndStoreTOUData);
});

console.log("Background process for TOU data generation started");

// ["DOMESTIC", "INDUSTRIAL", "NON_DOMESTIC"].forEach(generateAndStoreTOUData);
