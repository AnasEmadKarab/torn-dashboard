"use client";

export default function PropertyCard({ properties }: any) {
  // 1. جلب أول عقار من المصفوفة (واللي هو العقار الفعال/الأساسي حسب ترتيب تورن)
  const activeProp = properties && Array.isArray(properties) && properties.length > 0 ? properties[0] : null;

  // 2. قيم افتراضية في حال الحساب ما عنده بيت
  const propertyName = activeProp?.property?.name || "No Property";
  let isRented = false;
  let rentDaysLeft = 0;
  let upkeepTotal = 0;

  if (activeProp) {
    // السحر هنا: فك الـ Object وجمع مصاريف البيت + مصاريف الطاقم
    if (activeProp.upkeep && typeof activeProp.upkeep === 'object') {
      upkeepTotal = (activeProp.upkeep.property || 0) + (activeProp.upkeep.staff || 0);
    }

    // التحقق من حالة الإيجار والأيام المتبقية
    if (activeProp.status === "rented" && activeProp.rental_period_remaining > 0) {
      isRented = true;
      rentDaysLeft = activeProp.rental_period_remaining;
    }
  }

  return (
    <div className="glass-panel p-5 border-t-2 border-cyan-500/50 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>

      <h2 className="text-xl font-bold text-cyan-300 mb-1 relative z-10">{propertyName}</h2>
      
      <p className="text-sm text-gray-400 mb-3 relative z-10">
        Daily Upkeep + Staff: <span className="text-white font-medium">${upkeepTotal.toLocaleString()}</span>
      </p>

      <div className="relative z-10">
        {isRented ? (
          <p className="text-2xl font-bold text-white">
            {rentDaysLeft} <span className="text-sm font-normal text-gray-400">days remaining</span>
          </p>
        ) : (
          <p className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            👑 Property Owner
          </p>
        )}
      </div>
    </div>
  );
}