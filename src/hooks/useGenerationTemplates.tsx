import { useQuery } from "@tanstack/react-query";
import { useStore } from "@tanstack/react-store";
import { getWebAppGenerationTemplates } from "../api/webapp";
import type { GetGenerationTemplatesQuery } from "../types/webapp";
import store from "../store";

export function useGenerationTemplates(params?: GetGenerationTemplatesQuery) {
  const token = useStore(store, (state) => state.auth.token);

  return useQuery({
    queryKey: ["generation-templates", token, params?.limit, params?.offset],
    queryFn: async () => {
      if (!token) {
        throw new Error("Токен недоступен");
      }
      return getWebAppGenerationTemplates(token, params);
    },
    enabled: !!token,
  });
}

