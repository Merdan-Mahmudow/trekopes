import { useQuery } from "@tanstack/react-query";
import type { Telegram } from "telegram-web-app";
import { getWebAppMe, loginWebApp } from "../api/webapp";
import type { GetMeResponse, LoginResponse } from "../types/webapp";

export const getTelegramUserId = (): string | undefined => {
    const tg: Telegram = window.Telegram;
    const id = tg.WebApp.initDataUnsafe.user?.id;
    return id ? String(id) : undefined;
}

const DEV_INIT_DATA = "user=%7B%22id%22%3A6035406614%2C%22first_name%22%3A%22M%20E%20R%20D%20A%20N%20%E2%9C%9D%EF%B8%8F%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22softp04%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F04uRrvMW8SVXYvvp7E3x2C3g7KPQQein1L6ueb53ePgKjyqKUfB6iSRM6i3IJ0LT.svg%22%7D&chat_instance=3112996028404820631&chat_type=private&auth_date=1763040108&signature=9g3Q70i8c-uNCV11QI04yIhrmtCrBomSaf7GmA88zEEsjss0N-rjtxps_VEa6ToEkOtMdbCwXr-GV_V3ZjOpDw&hash=7738c6017415df6efc26167d8e9d171809a3ecd04ba69225e44b77468af3b9f2"

export function useAuth() {
    const telegram = window.Telegram;

    async function getToken(): Promise<LoginResponse> {
        const rawInitData = telegram?.WebApp?.initData || DEV_INIT_DATA;
        if (!rawInitData) {
            throw new Error("Telegram initData is not available");
        }
        return loginWebApp({
            initData: rawInitData.toString()
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