// components/PropertyCard.tsx
export default function PropertyCard({ properties, status }: { properties: any; status?: any }) {
  if (!properties && !status) return null;

  let pi: any = null;
  
  if (Array.isArray(properties)) {
    pi = properties.find((p: any) => p.property?.name === "Private Island" || p.name === "Private Island" || p.property?.id === 13);
  } else if (properties && typeof properties === 'object') {
    const piKey = Object.keys(properties).find(k => properties[k]?.property?.name === "Private Island" || properties[k]?.name === "Private Island" || properties[k]?.property?.id === 13);
    pi = piKey ? properties[piKey] : null;
  }

  if (!pi && status && (status.property?.name === "Private Island" || status.name === "Private Island" || status.property?.id === 13)) {
    pi = status;
  }

  if (!pi) return null;

  // القراءة الصحيحة بناءً على الـ JSON: الدخول لداخل كائن upkeep
  const baseUpkeep = Number(pi.upkeep?.property) || Number(pi.upkeep_cost) || 0;
  const staffCost = Number(pi.upkeep?.staff) || Number(pi.staff_cost) || 0;
  const dailyUpkeep = baseUpkeep + staffCost;

  // القراءة الصحيحة للأيام المتبقية
  const daysLeft = Number(pi.rental_period_remaining) || Number(pi.upkeep?.days_remaining) || Number(pi.days_left) || 0;
  const lowDays = daysLeft <= 3 && daysLeft > 0;

  return (
    <div className={`glass-panel p-5 ${lowDays ? "glow-pink flash-alert" : "glow-cyan"}`}>
      <h2 className="text-lg font-semibold mb-2 text-cyan-300">Private Island</h2>
      <p className="text-sm text-gray-400 mt-1">
        Daily Upkeep + Staff: <span className="font-mono text-white">${dailyUpkeep.toLocaleString()}</span>
      </p>
      <p className="text-2xl font-bold mt-2">
        {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining
      </p>
      {lowDays && <p className="text-pink-400 text-sm mt-1">⚠ Rental/Upkeep ending soon!</p>}
    </div>
  );
}