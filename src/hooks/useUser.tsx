import { useQuery } from "@tanstack/react-query";
import type { Telegram } from "telegram-web-app";
import { getWebAppMe, loginWebApp } from "../api/webapp";
import type { GetMeResponse, LoginResponse } from "../types/webapp";

export const getTelegramUserId = (): string | undefined => {
    const tg: Telegram = window.Telegram;
    const id = tg.WebApp.initDataUnsafe.user?.id;
    return id ? String(id) : undefined;
}

export function useAuth() {

    const telegram = window.Telegram;
    const initData = telegram.WebApp.initData;

    async function getToken(): Promise<LoginResponse> {
        return loginWebApp({
            initData: initData.toString()
        });
    }

    const {
        data: tokenResponse,
        isSuccess: isTokenSuccess
    } = useQuery({
        queryKey: ['webapp-token'],
        queryFn: getToken,
    });

    const bearerToken = tokenResponse?.data.token;

    async function getUser(): Promise<GetMeResponse> {
        if (!bearerToken) {
            throw new Error("Bearer token is not available");
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
        isUserSuccess
    };
}