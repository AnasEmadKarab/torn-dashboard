export type CountryCode = "uk" | "japan" | "can";

export interface RestockPoint {
  timestamp: number;
  predictedStock: number;
  isRestock: boolean;
  isProjected: boolean;
}

const DEFAULT_MAX_STOCK = { uk: 2500, japan: 2500, can: 2500 }; 

export function projectXanaxTimeline(raw: any, country: CountryCode): RestockPoint[] {
  const points: RestockPoint[] = [];
  const now = Math.floor(Date.now() / 1000); // 👈 اللحظة الحالية

  if (!raw) return points;

  const currentStock = raw.current_quantity || 0;
  const nextExpected = raw.next_predicted_restock || (now + 3600);
  const maxStock = raw.stats?.empirical_max_stock || DEFAULT_MAX_STOCK[country];
  const restockDelay = raw.stats?.avg_restock_delay || (country === 'japan' ? 9900 : 7200);
  
  // 👈 استخدمنا الوقت الفعلي اللي بيخلص فيه الستوك من الـ API (بالثواني)
  const emptyDurationSeconds = (raw.empty_duration_minutes || 10) * 60;

  // 1. الجراف يبلش من "الدقيقة اللي إنت فيها" فقط (إلغاء الماضي)
  points.push({ timestamp: now, predictedStock: currentStock, isRestock: false, isProjected: false });

  if (currentStock > 0) {
    // حساب كم دقيقة ضايل ليخلص الستوك الحالي بناءً على الكمية المتبقية
    const timeRemaining = (currentStock / maxStock) * emptyDurationSeconds;
    let emptyAt = Math.floor(now + timeRemaining);
    if (emptyAt >= nextExpected) emptyAt = nextExpected - 1; 
    points.push({ timestamp: emptyAt, predictedStock: 0, isRestock: false, isProjected: true });
  }

  // 2. معالجة الستوك المتأخر
  let restockAt = nextExpected;
  if (currentStock === 0 && restockAt <= now) {
    restockAt = now + 60; 
  }

  // 3. التوقعات المستقبلية
  for (let i = 0; i < 5; i++) {
    points.push({ timestamp: restockAt, predictedStock: 0, isRestock: false, isProjected: true });
    points.push({ timestamp: restockAt + 1, predictedStock: maxStock, isRestock: true, isProjected: true });
    
    // 👈 الميلان الدقيق: الستوك بينزل للصفر بعد مدة الـ emptyDuration بالضبط
    let currentEmpty = restockAt + 1 + emptyDurationSeconds;
    points.push({ timestamp: currentEmpty, predictedStock: 0, isRestock: false, isProjected: true });

    restockAt = currentEmpty + restockDelay;
  }
  
  return points
    .sort((a, b) => a.timestamp - b.timestamp)
    .filter((point, index, self) => index === 0 || point.timestamp !== self[index - 1].timestamp);
}

export function calculateFlightBuffer(userTravelTimeLeft: number = 0) {
  const now = Math.floor(Date.now() / 1000);
  const bufferSeconds = userTravelTimeLeft > 0 ? userTravelTimeLeft + 180 : 180;
  return now + bufferSeconds; 
}