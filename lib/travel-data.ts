// lib/travel-data.ts

// الأوقات الدقيقة بالثواني حسب (Torn Wiki) عشان الدقة تكون بالملي
export const TRAVEL_TIMES_SEC = {
  uk: {
    standard: 111 * 60, // 6660 ثانية
    airstrip: 78 * 60,  // 4680 ثانية
  },
  japan: {
    standard: 158 * 60, // 9480 ثانية
    airstrip: 111 * 60, // 6660 ثانية
  }
};

export function leaveTimeForArrival(
  arrivalEpoch: number, 
  country: "uk" | "japan", 
  flightType: "standard" | "airstrip" = "airstrip" // افتراضياً خليناها Airstrip لأنك ساكن بـ PI
) {
  // بنجيب وقت السفر بالثواني بناءً على نوع الطيران اللي اختاره المستخدم
  const travelSec = TRAVEL_TIMES_SEC[country][flightType];
  
  // The Negative Window
  // بنضيف 90 ثانية لموعد وصول التعبئة عشان توصل بعد التعبئة وتلاقي الستوك مفلل وجاهز
  const TARGET_ARRIVAL = arrivalEpoch + 90;
  
  return TARGET_ARRIVAL - travelSec;
}