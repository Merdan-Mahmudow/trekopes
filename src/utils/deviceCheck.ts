import type { Telegram } from "telegram-web-app";
import { debugLog } from "./logger";

/**
 * Проверяет, разрешено ли устройство для использования приложения
 * Разрешены только iOS и Android платформы в Telegram WebApp
 */
export function isDeviceAllowed(tg: Telegram | null | undefined): {
  allowed: boolean;
  reason?: string;
} {
  // Проверяем платформу Telegram WebApp
  if (!tg || !tg.WebApp) {
    return {
      allowed: true, // Разрешаем, если Telegram WebApp не загружен (для разработки)
    };
    
  }

  const platform = tg.WebApp.platform?.toLowerCase() || "";
  debugLog("[DeviceCheck] Платформа:", platform);
  
  // Разрешены только iOS и Android
  if (platform !== "ios" && platform !== "android") {
    debugLog("[DeviceCheck] Платформа не разрешена:", platform);
    return {
      allowed: false,
      reason: "Приложение доступно только на iOS и Android",
    };
  }

  debugLog("[DeviceCheck] Устройство разрешено");
  return {
    allowed: true,
  };
}

