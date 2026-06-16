"use client";

export default function PropertyCard({ properties, status }: any) {
  // 1. تحديد اسم العقار الحالي (Torn بتبعت الاسم جاهز جوا user.property)
  const propertyName = typeof status === "string" ? status : status?.name || "No Property";

  // 2. البحث عن تفاصيل الإيجار إذا كان العقار موجود جوا قائمة properties
  let isRented = false;
  let rentDaysLeft = 0;
  let upkeep = 0;

  // إذا كان properties عبارة عن مصفوفة (Array)
  if (properties && Array.isArray(properties)) {
    const activeProp = properties.find((p: any) => p.name === propertyName || p.type === propertyName);
    if (activeProp) {
      upkeep = activeProp.upkeep ?? 0;
      if (activeProp.rent_left && activeProp.rent_left > 0) {
        isRented = true;
        rentDaysLeft = activeProp.rent_left;
      }
    }
  }

  return (
    <div className="glass-panel p-5 border-t-2 border-cyan-500/50 relative overflow-hidden">
      {/* إضاءة خفيفة بالخلفية */}
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