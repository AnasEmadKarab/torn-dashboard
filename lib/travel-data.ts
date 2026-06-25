// lib/travel-data.ts

// الأوقات الدقيقة بالثواني حسب التحديث الجديد Travel 2.0
export const TRAVEL_TIMES_SEC = {
  uk: {
    standard: 151 * 60, // 9060 ثانية (2h 31m)
    airstrip: 106 * 60, // 6360 ثانية (1h 46m)
  },
  japan: {
    standard: 213 * 60, // 12780 ثانية (3h 33m)
    airstrip: 149 * 60, // 8940 ثانية (2h 29m)
  },
  can: {
    standard: 39 * 60,  // 2340 ثانية (39m)
    airstrip: 27 * 60,  // 1620 ثانية (27m)
  }
};

export function leaveTimeForArrival(
  arrivalEpoch: number, 
  country: "uk" | "japan" | "can", 
  flightType: "standard" | "airstrip" = "airstrip" 
) {
  const travelSec = TRAVEL_TIMES_SEC[country][flightType];
  
  // 👈 شلنا الـ 90 ثانية وصار الوقت متطابق 100% مع نزول الستوك
  return arrivalEpoch - travelSec;
}