"use client";
import { useState } from "react";
import { useTornUser } from "@/hooks/useTornUser";
import { useXanaxPredictions } from "@/hooks/useXanaxPredictions";
import { getTopFlights, FlightOption } from "@/lib/flight-rankings";

import StatsPanel from "@/components/StatsPanel";
import CooldownTimers from "@/components/CooldownTimers";
import PropertyCard from "@/components/PropertyCard";
import MoneyVaultCard from "@/components/MoneyVaultCard";
import OCFilterList from "@/components/OCFilterList";
import TravelRadar from "@/components/TravelRadar";
import XanaxTimelineChart from "@/components/XanaxTimelineChart";
import FlightScheduler from "@/components/FlightScheduler";
import DepartureAlarm from "@/components/DepartureAlarm";

export default function Dashboard() {
  const [scheduledFlight, setScheduledFlight] = useState<FlightOption | null>(null);

  const { data: user, isLoading: userLoading, error: userError } = useTornUser();
  const { data: xanax } = useXanaxPredictions();

  if (userLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-cyan-300">Loading dashboard...</div>;
  }

  if (userError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel p-6 glow-pink text-pink-300">
          Error: {(userError as Error).message}. Check TORN_API_KEY in .env.local.
        </div>
      </div>
    );
  }

  const topFlights = xanax ? getTopFlights(xanax.uk, xanax.japan) : [];

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-cyan-300 mb-2">Torn Smart Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsPanel bars={user.bars} />
        <PropertyCard properties={user.properties} status={user.property} />
        <MoneyVaultCard
          cashOnHand={user.money?.wallet ?? user.money_onhand ?? 0}
          /* قراءة فلوس الفاكشن من ملف اليوزر مباشرة */
          vaultBalance={user.money?.faction?.money ?? 0}
        />
      </div>

      <CooldownTimers
        cooldowns={{
          drug: user.cooldowns?.drug ?? 0,
          medical: user.cooldowns?.medical ?? 0,
          booster: user.cooldowns?.booster ?? 0,
        }}
      />

      <TravelRadar travel={user.travel} />

      {/* تمرير قائمة الـ OCs المتاحة للمستخدم */}
      <OCFilterList crimes={user.organizedcrimes ?? []} />

      {xanax && (
        <>
          <XanaxTimelineChart 
            ukData={xanax.uk} 
            japanData={xanax.japan} 
            ukPrice={xanax.rawUk?.cost} 
            japanPrice={xanax.rawJapan?.cost} 
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FlightScheduler flights={topFlights} onSelect={setScheduledFlight} />
            <DepartureAlarm flight={scheduledFlight} />
          </div>
        </>
      )}
    </div>
  );
}