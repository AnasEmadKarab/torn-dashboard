export interface RestockPoint {
  timestamp: number;
  predictedStock: number;
  isRestock: boolean;
  isProjected: boolean;
}

// قللنا الماكس ستوك ليكون أقرب للواقع
const DEFAULT_MAX_STOCK = { uk: 2500, japan: 2500 }; 

export function projectXanaxTimeline(
  country: "uk" | "japan",
  currentStock: number,
  lastUpdate: number,
  nextExpected: number, 
  maxStock: number = DEFAULT_MAX_STOCK[country],
  restockDelay: number = country === 'uk' ? 7200 : 9900,
  depletionRate: number = 5 
): RestockPoint[] {
  const points: RestockPoint[] = [];

  // 1. تسجيل النقطة الحالية
  points.push({ timestamp: lastUpdate, predictedStock: currentStock, isRestock: false, isProjected: false });

  // 2. إصلاح المثلث الطويل: حساب وقت انتهاء الستوك الحالي وإضافته للجراف!
  if (currentStock > 0) {
    let emptyAt = Math.floor(lastUpdate + (currentStock / Math.max(depletionRate, 1)));
    
    // إذا كان السحب بطيء جداً لدرجة إنه رح يخلص بعد الريستوك الجاي، بنقص ثانية عشان ما يتداخلوا
    if (emptyAt >= nextExpected) emptyAt = nextExpected - 1; 
    
    // 👈 هاد السطر اللي كان ناقص عندك! هو اللي بينزل الخط للصفر
    points.push({ timestamp: emptyAt, predictedStock: 0, isRestock: false, isProjected: true });
  }
  
  // 3. النقطة الأولى للمستقبل 
  let restockAt = nextExpected;

  // 4. توليد 6 دورات للمستقبل عشان الرسم البياني يطلع كامل ومستمر
  for (let i = 0; i < 6; i++) {
    // لحظة ما قبل الريستوك (الستوك صفر)
    points.push({ timestamp: restockAt, predictedStock: 0, isRestock: false, isProjected: true });
    
    // لحظة الريستوك (الستوك بيضرب للماكس)
    points.push({ timestamp: restockAt + 1, predictedStock: maxStock, isRestock: true, isProjected: true });
    
    // متى رح يخلص هاد الماكس ستوك؟
    let currentEmpty = Math.floor(restockAt + 1 + (maxStock / Math.max(depletionRate, 1)));
    points.push({ timestamp: currentEmpty, predictedStock: 0, isRestock: false, isProjected: true });

    // وقت الريستوك اللي بعده
    restockAt = currentEmpty + restockDelay;
  }
  
  return points;
}

// --- دالة حساب رحلات الطيران ---
export function calculateFlightBuffer(
  userTravelTimeLeft: number = 0
) {
  const now = Math.floor(Date.now() / 1000);
  const bufferSeconds = userTravelTimeLeft > 0 ? userTravelTimeLeft + 180 : 180;
  return now + bufferSeconds; 
}