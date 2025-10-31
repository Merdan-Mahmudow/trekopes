import { request } from "../libs/request";
import type { Telegram } from "telegram-web-app";
import { useQuery } from "@tanstack/react-query";

const getTelegramUserId = (): string | undefined => {
    const tg: Telegram = window.Telegram;
    const id = tg.WebApp.initDataUnsafe.user?.id;
    return id ? String(id) : undefined;
}

// Query функция
async function getChatQueryFn() {
    const userId = getTelegramUserId();
    if (!userId) throw new Error("User ID not available");
    const response = await request('get', `/get-chat/${userId}`);
    return response.data;
}

export function useChat() {
    const userId = getTelegramUserId();

    const chatQuery = useQuery({
        queryKey: ['chat', userId],
        queryFn: getChatQueryFn,
        enabled: !!userId,
    });

    // Старый API для совместимости
    return {
        // Новый API с useQuery
        chat: chatQuery,
        
        // Старый API для совместимости
        getChat: async () => {
            return getChatQueryFn();
        },
    };
}

// Отдельный хук для удобства
export function useChatData() {
    const userId = getTelegramUserId();
    return useQuery({
        queryKey: ['chat', userId],
        queryFn: getChatQueryFn,
        enabled: !!userId,
    });
}
