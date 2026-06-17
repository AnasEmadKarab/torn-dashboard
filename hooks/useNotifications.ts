"use client";
import { useState, useEffect } from "react";

interface NotificationSettings {
  arrival: boolean;
  stockDrop: boolean;
  flightAlarm: boolean;
}

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>({
    arrival: false,
    stockDrop: false,
    flightAlarm: false,
  });

  const [isLoaded, setIsLoaded] = useState(false);

  // قراءة الإعدادات المحفوظة عند فتح الموقع
  useEffect(() => {
    const saved = localStorage.getItem("torn_notifications");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, []);

  // دالة لتحديث الإعدادات وحفظها
  const toggleSetting = (key: keyof NotificationSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem("torn_notifications", JSON.stringify(newSettings));

    // إذا فعل خيار جديد، نطلب إذن الإشعارات من المتصفح
    if (newSettings[key] && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  // دالة مساعدة لإرسال الإشعار لو كان مفعل
  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (Notification.permission === "granted") {
      new Notification(title, options);
    }
  };

  return { settings, toggleSetting, isLoaded, sendNotification };
}