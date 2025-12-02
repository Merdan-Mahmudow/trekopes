import { useQuery } from "@tanstack/react-query";
import type { Telegram } from "telegram-web-app";
import { getWebAppMe, loginWebApp } from "../api/webapp";
import type { GetMeResponse, LoginResponse } from "../types/webapp";
import { debugLog, logAuth, logError, identifyUser } from "../utils/logger";
import { useEffect, useCallback, useMemo } from "react";

export const getTelegramUserId = (): string | undefined => {
    const tg: Telegram | undefined = window.Telegram;
    if (!tg?.WebApp) {
        return undefined;
    }
    const id = tg.WebApp.initDataUnsafe.user?.id;
    return id ? String(id) : undefined;
}

const DEV_INIT_DATA = import.meta.env.VITE_INITDATA || undefined;

// Функция getToken вынесена за пределы хука, чтобы не пересоздаваться при каждом рендере
async function fetchToken(): Promise<LoginResponse> {
    const telegram = window.Telegram;
    const rawInitData = telegram?.WebApp?.initData || DEV_INIT_DATA;
    debugLog("[Auth] getToken called", { 
        hasTelegram: !!telegram, 
        hasWebApp: !!telegram?.WebApp,
        hasInitData: !!rawInitData,
        hasDevInitData: !!DEV_INIT_DATA 
    });
    
    logAuth('login_start', {
        has_telegram: !!telegram,
        has_init_data: !!rawInitData
    });
    
    if (!rawInitData) {
        const error = new Error("Данные Telegram недоступны");
        debugLog("[Auth] No init data available", error);
        logAuth('login_error', { reason: 'no_init_data' });
        throw error;
    }
    try {
        debugLog("[Auth] Attempting login", { initDataLength: rawInitData.toString().length });
        const response = await loginWebApp({
            initData: rawInitData.toString()
        });
        
        logAuth('login_success', {
            has_token: !!response.data.token
        });
        
        return response;
    } catch (error: any) {
        // Проверяем ошибки 500 или CORS
        const status = error?.response?.status;
        const isServerError = status >= 500 && status < 600;
        
        const isCorsError = 
            error?.code === 'ERR_NETWORK' || 
            error?.code === 'ECONNABORTED' ||
            error?.message?.toLowerCase().includes('cors') ||
            error?.message?.toLowerCase().includes('network error') ||
            error?.message?.toLowerCase().includes('networkerror') ||
            (error?.response === undefined && error?.request !== undefined && error?.code !== 'ECONNABORTED');
        
        debugLog("[Auth] Ошибка логина:", { status, isServerError, isCorsError, error });
        
        logAuth('login_error', {
            status_code: status || 0,
            is_server_error: isServerError,
            is_cors_error: isCorsError,
            error_message: error?.message || 'unknown'
        });
        
        logError('Auth login failed', error, {
            status,
            isServerError,
            isCorsError
        });
        
        if (isServerError || isCorsError) {
            // Пробрасываем ошибку с флагом для показа экрана технических работ
            const maintenanceError: any = new Error("Режим технического обслуживания");
            maintenanceError.isMaintenance = true;
            throw maintenanceError;
        }
        throw error;
    }
}

export function useAuth() {
    const {
        data: tokenResponse,
        isSuccess: isTokenSuccess,
        error: tokenError,
        isError: isTokenError
    } = useQuery({
        queryKey: ['webapp-token'],
        queryFn: fetchToken,
        retry: false,
        staleTime: Infinity, // Токен не устаревает
        gcTime: Infinity, // Не удаляем из кеша
    });

    const bearerToken = tokenResponse?.data.token;

    // Мемоизируем функцию getUser
    const getUser = useCallback(async (): Promise<GetMeResponse> => {
        if (!bearerToken) {
            throw new Error("Токен авторизации недоступен");
        }
        return getWebAppMe(bearerToken);
    }, [bearerToken]);

    const {
        data: user,
        isSuccess: isUserSuccess
    } = useQuery({
        queryKey: ['webapp-user', bearerToken],
        queryFn: getUser,
        enabled: Boolean(bearerToken) && isTokenSuccess,
        staleTime: 5 * 60 * 1000, // 5 минут
    });

    // Идентификация пользователя в LogRocket при успешной загрузке данных
    useEffect(() => {
        if (isUserSuccess && user?.data) {
            const userData = user.data;
            
            // Формируем идентификатор из chat_id + username
            const chatId = userData.telegram_chat_id ? String(userData.telegram_chat_id) : undefined;
            const username = userData.username || undefined;
            const userId = chatId 
                ? (username ? `${chatId}_${username}` : chatId)
                : String(userData.id);
            
            identifyUser(
                userId,
                {
                    telegram_chat_id: chatId,
                    username: username,
                    first_name: userData.first_name || undefined,
                    last_name: userData.last_name || undefined,
                    is_pro: userData.isPro || false,
                    subscription_type: userData.pack_id ? String(userData.pack_id) : undefined,
                }
            );
            
            debugLog("[Auth] User identified in LogRocket", {
                userId,
                chatId,
                username,
                isPro: userData.isPro
            });
        }
    }, [isUserSuccess, user]);

    // Мемоизируем возвращаемый объект
    return useMemo(() => ({
        getToken: fetchToken,
        getUser,
        token: bearerToken,
        tokenResponse,
        user,
        isTokenSuccess,
        isUserSuccess,
        tokenError,
        isTokenError
    }), [getUser, bearerToken, tokenResponse, user, isTokenSuccess, isUserSuccess, tokenError, isTokenError]);
}
