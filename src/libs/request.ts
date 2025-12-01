import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { logApiRequest, logApiError, debugLog, addBreadcrumb } from "../utils/logger";

const api = axios.create({
    baseURL: "https://bot.tpekollec.ru/api",
    timeout: 10_000
});

// Конфигурация retry
interface RetryConfig {
    maxAttempts: number;
    retryDelay: number;
    retryableStatusCodes: number[];
    retryableMethods: string[];
    noRetryEndpoints: string[];
}

const defaultRetryConfig: RetryConfig = {
    maxAttempts: 3,
    retryDelay: 1000, // Начальная задержка в мс
    retryableStatusCodes: [408, 429, 500, 502, 503, 504], // Коды статусов для retry
    retryableMethods: ['get', 'head', 'options'], // Методы, которые можно повторять
    noRetryEndpoints: [
        '/process-payment',
        '/payments',
        '/subscription',
        '/auth/login',
    ], // Эндпоинты, для которых не делаем retry
};

/**
 * Проверяет, нужно ли делать retry для запроса
 */
function shouldRetry(
    error: AxiosError,
    config: AxiosRequestConfig,
    attempt: number,
    retryConfig: RetryConfig = defaultRetryConfig
): boolean {
    // Не делаем retry если превышено максимальное количество попыток
    if (attempt >= retryConfig.maxAttempts) {
        return false;
    }

    // Не делаем retry для определенных эндпоинтов
    const url = config.url || '';
    if (retryConfig.noRetryEndpoints.some(endpoint => url.includes(endpoint))) {
        return false;
    }

    // Не делаем retry для POST/PUT/PATCH/DELETE запросов (кроме GET)
    const method = (config.method || 'get').toLowerCase();
    if (!retryConfig.retryableMethods.includes(method)) {
        return false;
    }

    // Делаем retry для сетевых ошибок
    if (!error.response) {
        return true;
    }

    // Делаем retry для определенных кодов статусов
    const status = error.response.status;
    return retryConfig.retryableStatusCodes.includes(status);
}

/**
 * Вычисляет задержку для retry с экспоненциальной задержкой
 */
function getRetryDelay(attempt: number, baseDelay: number = defaultRetryConfig.retryDelay): number {
    return Math.min(baseDelay * Math.pow(2, attempt), 30000); // Максимум 30 секунд
}

/**
 * Выполняет retry запроса с экспоненциальной задержкой
 */
async function retryRequest<T>(
    error: AxiosError,
    config: AxiosRequestConfig,
    attempt: number = 0,
    retryConfig: RetryConfig = defaultRetryConfig
): Promise<AxiosResponse<T>> {
    if (!shouldRetry(error, config, attempt, retryConfig)) {
        throw error;
    }

    const delay = getRetryDelay(attempt, retryConfig.retryDelay);
    
    debugLog(`[API] Retrying request (attempt ${attempt + 1}/${retryConfig.maxAttempts})`, {
        url: config.url,
        method: config.method,
        delay,
        status: error.response?.status,
    });

    // Ждем перед повторной попыткой
    await new Promise(resolve => setTimeout(resolve, delay));

    try {
        // Повторяем запрос
        const response = await api.request<T>(config);
        debugLog(`[API] Retry successful (attempt ${attempt + 1})`, {
            url: config.url,
            method: config.method,
        });
        return response;
    } catch (retryError) {
        // Если это последняя попытка или не нужно делать retry, пробрасываем ошибку
        if (attempt + 1 >= retryConfig.maxAttempts || !shouldRetry(retryError as AxiosError, config, attempt + 1, retryConfig)) {
            throw retryError;
        }
        // Иначе делаем еще одну попытку
        return retryRequest<T>(retryError as AxiosError, config, attempt + 1, retryConfig);
    }
}

// Интерцептор для логирования запросов
api.interceptors.request.use(
    (config) => {
        // Добавляем метку времени для измерения длительности
        (config as any)._startTime = Date.now();
        
        addBreadcrumb(
            `${config.method?.toUpperCase()} ${config.url}`,
            'api',
            'info'
        );
        
        debugLog(`[API] Request: ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            hasData: !!config.data
        });
        
        return config;
    },
    (error) => {
        logApiError(
            error.config?.url || 'unknown',
            error.config?.method || 'unknown',
            undefined,
            error
        );
        return Promise.reject(error);
    }
);

// Интерцептор для логирования ответов
api.interceptors.response.use(
    (response) => {
        const startTime = (response.config as any)._startTime;
        const duration = startTime ? Date.now() - startTime : 0;
        
        logApiRequest(
            response.config.method || 'GET',
            response.config.url || 'unknown',
            duration,
            response.status
        );
        
        debugLog(`[API] Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            duration: `${duration}ms`
        });
        
        return response;
    },
    async (error: AxiosError) => {
        const startTime = (error.config as any)?._startTime;
        const duration = startTime ? Date.now() - startTime : 0;
        
        // Проверяем, нужно ли делать retry
        if (error.config && shouldRetry(error, error.config, 0)) {
            try {
                // Делаем retry
                const retryResponse = await retryRequest(error, error.config);
                
                // Обновляем время выполнения для успешного retry
                const retryDuration = startTime ? Date.now() - startTime : 0;
                logApiRequest(
                    retryResponse.config.method || 'GET',
                    retryResponse.config.url || 'unknown',
                    retryDuration,
                    retryResponse.status
                );
                
                return retryResponse;
            } catch (retryError) {
                // Если retry не удался, логируем ошибку и пробрасываем дальше
                logApiError(
                    error.config?.url || 'unknown',
                    error.config?.method || 'unknown',
                    (retryError as AxiosError).response?.status || error.response?.status,
                    retryError,
                    error.config?.data
                );
                
                debugLog(`[API] Retry failed: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
                    status: (retryError as AxiosError).response?.status,
                    message: (retryError as Error).message,
                });
                
                return Promise.reject(retryError);
            }
        }
        
        // Если retry не нужен, логируем и пробрасываем ошибку
        logApiError(
            error.config?.url || 'unknown',
            error.config?.method || 'unknown',
            error.response?.status,
            error,
            error.config?.data
        );
        
        debugLog(`[API] Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
            status: error.response?.status,
            message: error.message,
            duration: `${duration}ms`
        });
        
        return Promise.reject(error);
    }
);

export async function request<T = any>(
    method: "get" | "post" | "put" | "patch" | "delete",
    url: string,
    data?: any,
    config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
    try {
        const response = await api({
            method,
            url,
            data,
            ...config
        });
        return response;
    } catch (error) {
        throw error;
    }
}
