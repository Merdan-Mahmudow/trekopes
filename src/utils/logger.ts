/**
 * Утилиты для логгирования с проверкой на debug режим
 */

const isDebug = () => {
  const debug = import.meta.env.VITE_DEBUG;
  // VITE_DEBUG может быть boolean или строкой в зависимости от окружения
  if (typeof debug === 'boolean') {
    return debug;
  }
  // В runtime может быть строкой, поэтому используем type assertion
  const debugStr = String(debug).toLowerCase();
  return debugStr === 'true' || debugStr === '1';
};

/**
 * Логирование отладочной информации (только в debug режиме)
 */
export const debugLog = (...args: unknown[]) => {
  if (isDebug()) {
    console.log(...args);
  }
};

/**
 * Логирование предупреждений (только в debug режиме)
 */
export const debugWarn = (...args: unknown[]) => {
  if (isDebug()) {
    console.warn(...args);
  }
};

/**
 * Логирование ошибок (всегда, но с дополнительной информацией в debug режиме)
 */
export const logError = (message: string, error?: unknown, context?: Record<string, unknown>) => {
  if (isDebug()) {
    console.error(`[ERROR] ${message}`, { error, context });
  } else {
    // В продакшене логируем только критичные ошибки без деталей
    console.error(`[ERROR] ${message}`);
  }
};

/**
 * Логирование телеметрии (всегда, но с дополнительной информацией в debug режиме)
 */
export const logTelemetry = (action: string, data?: Record<string, unknown>) => {
  if (isDebug()) {
    console.log('[Telemetry]', action, data);
  }
  // Здесь можно добавить отправку на сервер аналитики
  // Например: analytics.track(action, data)
};

/**
 * Логирование аналитики событий (всегда)
 */
export const logAnalytics = (event: string, data?: Record<string, unknown>) => {
  if (isDebug()) {
    console.log(`[Analytics] ${event}`, data);
  }
  // Здесь можно добавить отправку на сервер аналитики
  // Например: analytics.track(event, data)
};

