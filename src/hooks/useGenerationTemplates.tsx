import { useQuery } from "@tanstack/react-query";
import { getWebAppGenerationTemplates } from "../api/webapp";
import type { GetGenerationTemplatesQuery } from "../types/webapp";
import { useAuth } from "./useUser";

export function useGenerationTemplates(params?: GetGenerationTemplatesQuery) {
  const { token } = useAuth();

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

