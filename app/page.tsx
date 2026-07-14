"use client";
import { useState, useEffect } from "react";
import { useTornUser } from "@/hooks/useTornUser";
import { useXanaxPredictions } from "@/hooks/useXanaxPredictions";
import { useNotifications } from "@/hooks/useNotifications";
import { getTopFlights, FlightOption } from "@/lib/flight-rankings";
import StatsPanel from "@/components/StatsPanel";
import WeaverTraders from "@/components/WeaverTraders";
import CooldownTimers from "@/components/CooldownTimers";
import PropertyCard from "@/components/PropertyCard";
import MoneyVaultCard from "@/components/MoneyVaultCard";
import OCFilterList from "@/components/OCFilterList";
import TravelRadar from "@/components/TravelRadar";
import XanaxTimelineChart from "@/components/XanaxTimelineChart";
import FlightScheduler from "@/components/FlightScheduler";
import DepartureAlarm from "@/components/DepartureAlarm";
import GlobalChat from "@/components/GlobalChat";
import NotificationSettings from "@/components/NotificationSettings";

export default function Dashboard() {
  const [scheduledFlight, setScheduledFlight] = useState<FlightOption | null>(null);
  const [flightType, setFlightType] = useState<"standard" | "airstrip">("standard");

  const { settings, isLoaded } = useNotifications();
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useTornUser();
  const { data: xanax } = useXanaxPredictions();

  useEffect(() => {
    const savedType = localStorage.getItem("flightType") as "standard" | "airstrip";
    if (savedType) setFlightType(savedType);
  }, []);

  // 👈 إرسال نبضة التواجد فقط (بدون جلب العداد لأن الشات يتكفل به)
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        await fetch("/api/heartbeat", { method: "POST" });
      } catch (err) {}
    };

    sendHeartbeat();
    const heartbeatInterval = setInterval(sendHeartbeat, 60000);

    return () => clearInterval(heartbeatInterval);
  }, []);

  const handleFlightTypeChange = (type: "standard" | "airstrip") => {
    setFlightType(type);
    localStorage.setItem("flightType", type);
  };

  // شاشة التحميل
  if (userLoading || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-cyan-300 font-medium font-mono text-xl animate-pulse">
        Loading Habibi Dashboard...
      </div>
    );
  }

  // التأكد من حالة المستخدم
  const hasUser = user !== null && !userError;
  const myTravelTimeLeft = hasUser ? (user.travel?.time_left ?? 0) : 0;
  const topFlights = xanax
    ? getTopFlights(
        xanax.uk,
        xanax.japan,
        settings.showCanada ? xanax.can : [],
        myTravelTimeLeft,
        flightType,
      )
    : [];

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6 pb-20">
      <div className="grid grid-cols-[auto_1fr_auto] items-center mb-6 md:mb-8 gap-2">
        <div className="w-10"></div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-pink-500 text-center font-sora drop-shadow-lg tracking-tight whitespace-nowrap">
          Habibi Dashboard
        </h1>

        <div className="w-10 flex justify-end">
          <NotificationSettings />
        </div>
      </div>

      {hasUser ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {settings.showStats && <StatsPanel bars={user.bars} />}
            {settings.showProperty && (
              <PropertyCard
                properties={user.properties}
                status={user.property}
              />
            )}
            {settings.showVault && (
              <MoneyVaultCard
                cashOnHand={user.money?.wallet ?? user.money_onhand ?? 0}
                vaultBalance={user.money?.faction?.money ?? 0}
                hasFaction={user.faction?.faction_id !== 0 && !!user.faction?.faction_id}
              />
            )}
          </div>

          {settings.showCooldowns && (
            <CooldownTimers
              cooldowns={{
                drug: user.cooldowns?.drug ?? 0,
                medical: user.cooldowns?.medical ?? 0,
                booster: user.cooldowns?.booster ?? 0,
              }}
            />
          )}

          {settings.showRadar && <TravelRadar travel={user.travel} />}

          {user.travel?.destination === "Torn" && (user.travel?.time_left ?? 0) === 0 && (
            <WeaverTraders currentDestination={user.travel?.destination} />
          )}

          {settings.showOC && (
            <OCFilterList
              allCrimes={user.organizedcrimes ?? []}
              activeCrime={user.organizedCrime}
            />
          )}
        </>
      ) : (
        /* وضع الزائر (Guest Mode) */
        <div className="glass-panel p-8 text-center border border-dashed border-gray-600 bg-gray-900/50 mt-4">
          <p className="text-xl font-bold text-white mb-2">
            Welcome to Habibi Dashboard! ☕
          </p>
          
          {userError && (
            <div className="inline-block bg-pink-500/10 border border-pink-500/30 rounded-lg p-3 mb-4 max-w-lg">
              <p className="text-pink-400 text-sm font-medium">
                ⚠️ API Notice: {(userError as Error).message}
              </p>
            </div>
          )}

          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            You are currently in <strong className="text-white">Guest Mode</strong>. You can view global Xanax restocks and join the chat below. 
            Open the <strong className="text-cyan-400">Settings ⚙️</strong> in the top right to add your Torn API Key and unlock player stats, properties, and vaults securely.
          </p>
        </div>
      )}

      {/* قسم الستوك والرحلات متاح للجميع */}
      {xanax && (
        <>
          <XanaxTimelineChart
            ukData={xanax.uk}
            japanData={xanax.japan}
            canData={settings.showCanada ? xanax.can : []}
            rawUk={xanax.rawUk}
            rawJapan={xanax.rawJapan}
            rawCan={settings.showCanada ? xanax.rawCan : null}
            highestSellPrice={xanax.highestSellPrice}
            flightType={flightType}
            showCanada={settings.showCanada}
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
            <FlightScheduler
              flights={topFlights}
              onSelect={setScheduledFlight}
            />
            <DepartureAlarm flight={scheduledFlight} />
          </div>
        </>
      )}
      <GlobalChat />
    </div>
  );
}