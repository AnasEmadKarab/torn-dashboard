import { calculateFlightBuffer } from "./predictions";

export interface FlightOption {
  destination: "uk" | "japan";
  departureTime: number;
  arrivalTime: number;
  restockTime: number;
}

export function getTopFlights(
  ukData: any, 
  japanData: any, 
  userTravelTimeLeft: number = 0,
  flightType: "standard" | "airstrip" = "standard" 
): FlightOption[] {
  if (!ukData || !japanData) return [];

  const availableDepartureTime = calculateFlightBuffer(userTravelTimeLeft);
  
  // توحيد الأوقات بالثانية مع ملف travel-data.ts
  const flightDurations = {
    standard: { uk: 6660, japan: 9480 },
    airstrip: { uk: 4680, japan: 6660 } 
  };

  const flights: FlightOption[] = [];

  for (const country of ["uk", "japan"] as const) {
    const data = country === "uk" ? ukData : japanData;
    const duration = flightDurations[flightType][country]; 
    
    // اللحظة اللي بينزل فيها الستوك بالملي
    const restockTime = data.next_expected; 
    const idealDeparture = restockTime - duration;

    if (idealDeparture >= availableDepartureTime) {
      flights.push({
        destination: country,
        departureTime: idealDeparture,
        arrivalTime: restockTime, // الوصول متزامن تماماً مع الستوك
        restockTime: restockTime,
      });
    } else {
      const nextCycleRestock = restockTime + (country === "uk" ? 7200 : 9900);
      flights.push({
        destination: country,
        departureTime: nextCycleRestock - duration,
        arrivalTime: nextCycleRestock,
        restockTime: nextCycleRestock,
      });
    }
  }

  return flights.sort((a, b) => a.departureTime - b.departureTime);
}