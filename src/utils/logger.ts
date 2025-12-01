/**
 * Утилиты для логгирования с интеграцией LogRocket
 */

import LogRocket from 'logrocket';

const isDebug = () => {
  const debug = import.meta.env.VITE_DEBUG;
  if (typeof debug === 'boolean') {
    return debug;
  }
  const debugStr = String(debug).toLowerCase();
  return debugStr === 'true' || debugStr === '1';
};

/**
 * Типы событий для телеметрии
 */
export type TelemetryEventType = 
  | 'navigation'
  | 'user_action'
  | 'api_request'
  | 'api_response'
  | 'api_error'
  | 'websocket'
  | 'generation'
  | 'payment'
  | 'auth'
  | 'player'
  | 'chat'
  | 'subscription'
  | 'error'
  | 'performance';

/**
 * Интерфейс для данных телеметрии
 */
interface TelemetryData {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Идентификация пользователя в LogRocket
 */
export const identifyUser = (
  userId: string,
  traits?: {
    name?: string;
    email?: string;
    telegram_chat_id?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    is_pro?: boolean;
    subscription_type?: string;
    [key: string]: string | number | boolean | undefined;
  }
) => {
  try {
    // Фильтруем undefined значения перед передачей в LogRocket
    const cleanTraits = traits ? Object.fromEntries(
      Object.entries(traits).filter(([_, value]) => value !== undefined)
    ) as Record<string, string | number | boolean> : {};
    
    LogRocket.identify(userId, cleanTraits);
    if (isDebug()) {
      console.log('[LogRocket] User identified:', userId, cleanTraits);
    }
  } catch (error) {
    console.error('[LogRocket] Failed to identify user:', error);
  }
};

/**
 * Логирование отладочной информации (только в debug режиме)
 */
export const debugLog = (...args: any[]) => {
  if (isDebug()) {
    console.log(...args);
  }
};

/**
 * Логирование предупреждений (только в debug режиме)
 */
export const debugWarn = (...args: any[]) => {
  if (isDebug()) {
    console.warn(...args);
  }
};

/**
 * Логирование ошибок с отправкой в LogRocket
 */
export const logError = (
  message: string, 
  error?: Error | unknown, 
  context?: Record<string, any>
) => {
  // Всегда логируем в консоль
  if (isDebug()) {
    console.error(`[ERROR] ${message}`, { error, context });
  } else {
    console.error(`[ERROR] ${message}`);
  }

  // Отправляем в LogRocket
  try {
    const errorObj = error instanceof Error ? error : new Error(String(error || message));
    
    // Фильтруем undefined значения
    const cleanContext = context ? Object.fromEntries(
      Object.entries(context).filter(([_, value]) => value !== undefined)
    ) as Record<string, string | number | boolean> : {};
    
    const extra: Record<string, string | number | boolean> = {
      message,
      originalError: error instanceof Error ? error.message : String(error),
      ...cleanContext
    };
    
    if (error instanceof Error && error.stack) {
      extra.stack = error.stack;
    }
    
    LogRocket.captureException(errorObj, {
      tags: {
        errorType: 'application_error',
        ...cleanContext
      },
      extra
    });
  } catch (e) {
    console.error('[LogRocket] Failed to capture exception:', e);
  }
};

/**
 * Логирование API ошибок
 */
export const logApiError = (
  endpoint: string,
  method: string,
  statusCode: number | undefined,
  error: Error | unknown,
  requestData?: any
) => {
  const context = {
    endpoint,
    method,
    statusCode: statusCode || 'unknown',
    requestData: requestData ? JSON.stringify(requestData).slice(0, 500) : undefined
  };

  logError(`API Error: ${method.toUpperCase()} ${endpoint}`, error, context);

  // Дополнительное событие для аналитики
  logTelemetry('api_error', {
    endpoint,
    method,
    status_code: statusCode || 0,
    error_message: error instanceof Error ? error.message : String(error)
  });
};

/**
 * Логирование телеметрии событий
 */
export const logTelemetry = (
  eventType: TelemetryEventType, 
  data?: TelemetryData
) => {
  const eventName = `telemetry_${eventType}`;
  
  if (isDebug()) {
    console.log(`[Telemetry] ${eventType}`, data);
  }

  // Отправляем кастомное событие в LogRocket
  try {
    LogRocket.track(eventName, data || {});
  } catch (e) {
    console.error('[LogRocket] Failed to track event:', e);
  }
};

/**
 * Логирование действий пользователя
 */
export const logUserAction = (
  action: string,
  details?: TelemetryData
) => {
  logTelemetry('user_action', {
    action,
    ...details
  });
};

/**
 * Логирование навигации
 */
export const logNavigation = (
  from: string,
  to: string,
  method?: 'click' | 'back' | 'programmatic'
) => {
  logTelemetry('navigation', {
    from_route: from,
    to_route: to,
    method: method || 'programmatic'
  });
};

/**
 * Логирование API запросов
 */
export const logApiRequest = (
  method: string,
  endpoint: string,
  duration?: number,
  statusCode?: number
) => {
  logTelemetry('api_request', {
    method: method.toUpperCase(),
    endpoint,
    duration_ms: duration || 0,
    status_code: statusCode || 0
  });
};

/**
 * Логирование WebSocket событий
 */
export const logWebSocket = (
  event: 'connect' | 'disconnect' | 'message' | 'error' | 'reconnect',
  details?: TelemetryData
) => {
  logTelemetry('websocket', {
    ws_event: event,
    ...details
  });
};

/**
 * Логирование генерации музыки
 */
export const logGeneration = (
  action: 'start' | 'complete' | 'error' | 'cancel',
  details?: {
    generation_id?: string;
    template_id?: string;
    artist_id?: string;
    template_artist_id?: string;
    duration_ms?: number;
    error_message?: string;
    [key: string]: string | number | boolean | undefined;
  }
) => {
  logTelemetry('generation', {
    generation_action: action,
    ...details
  });
};

/**
 * Логирование платежей
 */
export const logPayment = (
  action: 'initiate' | 'process' | 'success' | 'error' | 'cancel',
  details?: {
    pack_id?: number;
    amount?: number;
    currency?: string;
    is_recurring?: boolean;
    error_message?: string;
    [key: string]: string | number | boolean | undefined;
  }
) => {
  logTelemetry('payment', {
    payment_action: action,
    ...details
  });
};

/**
 * Логирование авторизации
 */
export const logAuth = (
  action: 'login_start' | 'login_success' | 'login_error' | 'logout' | 'token_refresh',
  details?: TelemetryData
) => {
  logTelemetry('auth', {
    auth_action: action,
    ...details
  });
};

/**
 * Логирование плеера
 */
export const logPlayer = (
  action: 'play' | 'pause' | 'stop' | 'seek' | 'volume' | 'track_change' | 'error',
  details?: {
    track_id?: string;
    position_ms?: number;
    volume?: number;
    error_message?: string;
    [key: string]: string | number | boolean | undefined;
  }
) => {
  logTelemetry('player', {
    player_action: action,
    ...details
  });
};

/**
 * Логирование чата
 */
export const logChat = (
  action: 'send_message' | 'receive_message' | 'clear_history' | 'connection_error',
  details?: TelemetryData
) => {
  logTelemetry('chat', {
    chat_action: action,
    ...details
  });
};

/**
 * Логирование подписок
 */
export const logSubscription = (
  action: 'view' | 'subscribe' | 'unsubscribe' | 'upgrade' | 'downgrade' | 'expire',
  details?: {
    plan_id?: string;
    plan_name?: string;
    price?: number;
    [key: string]: string | number | boolean | undefined;
  }
) => {
  logTelemetry('subscription', {
    subscription_action: action,
    ...details
  });
};

/**
 * Добавление кастомного свойства сессии
 */
export const setSessionProperty = (key: string, value: string | number | boolean) => {
  try {
    LogRocket.track('session_property', { [key]: value });
  } catch (e) {
    console.error('[LogRocket] Failed to set session property:', e);
  }
};

/**
 * Добавление breadcrumb для отладки
 */
export const addBreadcrumb = (
  message: string, 
  category?: string, 
  level?: 'debug' | 'info' | 'warning' | 'error'
) => {
  const levelPrefix = level ? `[${level.toUpperCase()}]` : '';
  if (isDebug()) {
    console.log(`${levelPrefix}[Breadcrumb:${category || 'default'}] ${message}`);
  }
  
  try {
    LogRocket.log(`${levelPrefix}[${category || 'app'}] ${message}`);
  } catch (e) {
    // Silently fail
  }
};

/**
 * Глобальный обработчик необработанных ошибок
 */
export const setupGlobalErrorHandlers = () => {
  // Обработка необработанных ошибок
  window.addEventListener('error', (event) => {
    logError('Unhandled Error', event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      type: 'unhandled_error'
    });
  });

  // Обработка необработанных отклонённых промисов
  window.addEventListener('unhandledrejection', (event) => {
    logError('Unhandled Promise Rejection', event.reason, {
      type: 'unhandled_rejection'
    });
  });

  if (isDebug()) {
    console.log('[Logger] Global error handlers initialized');
  }
};
