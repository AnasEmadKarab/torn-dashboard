// hooks/useNotifications.ts
"use client";
import { useState, useEffect, useCallback } from "react";

interface AppSettings {
  arrival: boolean;
  stockDrop: boolean;
  flightAlarm: boolean;
  showStats: boolean;
  showProperty: boolean;
  showVault: boolean;
  showCooldowns: boolean;
  showRadar: boolean;
  showOC: boolean;
  showCanada: boolean;
}

export function useNotifications() {
  const [settings, setSettings] = useState<AppSettings>({
    arrival: false,
    stockDrop: false,
    flightAlarm: false,
    showStats: true,
    showProperty: true,
    showVault: true,
    showCooldowns: true,
    showRadar: true,
    showOC: true,
    showCanada: true,
  });

  const [isLoaded, setIsLoaded] = useState(false);

  const loadSettings = useCallback(() => {
    const saved = localStorage.getItem("torn_app_settings");
    if (saved) {
      setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
    }
  }, []);

  useEffect(() => {
    loadSettings();
    setIsLoaded(true);

    const handleUpdate = () => loadSettings();
    window.addEventListener('torn_settings_updated', handleUpdate);
    
    return () => window.removeEventListener('torn_settings_updated', handleUpdate);
  }, [loadSettings]);

  const toggleSetting = (key: keyof AppSettings) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: !prev[key] };
      localStorage.setItem("torn_app_settings", JSON.stringify(newSettings));
      
      // 👈 تم حل مشكلة React بوضع الـ dispatch داخل setTimeout
      setTimeout(() => {
        window.dispatchEvent(new Event('torn_settings_updated'));
      }, 0);

      if ((key === 'arrival' || key === 'stockDrop' || key === 'flightAlarm') && newSettings[key] && Notification.permission === "default") {
        Notification.requestPermission();
      }
      
      return newSettings;
    });
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (Notification.permission === "granted") {
      new Notification(title, options);
    }
  };

  return { settings, toggleSetting, isLoaded, sendNotification };
}