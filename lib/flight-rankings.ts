import { calculateFlightBuffer } from "./predictions";

export interface FlightOption {
  destination: "uk" | "japan";
  departureTime: number;
  arrivalTime: number;
  restockTime: number;
}

export function getTopFlights(ukData: any, japanData: any, userTravelTimeLeft: number = 0): FlightOption[] {
  if (!ukData || !japanData) return [];

  // استخدام البفر (وقت الرجعة + 3 دقايق) اللي برمجناه بملف predictions
  const availableDepartureTime = calculateFlightBuffer(userTravelTimeLeft);
  
  const flights: FlightOption[] = [];
  const flightDurations = { uk: 6660, japan: 9480 }; // وقت السفر بالثواني بالستاندرد

  for (const country of ["uk", "japan"] as const) {
    const data = country === "uk" ? ukData : japanData;
    const duration = flightDurations[country];
    
    // استخدام Next Expected الدقيق من الباك إند
    const restockTime = data.next_expected; 
    
    // أفضل وقت للإقلاع = وقت نزول البضاعة - وقت الرحلة
    const idealDeparture = restockTime - duration;

    // هل يمدينا نلحق هاد الإقلاع بناءً على وقت رجعتنا والبفر؟
    if (idealDeparture >= availableDepartureTime) {
      flights.push({
        destination: country,
        departureTime: idealDeparture,
        arrivalTime: restockTime,
        restockTime: restockTime,
      });
    } else {
      // إذا ما لحقنا، بنحسب الدورة اللي بعدها (نضيف وقت التأخير الطبيعي)
      const nextCycleRestock = restockTime + (country === "uk" ? 7200 : 9900);
      flights.push({
        destination: country,
        departureTime: nextCycleRestock - duration,
        arrivalTime: nextCycleRestock,
        restockTime: nextCycleRestock,
      });
    }
  }

  // ترتيب الرحلات من الأقرب للأبعد
  return flights.sort((a, b) => a.departureTime - b.departureTime);
}