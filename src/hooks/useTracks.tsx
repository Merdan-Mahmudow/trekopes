import type { Telegram } from "telegram-web-app";
import { request } from "../libs/request"
import type { SongsPayload } from "../types/songs"

// Query функции (для получения данных)
export const getTelegramUserId = (): string | undefined => {
    const tg: Telegram = window.Telegram;
    const id = tg.WebApp.initDataUnsafe.user?.id;
    return id ? String(id) : undefined;
}

export function useTracks() {
    const loadTracks = async () => {
        const response = await request('get', `/get-songs/231956392`)
        return response.data as SongsPayload
    };

    return {

        
        // Старый API для совместимости
        loadTracks,
    }
}
