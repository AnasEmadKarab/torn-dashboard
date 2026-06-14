// lib/travel-data.ts
export const TRAVEL_TIMES_MIN: Record<string, number> = {
  uk: 159,    // London (PI Airstrip)
  japan: 225, // Tokyo (PI Airstrip)
};

export function leaveTimeForArrival(arrivalEpoch: number, country: "uk" | "japan") {
  const travelSec = TRAVEL_TIMES_MIN[country] * 60;
  
  // The Negative Window (-1 to -2 mins)
  // بنضيف 90 ثانية لموعد وصول التعبئة عشان توصل بعد التعبئة وتلاقي الستوك مفلل
  const TARGET_ARRIVAL = arrivalEpoch + 90;
  
  return TARGET_ARRIVAL - travelSec;
}