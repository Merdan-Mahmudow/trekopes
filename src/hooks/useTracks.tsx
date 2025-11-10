import { useStore } from "@tanstack/react-store";
import { getWebAppGenerations } from "../api/webapp";
import store, { setMusicGenerations } from "../store";
import type { GetGenerationsQuery, GetGenerationsResponse } from "../types/webapp";

export function useTracks(query?: GetGenerationsQuery) {
    const token = useStore(store, (state) => state.auth.token);

    const loadTracks = async (): Promise<GetGenerationsResponse> => {
        if (!token) {
            throw new Error("Auth token is not available");
        }
        const response = await getWebAppGenerations(token, query);
        setMusicGenerations(response.data, response.meta);
        return response;
    };

    return {
        loadTracks,
        token,
    };
}
