import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { logApiRequest, logApiError, debugLog, addBreadcrumb } from "../utils/logger";

const api = axios.create({
    baseURL: "https://bot.tpekollec.ru/api",
    timeout: 10_000
});

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
