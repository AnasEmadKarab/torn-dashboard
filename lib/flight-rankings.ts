// lib/flight-rankings.ts
import { leaveTimeForArrival } from "./travel-data";

export interface FlightOption {
  id: string;
  country: "uk" | "japan";
  restockTime: number;
  leaveTime: number;
}

export function getTopFlights(ukData: any[], japanData: any[], count = 5): FlightOption[] {
  const all: FlightOption[] = [];

  for (const point of ukData) {
    if (point.isRestock) {
      all.push({ id: `uk-${point.timestamp}`, country: "uk", restockTime: point.timestamp, leaveTime: leaveTimeForArrival(point.timestamp, "uk") });
    }
  }
  for (const point of japanData) {
    if (point.isRestock) {
      all.push({ id: `japan-${point.timestamp}`, country: "japan", restockTime: point.timestamp, leaveTime: leaveTimeForArrival(point.timestamp, "japan") });
    }
  }

  const now = Date.now() / 1000;
  return all
    .filter((f) => f.leaveTime > now)
    .sort((a, b) => a.leaveTime - b.leaveTime)
    .slice(0, count);
}