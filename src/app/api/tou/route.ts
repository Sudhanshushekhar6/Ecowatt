import { db } from "@/lib/firebase";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const touCollection = collection(db, "tou-rates");
    const q = query(touCollection, orderBy("timestamp", "desc"), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: "No TOU data available" },
        { status: 404 },
      );
    }

    const latestDoc = querySnapshot.docs[0];
    const { rate, timestamp } = latestDoc.data();

    return NextResponse.json({ rate, timestamp });
  } catch (error) {
    console.error("Error fetching TOU rate:", error);
    return NextResponse.json(
      { error: "Failed to fetch TOU rate" },
      { status: 500 },
    );
  }
}
