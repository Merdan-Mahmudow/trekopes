import { useStore } from "@tanstack/react-store";
import { getWebAppGenerations } from "../api/webapp";
import store, { setMusicGenerations } from "../store";
import type { GetGenerationsQuery, GetGenerationsResponse } from "../types/webapp";
import { logGeneration, logError, debugLog } from "../utils/logger";

export function useTracks(query?: GetGenerationsQuery) {
    const token = useStore(store, (state) => state.auth.token);

    const loadTracks = async (): Promise<GetGenerationsResponse> => {
        if (!token) {
            throw new Error("Токен авторизации недоступен");
        }
        
        debugLog('[Tracks] Loading tracks', { query });
        
        try {
            const response = await getWebAppGenerations(token, query);
            setMusicGenerations(response.data, response.meta);
            
            debugLog('[Tracks] Tracks loaded successfully', { 
                count: response.data.length,
                meta: response.meta 
            });
            
            logGeneration('complete', {
                duration_ms: 0, // Будет измеряться через request interceptor
            });
            
            return response;
        } catch (error) {
            logError('Failed to load tracks', error, { query });
            logGeneration('error', {
                error_message: error instanceof Error ? error.message : 'unknown'
            });
            throw error;
        }
    };

    return {
        loadTracks,
        token,
    };
}
