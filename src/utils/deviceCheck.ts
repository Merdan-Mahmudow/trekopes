import type { Telegram } from "telegram-web-app";

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
  console.log("[DeviceCheck] Платформа:", platform);
  
  // Разрешены только iOS и Android
  if (platform !== "ios" && platform !== "android") {
    console.log("[DeviceCheck] Платформа не разрешена:", platform);
    return {
      allowed: false,
      reason: "Приложение доступно только на iOS и Android",
    };
  }

  console.log("[DeviceCheck] Устройство разрешено");
  return {
    allowed: true,
  };
}

