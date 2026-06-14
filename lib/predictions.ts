// lib/predictions.ts
export interface RestockPoint {
  timestamp: number;
  predictedStock: number;
  isRestock: boolean;
  isProjected: boolean;
}

const RESTOCK_DELAY_SEC: Record<"uk" | "japan", number> = { uk: 7200, japan: 9900 };
const DEFAULT_DEPLETION_RATE = 50; 
const MAX_STOCK = { uk: 50000, japan: 40000 };

export function projectXanaxTimeline(
  country: "uk" | "japan",
  currentStock: number,
  lastUpdate: number,
  previousStock: number | null,
  previousUpdate: number | null
): RestockPoint[] {
  const points: RestockPoint[] = [];
  let depletionRate = DEFAULT_DEPLETION_RATE;
  if (previousStock !== null && previousUpdate !== null && lastUpdate > previousUpdate) {
    const delta = previousStock - currentStock;
    const dt = lastUpdate - previousUpdate;
    if (delta > 0 && dt > 0) depletionRate = delta / dt;
  }

  points.push({ timestamp: lastUpdate, predictedStock: currentStock, isRestock: false, isProjected: false });

  let currentEmpty = lastUpdate + (currentStock / depletionRate);
  
  // توليد 6 دورات للمستقبل
  for (let i = 0; i < 6; i++) {
    const restockAt = currentEmpty + RESTOCK_DELAY_SEC[country];
    points.push({ timestamp: restockAt, predictedStock: 0, isRestock: false, isProjected: true });
    points.push({ timestamp: restockAt + 1, predictedStock: MAX_STOCK[country], isRestock: true, isProjected: true });
    currentEmpty = restockAt + 1 + (MAX_STOCK[country] / depletionRate);
    points.push({ timestamp: currentEmpty, predictedStock: 0, isRestock: false, isProjected: true });
  }
  return points;
}