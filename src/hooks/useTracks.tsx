import type { Telegram } from "telegram-web-app";
import { request } from "../libs/request"
import type { SongsPayload } from "../types/songs"

export function useTracks() {
    const tg: Telegram = window.Telegram;
    async function loadTracks() {
        const response = await request('get', `/get-songs/${tg.WebApp.initDataUnsafe.user?.id}`)
        return response.data as SongsPayload
    }

    // Создать песню по промпту
    async function generateSong (prompt: string) {
        const response = await request('post', `/generate-song`, {
            telegramChatId: tg.WebApp.initDataUnsafe.user?.id,
            prompt: prompt,
        })
        return response.data
    }

    // Получить песню по id (нормализуем под массив/объект)
    async function getSong(song_id: string) {
        const response = await request('get', `/get-song/${tg.WebApp.initDataUnsafe.user?.id}/${song_id}`)
        const payload = response?.data as any
        if (payload && payload.data) {
            if (Array.isArray(payload.data) && payload.data.length > 0) {
                return payload.data[0]
            }
            if (typeof payload.data === 'object' && payload.data !== null) {
                return payload.data
            }
        }
        return null
    }

    // Получить все песни пользователя
    async function getAllSongs() {
        const response = await request('get', `/get-songs/${tg.WebApp.initDataUnsafe.user?.id}`)
        const payload = response?.data as any
        if (payload && Array.isArray(payload.data)) {
            return payload.data
        }
        return []
    }

    return {
        loadTracks,
        generateSong,
        getSong,
        getAllSongs,
    }
}