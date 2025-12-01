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
import { logPayment, logError, debugLog } from "../utils/logger";

// Маппинг тарифов на pack_id (разовые покупки)
export const TARIFF_TO_PACK_ID: Record<"track" | "pro" | "ultra", number> = {
  track: 1, // 🎫 Базовый - 250 ₽, 1 трек, Разовая покупка
  pro: 11, // 🚀 PRO - 1 000 ₽, 10 треков, Разовая покупка (без благотворительности)
  ultra: 51, // 💼 ULTRA - 5 000 ₽, 25 треков, Разовая покупка (без благотворительности)
};

// Маппинг подписок на pack_id
export const SUBSCRIPTION_TO_PACK_ID: Record<"pro" | "ultra", number> = {
  pro: 50, // ❤️ PRO - 990 ₽/мес, 20 треков, Подписка (с благотворительностью 30%)
  ultra: 10, // 💎 PREMIUM - 4 990 ₽/мес, 50 треков, Подписка (с благотворительностью 30%)
};

/**
 * Хук для получения списка платежей пользователя
 */
export function useWebAppPayments(params?: GetPaymentsQuery) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["webapp-payments", token, params?.limit, params?.offset],
    queryFn: async () => {
      if (!token) throw new Error("Токен недоступен");
      debugLog('[WebAppPayments] Fetching payments', { params });
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
      if (!token) throw new Error("Токен недоступен");
      if (!uuid) throw new Error("Требуется UUID");
      debugLog('[WebAppPayments] Fetching payment by UUID', { uuid });
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
      if (!token) throw new Error("Токен недоступен");
      
      debugLog('[WebAppPayments] Creating payment', { payload });
      logPayment('initiate', {
        pack_id: payload.pack_id,
        is_recurring: payload.is_recurring
      });
      
      try {
        const result = await createWebAppPayment(token, payload);
        
        logPayment('success', {
          pack_id: payload.pack_id,
          is_recurring: payload.is_recurring,
          payment_id: result.data?.uuid
        });
        
        return result;
      } catch (error) {
        logPayment('error', {
          pack_id: payload.pack_id,
          is_recurring: payload.is_recurring,
          error_message: error instanceof Error ? error.message : 'unknown'
        });
        logError('WebApp payment creation failed', error, { payload });
        throw error;
      }
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

  debugLog('[WebAppPayments] Creating payment from tariff', { tariffId, isSubscription, pack_id });

  return {
    pack_id,
    is_recurring: isSubscription,
    email,
  };
}
