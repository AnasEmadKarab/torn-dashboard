import { calculateFlightBuffer, RestockPoint } from "./predictions";

export interface FlightOption {
  destination: "uk" | "japan" | "can";
  departureTime: number;
  arrivalTime: number;
  restockTime: number;
}

export function getTopFlights(
  ukPoints: RestockPoint[],    // 👈 صرنا نستقبل بيانات الجراف المعالجة
  japanPoints: RestockPoint[], // 👈 بدل الداتا الخام
  canPoints: RestockPoint[],
  userTravelTimeLeft: number = 0,
  flightType: "standard" | "airstrip" = "standard" 
): FlightOption[] {
  if (!ukPoints || !japanPoints) return [];

  const availableDepartureTime = calculateFlightBuffer(userTravelTimeLeft);
  
  const flightDurations = {
    standard: { uk: 9060, japan: 12780, can: 2340 },
    airstrip: { uk: 6360, japan: 8940, can: 1620 } 
  };

  const flights: FlightOption[] = [];
  
  const countries = [
    { id: "uk", points: ukPoints },
    { id: "japan", points: japanPoints },
    { id: "can", points: canPoints }
  ] as const;

  for (const { id: country, points } of countries) {
    if (!points || points.length === 0) continue;
    
    const duration = flightDurations[flightType][country as "uk" | "japan" | "can"]; 
    
    const restocks = points.filter(p => p.isRestock);

    for (const restock of restocks) {
      const idealDeparture = restock.timestamp - duration;

      if (idealDeparture >= availableDepartureTime) {
        flights.push({
          destination: country as "uk" | "japan" | "can",
          departureTime: idealDeparture,
          arrivalTime: restock.timestamp,
          restockTime: restock.timestamp,
        });
      }
    }
  }

  // ترتيب الرحلات وإرجاع أفضل 5
  return flights.sort((a, b) => a.departureTime - b.departureTime).slice(0, 5);
}