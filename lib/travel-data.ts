// الأوقات الدقيقة بالثواني حسب الجدول الرسمي الجديد
export const TRAVEL_TIMES_SEC = {
  uk: {
    standard: 159 * 60, // 9540 ثانية
    airstrip: 111 * 60, // 6660 ثانية
  },
  japan: {
    standard: 225 * 60, // 13500 ثانية
    airstrip: 158 * 60, // 9480 ثانية
  },
  can: {
    standard: 41 * 60,  // 2460 ثانية
    airstrip: 29 * 60,  // 1740 ثانية
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