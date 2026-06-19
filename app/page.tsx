"use client";
import { useState, useEffect } from "react";
import { useTornUser } from "@/hooks/useTornUser";
import { useXanaxPredictions } from "@/hooks/useXanaxPredictions";
import { getTopFlights, FlightOption } from "@/lib/flight-rankings";
import StatsPanel from "@/components/StatsPanel";
import WeaverTraders from "@/components/WeaverTraders"; // 👈 ضيف هذا السطر
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
  const [flightType, setFlightType] = useState<"standard" | "airstrip">("standard");
  
  // 👈 حالة إظهار كندا (محفوظة في localStorage)
  const [showCanada, setShowCanada] = useState(true);

  const { data: user, isLoading: userLoading, error: userError } = useTornUser();
  const { data: xanax } = useXanaxPredictions();

  useEffect(() => {
    const savedType = localStorage.getItem("flightType") as "standard" | "airstrip";
    if (savedType) setFlightType(savedType);
    
    // تحميل تفضيل كندا
    const savedCanada = localStorage.getItem("showCanada");
    if (savedCanada !== null) setShowCanada(savedCanada === "true");
  }, []);

  const handleFlightTypeChange = (type: "standard" | "airstrip") => {
    setFlightType(type);
    localStorage.setItem("flightType", type);
  };

  const toggleCanada = () => {
    const newValue = !showCanada;
    setShowCanada(newValue);
    localStorage.setItem("showCanada", newValue.toString());
  };

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

  const myTravelTimeLeft = user.travel?.time_left ?? 0;
  
const topFlights = xanax ? getTopFlights(xanax.uk, xanax.japan, showCanada ? xanax.can : [], myTravelTimeLeft, flightType) : [];
  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-2 md:mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-cyan-300 text-center md:text-left">
          Torn Smart Dashboard
        </h1>
        {/* 👈 زر الإعدادات */}
        <button 
          onClick={toggleCanada}
          className={`mt-3 md:mt-0 px-4 py-2 rounded-lg font-bold text-sm transition-all border ${showCanada ? "bg-emerald-600/20 border-emerald-500 text-emerald-400" : "bg-gray-800 border-gray-600 text-gray-400"}`}
        >
          {showCanada ? "🇨🇦 Canada: ON" : "🇨🇦 Canada: OFF"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <StatsPanel bars={user.bars} />
        <PropertyCard properties={user.properties} status={user.property} />
        <MoneyVaultCard
          cashOnHand={user.money?.wallet ?? user.money_onhand ?? 0}
          vaultBalance={user.money?.faction?.money ?? 0}
          hasFaction={user.faction?.faction_id !== 0 && !!user.faction?.faction_id} 
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
      <WeaverTraders />
      <OCFilterList crimes={user.organizedcrimes ?? []} />


      {xanax && (
        <>
          <XanaxTimelineChart 
            ukData={xanax.uk} 
            japanData={xanax.japan} 
            canData={showCanada ? xanax.can : []} 
            rawUk={xanax.rawUk} 
            rawJapan={xanax.rawJapan} 
            rawCan={showCanada ? xanax.rawCan : null} 
            highestSellPrice={xanax.highestSellPrice}
            flightType={flightType} 
            showCanada={showCanada} // 👈 مررنا الحالة للرسم البياني
          />
          
          <div className="flex justify-center md:justify-start gap-2 mb-2">
            <button 
              onClick={() => handleFlightTypeChange("standard")}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${flightType === "standard" ? "bg-cyan-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
            >
              Standard Flight
            </button>
            <button 
              onClick={() => handleFlightTypeChange("airstrip")}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${flightType === "airstrip" ? "bg-pink-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
            >
              Private Airstrip (PI)
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <FlightScheduler flights={topFlights} onSelect={setScheduledFlight} />
            <DepartureAlarm flight={scheduledFlight} />
          </div>
        </>
      )}
    </div>
  );
}