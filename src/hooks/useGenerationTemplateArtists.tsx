import { useQuery } from "@tanstack/react-query";
import { useStore } from "@tanstack/react-store";
import { getWebAppGenerationTemplateArtists } from "../api/webapp";
import store from "../store";
import type {
  GetGenerationTemplateArtistsQuery,
  GetGenerationTemplateArtistsResponse,
//   GenerationTemplateArtist,
} from "../types/webapp";

export function useGenerationTemplateArtists(query?: GetGenerationTemplateArtistsQuery) {
    const token = useStore(store, (state) => state.auth.token);

    const { data, isLoading, error } = useQuery<GetGenerationTemplateArtistsResponse>({
        queryKey: ["generation-template-artists", token, query],
        queryFn: async () => {
            if (!token) {
                throw new Error("Токен авторизации недоступен");
            }
            return await getWebAppGenerationTemplateArtists(token, query);
        },
        enabled: Boolean(token),
        staleTime: 5 * 60 * 1000, // 5 минут
    });

    return {
        artists: data?.data ?? [],
        isLoading,
        error,
        token,
    };
}
