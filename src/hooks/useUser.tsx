import { useQuery } from "@tanstack/react-query";
import type { Telegram } from "telegram-web-app";
import { getWebAppMe, loginWebApp } from "../api/webapp";
import type { GetMeResponse, LoginResponse } from "../types/webapp";
import { debugLog } from "../utils/logger";

export const getTelegramUserId = (): string | undefined => {
    const tg: Telegram | undefined = window.Telegram;
    if (!tg?.WebApp) {
        return undefined;
    }
    const id = tg.WebApp.initDataUnsafe.user?.id;
    return id ? String(id) : undefined;
}

const DEV_INIT_DATA = import.meta.env.VITE_INITDATA || undefined;

export function useAuth() {
    async function getToken(): Promise<LoginResponse> {
        const telegram = window.Telegram;
        const rawInitData = telegram?.WebApp?.initData || DEV_INIT_DATA;
        if (!rawInitData) {
            throw new Error("Данные Telegram недоступны");
        }
        try {
            return await loginWebApp({
                initData: rawInitData.toString()
            });
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
            
            if (isServerError || isCorsError) {
                // Пробрасываем ошибку с флагом для показа экрана технических работ
                const maintenanceError: any = new Error("Режим технического обслуживания");
                maintenanceError.isMaintenance = true;
                throw maintenanceError;
            }
            throw error;
        }
    }

    const {
        data: tokenResponse,
        isSuccess: isTokenSuccess,
        error: tokenError,
        isError: isTokenError
    } = useQuery({
        queryKey: ['webapp-token'],
        queryFn: getToken,
    });

    const bearerToken = tokenResponse?.data.token;

    async function getUser(): Promise<GetMeResponse> {
        if (!bearerToken) {
            throw new Error("Токен авторизации недоступен");
        }
        return getWebAppMe(bearerToken);
    }

    const {
        data: user,
        isSuccess: isUserSuccess
    } = useQuery({
        queryKey: ['webapp-user', bearerToken],
        queryFn: getUser,
        enabled: Boolean(bearerToken) && isTokenSuccess,
    });

    return {
        getToken,
        getUser,
        token: bearerToken,
        tokenResponse,
        user,
        isTokenSuccess,
        isUserSuccess,
        tokenError,
        isTokenError
    };
}