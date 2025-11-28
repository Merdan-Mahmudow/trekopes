import type { Telegram } from "telegram-web-app";
import { request } from "../libs/request"
import type{  SongsPayload } from "../types/songs"

export function useTracks() {
    const tg: Telegram | undefined = window.Telegram;
    async function loadTracks() {
        const userId = tg?.WebApp?.initDataUnsafe?.user?.id;
        if (!userId || typeof userId !== 'number') {
            throw new Error('Invalid user ID');
        }
        const response = await request('get', `/get-songs/${userId}`)
        return response.data as SongsPayload
    }

    return {
        loadTracks,
    }
}