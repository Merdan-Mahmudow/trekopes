import type { Telegram } from "telegram-web-app";
import { request } from "../libs/request"
import type { SongsPayload } from "../types/songs"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// Query функции (для получения данных)
const getTelegramUserId = (): string | undefined => {
    const tg: Telegram = window.Telegram;
    const id = tg.WebApp.initDataUnsafe.user?.id;
    return id ? String(id) : undefined;
}

// Получить все песни пользователя
async function getAllSongsQueryFn() {
    const userId = getTelegramUserId();
    if (!userId) throw new Error("User ID not available");
    const response = await request('get', `/get-songs/${userId}`)
    const payload = response?.data as any
    if (payload && Array.isArray(payload.data)) {
        return payload.data
    }
    return []
}

// Получить песню по id (нормализуем под массив/объект)
async function getSongQueryFn(song_id: string) {
    const userId = getTelegramUserId();
    if (!userId) throw new Error("User ID not available");
    const response = await request('get', `/get-song/${userId}/${song_id}`)
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

// Получить все треки
async function getTracksQueryFn() {
    const response = await request('get', `/tracks/`)
    return response.data
}

// Получить трек по ID
async function getTrackQueryFn(track_id: number) {
    const response = await request('get', `/tracks/${track_id}`)
    return response.data
}

// Mutation функции (для изменения данных)
async function generateSongMutationFn(prompt: string) {
    const userId = getTelegramUserId();
    if (!userId) throw new Error("User ID not available");
    const response = await request('post', `/generate-song`, {
        telegramChatId: userId,
        prompt: prompt,
    })
    return response.data
}

async function createTrackWithFilesMutationFn(data: {
    title: string;
    artist: string;
    file: File;
    image: File;
}) {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('artist', data.artist)
    formData.append('file', data.file)
    formData.append('image', data.image)
    
    const response = await request('post', `/tracks/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
    return response.data
}

async function updateTrackMutationFn({ track_id, data }: {
    track_id: number;
    data: {
        title?: string;
        artist?: string;
        file_url?: string | null;
        image_url?: string | null;
    };
}) {
    const response = await request('put', `/tracks/${track_id}`, data)
    return response.data
}

async function deleteTrackMutationFn(track_id: number) {
    const response = await request('delete', `/tracks/${track_id}`)
    return response.data
}

// Основной хук с useQuery и useMutation
export function useTracks() {
    const queryClient = useQueryClient();
    const userId = getTelegramUserId();

    // Query hooks
    const allSongsQuery = useQuery({
        queryKey: ['songs', userId],
        queryFn: getAllSongsQueryFn,
        enabled: !!userId,
    });

    const tracksQuery = useQuery({
        queryKey: ['tracks'],
        queryFn: getTracksQueryFn,
    });

    // Mutation hooks
    const generateSongMut = useMutation({
        mutationFn: generateSongMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['songs', userId] });
        },
    });

    const createTrackMut = useMutation({
        mutationFn: createTrackWithFilesMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tracks'] });
        },
    });

    const updateTrackMut = useMutation({
        mutationFn: updateTrackMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tracks'] });
        },
    });

    const deleteTrackMut = useMutation({
        mutationFn: deleteTrackMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tracks'] });
        },
    });

    // Старый API для совместимости
    const loadTracks = async () => {
        if (!userId) return {} as SongsPayload;
        const response = await request('get', `/get-songs/${userId}`)
        return response.data as SongsPayload
    };

    return {
        // Новый API с useQuery/useMutation
        allSongs: allSongsQuery,
        tracks: tracksQuery,
        generateSongMutation: generateSongMut,
        createTrackMutation: createTrackMut,
        updateTrackMutation: updateTrackMut,
        deleteTrackMutation: deleteTrackMut,
        
        // Старый API для совместимости
        loadTracks,
        generateSong: async (prompt: string) => {
            return generateSongMut.mutateAsync(prompt);
        },
        getAllSongs: () => allSongsQuery.data || [],
        
        // Треки (старый API)
        getTracks: () => tracksQuery.data || [],
        createTrackWithFiles: createTrackMut.mutateAsync,
        updateTrack: (track_id: number, data: Parameters<typeof updateTrackMutationFn>[0]['data']) => {
            return updateTrackMut.mutateAsync({ track_id, data });
        },
        deleteTrack: deleteTrackMut.mutateAsync,
    }
}

// Отдельные хуки для удобства
export function useAllSongs() {
    const userId = getTelegramUserId();
    return useQuery({
        queryKey: ['songs', userId],
        queryFn: getAllSongsQueryFn,
        enabled: !!userId,
    });
}

export function useSong(song_id: string | undefined) {
    const userId = getTelegramUserId();
    return useQuery({
        queryKey: ['song', userId, song_id],
        queryFn: () => song_id ? getSongQueryFn(song_id) : null,
        enabled: !!userId && !!song_id,
    });
}

export function useAllTracks() {
    return useQuery({
        queryKey: ['tracks'],
        queryFn: getTracksQueryFn,
    });
}

export function useTrack(track_id: number | undefined) {
    return useQuery({
        queryKey: ['track', track_id],
        queryFn: () => track_id ? getTrackQueryFn(track_id) : null,
        enabled: !!track_id,
    });
}

export function useGenerateSong() {
    const queryClient = useQueryClient();
    const userId = getTelegramUserId();
    
    return useMutation({
        mutationFn: generateSongMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['songs', userId] });
        },
    });
}

export function useCreateTrack() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: createTrackWithFilesMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tracks'] });
        },
    });
}

export function useUpdateTrack() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: updateTrackMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tracks'] });
        },
    });
}

export function useDeleteTrack() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: deleteTrackMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tracks'] });
        },
    });
}
