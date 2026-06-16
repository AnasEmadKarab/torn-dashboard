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
    return <div className="min-h-screen flex items-center justify-center text-cyan-300 font-medium">Loading dashboard...</div>;
  }

  if (userError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel p-4 md:p-6 glow-pink text-pink-300 text-center text-sm md:text-base">
          Error: {(userError as Error).message}. Check TORN_API_KEY in .env.local.
        </div>
      </div>
    );
  }

  // سحب وقت السفر المتبقي تبعك (إذا كنت مسافر) لتمريره لخوارزمية الطيران
  const myTravelTimeLeft = user.travel?.time_left ?? 0;
  
  // تمرير المتغير الجديد لمعادلة الرحلات
  const topFlights = xanax ? getTopFlights(xanax.uk, xanax.japan, myTravelTimeLeft) : [];

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-cyan-300 mb-2 md:mb-4 text-center md:text-left">
        Torn Smart Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <StatsPanel bars={user.bars} />
        <PropertyCard properties={user.properties} status={user.property} />
        <MoneyVaultCard
          cashOnHand={user.money?.wallet ?? user.money_onhand ?? 0}
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
      <OCFilterList crimes={user.organizedcrimes ?? []} />

      {xanax && (
        <>
          <XanaxTimelineChart 
            ukData={xanax.uk} 
            japanData={xanax.japan} 
            ukPrice={xanax.rawUk?.cost} 
            japanPrice={xanax.rawJapan?.cost} 
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <FlightScheduler flights={topFlights} onSelect={setScheduledFlight} />
            <DepartureAlarm flight={scheduledFlight} />
          </div>
        </>
      )}
    </div>
  );
}