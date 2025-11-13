import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createWebAppPayment,
  getWebAppPayments,
  getWebAppPaymentByUUID,
} from "../api/webapp";
import type {
  CreatePaymentRequest,
  GetPaymentsQuery,
} from "../types/webapp";
import { useAuth } from "./useUser";

// Маппинг тарифов на pack_id
export const TARIFF_TO_PACK_ID: Record<"track" | "pro" | "ultra", number> = {
  track: 1, // Тариф TRACK
  pro: 10, // Тариф PRO
  ultra: 100, // Тариф ULTRA
};

// Маппинг подписок на pack_id
// TODO: Уточнить актуальные значения pack_id для подписок с бэкендом
export const SUBSCRIPTION_TO_PACK_ID: Record<"pro" | "ultra", number> = {
  pro: 10, // Подписка PRO (20 PRO-треков) - временно используется тот же pack_id
  ultra: 100, // Подписка ULTRA (1 Premium + 50 PRO) - временно используется тот же pack_id
};

/**
 * Хук для получения списка платежей пользователя
 */
export function useWebAppPayments(params?: GetPaymentsQuery) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["webapp-payments", token, params?.limit, params?.offset],
    queryFn: async () => {
      if (!token) throw new Error("Token is not available");
      return getWebAppPayments(token, params);
    },
    enabled: !!token,
  });
}

/**
 * Хук для получения платежа по UUID
 */
export function useWebAppPaymentByUUID(uuid: string | undefined) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["webapp-payment", token, uuid],
    queryFn: async () => {
      if (!token) throw new Error("Token is not available");
      if (!uuid) throw new Error("UUID is required");
      return getWebAppPaymentByUUID(token, uuid);
    },
    enabled: !!token && !!uuid,
  });
}

/**
 * Хук для создания платежа
 */
export function useCreateWebAppPayment() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePaymentRequest) => {
      if (!token) throw new Error("Token is not available");
      return createWebAppPayment(token, payload);
    },
    onSuccess: () => {
      // Инвалидируем список платежей после создания
      queryClient.invalidateQueries({ queryKey: ["webapp-payments"] });
    },
  });
}

/**
 * Утилита для создания платежа на основе тарифа
 */
export function createPaymentFromTariff(
  tariffId: "track" | "pro" | "ultra",
  isSubscription: boolean,
  email?: string
): CreatePaymentRequest {
  const pack_id = isSubscription
    ? SUBSCRIPTION_TO_PACK_ID[tariffId as "pro" | "ultra"]
    : TARIFF_TO_PACK_ID[tariffId];

  return {
    pack_id,
    is_recurring: isSubscription,
    email,
  };
}

