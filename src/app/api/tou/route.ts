// app/api/tou/route.ts
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

// Mock TOU data (₹/kWh)
const touRates = [
  { startHour: 0, endHour: 6, rate: 3.5 },
  { startHour: 6, endHour: 10, rate: 5.0 },
  { startHour: 10, endHour: 18, rate: 6.5 },
  { startHour: 18, endHour: 22, rate: 8.0 },
  { startHour: 22, endHour: 24, rate: 5.0 },
];

function getCurrentTOURate() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentRate = touRates.find(
    (rate) => currentHour >= rate.startHour && currentHour < rate.endHour,
  );
  return currentRate ? currentRate.rate : 5.0; // Default to 5.0 if not found
}

export async function GET(request: NextRequest) {
  const currentRate = getCurrentTOURate();
  const timestamp = new Date().toISOString();

  // Check if it's time to store a new value
  const touCollection = collection(db, "tou-rates");
  const q = query(touCollection, orderBy("timestamp", "desc"), limit(1));
  const querySnapshot = await getDocs(q);

  let shouldStore = true;
  if (!querySnapshot.empty) {
    const lastDoc = querySnapshot.docs[0];
    const lastTimestamp = lastDoc.data().timestamp;
    const timeDiff = new Date().getTime() - new Date(lastTimestamp).getTime();
    shouldStore = timeDiff > 3600000; // 1 hour in milliseconds
  }

  if (shouldStore) {
    await addDoc(touCollection, { rate: currentRate, timestamp });
  }

  return NextResponse.json({ rate: currentRate, timestamp });
}
