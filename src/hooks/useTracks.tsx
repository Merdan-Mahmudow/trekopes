import type { Telegram } from "telegram-web-app";
import { request } from "../libs/request"
import type{  SongsPayload } from "../types/songs"

export function useTracks() {
    const tg: Telegram = window.Telegram;
    async function loadTracks() {
        const response = await request('get', `/get-songs/${tg.WebApp.initDataUnsafe.user?.id}`)
        return response.data as SongsPayload
    }

    return {
        loadTracks,
    }
}