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

// Base TOU rate configuration
const baseTouRates = [
    { startHour: 0, endHour: 4, baseRate: 3.5, variation: 0.3 },  // Off-peak night
    { startHour: 4, endHour: 8, baseRate: 4.2, variation: 0.4 },  // Early morning
    { startHour: 8, endHour: 12, baseRate: 5.8, variation: 0.6 }, // Morning peak
    { startHour: 12, endHour: 16, baseRate: 6.2, variation: 0.5 }, // Afternoon
    { startHour: 16, endHour: 20, baseRate: 7.5, variation: 0.8 }, // Evening peak
    { startHour: 20, endHour: 24, baseRate: 5.2, variation: 0.4 }, // Evening
];

// Factors that influence rate variations
const SEASON_MULTIPLIER = {
    SUMMER: 1.15,
    WINTER: 0.9,
    MONSOON: 1.0
};

const DEMAND_MULTIPLIER = {
    WEEKDAY: 1.1,
    WEEKEND: 0.95
};

function getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 3 && month <= 5) return 'SUMMER';
    if (month >= 6 && month <= 9) return 'MONSOON';
    return 'WINTER';
}

function generateRandomVariation(baseVariation: number) {
    // Generate a random variation using normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const normalRandom = Math.sqrt(-2.0 * Math.log(u1)) * 
                        Math.cos(2.0 * Math.PI * u2);
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

    if (!currentRate) return 5.0; // Default fallback

    // Calculate final rate with all factors
    let rate = currentRate.baseRate;
    
    // Add random variation
    rate += generateRandomVariation(currentRate.variation);
    
    // Apply seasonal adjustment
    rate *= SEASON_MULTIPLIER[currentSeason];
    
    // Apply weekend/weekday adjustment
    rate *= isWeekend ? DEMAND_MULTIPLIER.WEEKEND : DEMAND_MULTIPLIER.WEEKDAY;

    // Add small random noise (±1%)
    rate *= (1 + (Math.random() * 0.02 - 0.01));

    // Round to 2 decimal places
    return Math.round(rate * 100) / 100;
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