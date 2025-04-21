import { sendTariffAlertEmail } from "./email";
import { db } from "./firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { UserData } from "@/types/user";

export const startTariffMonitoring = (userData: UserData) => {
  if (!userData.email || !userData.name) return;

  // Monitor tariff changes in real-time
  const unsubscribe = onSnapshot(
    doc(db, "users", userData.uid),
    (doc) => {
      const data = doc.data() as UserData;
      if (data.currentTariff && data.currentTariff > 4) {
        // Send alert email when tariff exceeds 4 kW/h
        sendTariffAlertEmail(userData.email!, userData.name!, data.currentTariff);
      }
    },
    (error) => {
      console.error("Error monitoring tariff:", error);
    }
  );

  return unsubscribe;
}; 