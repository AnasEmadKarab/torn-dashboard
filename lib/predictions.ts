export interface RestockPoint {
  timestamp: number;
  predictedStock: number;
  isRestock: boolean;
  isProjected: boolean;
}

// بناءً على طلبك: قللنا الماكس ستوك ليكون أقرب للواقع (الزاناكس بينزل بدفعات صغيرة مش 50 ألف)
const DEFAULT_MAX_STOCK = { uk: 2500, japan: 2500 }; 

export function projectXanaxTimeline(
  country: "uk" | "japan",
  currentStock: number,
  lastUpdate: number,
  nextExpected: number, // 👈 صار يستقبل الوقت الدقيق من الباك إند!
  maxStock: number = DEFAULT_MAX_STOCK[country],
  restockDelay: number = country === 'uk' ? 7200 : 9900,
  depletionRate: number = 5 
): RestockPoint[] {
  const points: RestockPoint[] = [];

  // 1. تسجيل النقطة الحالية
  points.push({ timestamp: lastUpdate, predictedStock: currentStock, isRestock: false, isProjected: false });

  // 2. حساب وقت انتهاء الكمية الحالية (عشان الرسم البياني ينزل للصفر)
  // استخدمنا Math.max عشان نتجنب القسمة على صفر أو أرقام سالبة
  let currentEmpty = currentStock > 0 ? Math.floor(lastUpdate + (currentStock / Math.max(depletionRate, 1))) : lastUpdate;
  
  // 3. النقطة الأولى للمستقبل هي بالضبط اللي حسبها السيرفر بذكاء!
  let restockAt = nextExpected;

  // 4. توليد 6 دورات للمستقبل عشان الرسم البياني يطلع كامل ومستمر
  for (let i = 0; i < 6; i++) {
    // لحظة ما قبل الريستوك (الستوك صفر)
    points.push({ timestamp: restockAt, predictedStock: 0, isRestock: false, isProjected: true });
    
    // لحظة الريستوك (الستوك بيضرب للماكس الواقعي)
    points.push({ timestamp: restockAt + 1, predictedStock: maxStock, isRestock: true, isProjected: true });
    
    // متى رح يخلص هاد الماكس ستوك؟
    currentEmpty = Math.floor(restockAt + 1 + (maxStock / Math.max(depletionRate, 1)));
    points.push({ timestamp: currentEmpty, predictedStock: 0, isRestock: false, isProjected: true });

    // وقت الريستوك اللي بعده
    restockAt = currentEmpty + restockDelay;
  }
  
  return points;
}

// --- دالة جديدة: ذكاء حساب رحلات الطيران ---
export function calculateFlightBuffer(
  userTravelTimeLeft: number = 0 // بتمررها من الداتا تبعت الـ User API
) {
  const now = Math.floor(Date.now() / 1000);
  
  // إذا كنت مسافر، البفر هو: وقت رجوعك + 3 دقايق (180 ثانية) تجهيز
  // إذا كنت في تورن أصلاً: البفر 3 دقايق بس عشان تلحق تجهز حالك وتطير
  const bufferSeconds = userTravelTimeLeft > 0 ? userTravelTimeLeft + 180 : 180;
  
  // هاد هو "نقطة الصفر" تبعتك، الوقت اللي مسموح لك تقلع فيه
  return now + bufferSeconds; 
}