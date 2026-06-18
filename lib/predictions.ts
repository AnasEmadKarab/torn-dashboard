export type CountryCode = "uk" | "japan" | "can";

export interface RestockPoint {
  timestamp: number;
  predictedStock: number;
  isRestock: boolean;
  isProjected: boolean;
}

// ضفنا كندا هنا
const DEFAULT_MAX_STOCK = { uk: 2500, japan: 2500, can: 2500 }; 

export function projectXanaxTimeline(
  country: CountryCode,
  currentStock: number,
  lastUpdate: number,
  nextExpected: number, 
  maxStock: number = DEFAULT_MAX_STOCK[country],
  restockDelay: number = country === 'japan' ? 9900 : 7200, // كندا وبريطانيا نفس المتوسط تقريباً
  depletionRate: number = 5 
): RestockPoint[] {
  const points: RestockPoint[] = [];

  points.push({ timestamp: lastUpdate, predictedStock: currentStock, isRestock: false, isProjected: false });

  if (currentStock > 0) {
    let emptyAt = Math.floor(lastUpdate + (currentStock / Math.max(depletionRate, 1)));
    if (emptyAt >= nextExpected) emptyAt = nextExpected - 1; 
    points.push({ timestamp: emptyAt, predictedStock: 0, isRestock: false, isProjected: true });
  }
  
  let restockAt = nextExpected;

  for (let i = 0; i < 6; i++) {
    points.push({ timestamp: restockAt, predictedStock: 0, isRestock: false, isProjected: true });
    points.push({ timestamp: restockAt + 1, predictedStock: maxStock, isRestock: true, isProjected: true });
    
    let currentEmpty = Math.floor(restockAt + 1 + (maxStock / Math.max(depletionRate, 1)));
    points.push({ timestamp: currentEmpty, predictedStock: 0, isRestock: false, isProjected: true });

    restockAt = currentEmpty + restockDelay;
  }
  
  return points;
}

export function calculateFlightBuffer(userTravelTimeLeft: number = 0) {
  const now = Math.floor(Date.now() / 1000);
  const bufferSeconds = userTravelTimeLeft > 0 ? userTravelTimeLeft + 180 : 180;
  return now + bufferSeconds; 
}