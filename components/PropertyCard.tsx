"use client";

export default function PropertyCard({ properties, status }: any) {
  // 1. تحديد اسم العقار الحالي
  const propertyName = typeof status === "string" ? status : status?.name || "No Property";

  let isRented = false;
  let rentDaysLeft = 0;
  let upkeep = 0;

  // 2. قراءة الداتا بشكل ذكي (لأن تورن بتبعتها كـ Object مش Array)
  if (properties && typeof properties === 'object') {
    const propArray = Array.isArray(properties) ? properties : Object.values(properties);
    
    // سحب أول عقار (واللي هو غالباً العقار الفعال باللعبة)
    const activeProp: any = propArray[0]; 

    if (activeProp) {
      upkeep = activeProp.upkeep ?? activeProp.staff_cost ?? 0;
      // إذا في أيام إيجار أكبر من صفر، يعني إنت مستأجر
      if (activeProp.rent_left && activeProp.rent_left > 0) {
        isRented = true;
        rentDaysLeft = activeProp.rent_left;
      }
    }
  }

  return (
    <div className="glass-panel p-5 border-t-2 border-cyan-500/50 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>

      <h2 className="text-xl font-bold text-cyan-300 mb-1 relative z-10">{propertyName}</h2>
      
      <p className="text-sm text-gray-400 mb-3 relative z-10">
        Daily Upkeep + Staff: <span className="text-white font-medium">${upkeep.toLocaleString()}</span>
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