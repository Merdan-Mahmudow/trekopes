import { request } from "../libs/request";
import type { Telegram } from "telegram-web-app";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const getTelegramUserId = (): string | undefined => {
    const tg: Telegram = window.Telegram;
    const id = tg.WebApp.initDataUnsafe.user?.id;
    return id ? String(id) : undefined;
}

// Query функции
async function getUserPaymentsQueryFn(limit: number = 50, offset: number = 0) {
    const userId = getTelegramUserId();
    if (!userId) throw new Error("User ID not available");
    const response = await request('get', `/get-payments/${userId}?limit=${limit}&offset=${offset}`);
    return response.data;
}

async function isNewUserQueryFn() {
    const userId = getTelegramUserId();
    if (!userId) throw new Error("User ID not available");
    const response = await request('get', `/is-new-user/${userId}`);
    return response.data;
}

async function getPaymentQueryFn(payment_id: number) {
    const userId = getTelegramUserId();
    if (!userId) throw new Error("User ID not available");
    const response = await request('get', `/get-payment/${userId}/${payment_id}`);
    return response.data;
}

// Mutation функции
async function processPaymentMutationFn({ pack_id, is_recurring }: {
    pack_id: number;
    is_recurring: boolean;
}) {
    const userId = getTelegramUserId();
    if (!userId) throw new Error("User ID not available");
    const response = await request('post', `/process-payment`, {
        telegramChatId: userId,
        pack_id: pack_id,
        is_recurring: is_recurring,
    });
    return response.data;
}

export function usePayment() {
    const queryClient = useQueryClient();
    const userId = getTelegramUserId();

    // Query hooks
    const userPaymentsQuery = useQuery({
        queryKey: ['payments', userId],
        queryFn: () => getUserPaymentsQueryFn(50, 0),
        enabled: !!userId,
    });

    const isNewUserQuery = useQuery({
        queryKey: ['isNewUser', userId],
        queryFn: isNewUserQueryFn,
        enabled: !!userId,
    });

    // Mutation hooks
    const processPaymentMut = useMutation({
        mutationFn: processPaymentMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments', userId] });
            queryClient.invalidateQueries({ queryKey: ['isNewUser', userId] });
        },
    });

    // Старый API для совместимости
    return {
        // Новый API с useQuery/useMutation
        userPayments: userPaymentsQuery,
        isNewUserQuery: isNewUserQuery,
        processPaymentMutation: processPaymentMut,

        // Старый API для совместимости
        processPayment: async (pack_id: number, is_recurring: boolean) => {
            return processPaymentMut.mutateAsync({ pack_id, is_recurring });
        },
        getUserPayments: async () => {
            return getUserPaymentsQueryFn(50, 0);
        },
        isNewUser: async () => {
            return isNewUserQueryFn();
        },
        getPayment: async (payment_id: number) => {
            return getPaymentQueryFn(payment_id);
        },
    };
}

// Отдельные хуки для удобства
export function useUserPayments(limit: number = 50, offset: number = 0) {
    const userId = getTelegramUserId();
    return useQuery({
        queryKey: ['payments', userId, limit, offset],
        queryFn: () => getUserPaymentsQueryFn(limit, offset),
        enabled: !!userId,
    });
}

export function useIsNewUser() {
    const userId = getTelegramUserId();
    return useQuery({
        queryKey: ['isNewUser', userId],
        queryFn: isNewUserQueryFn,
        enabled: !!userId,
    });
}

export function usePaymentItem(payment_id: number | undefined) {
    const userId = getTelegramUserId();
    return useQuery({
        queryKey: ['payment', userId, payment_id],
        queryFn: () => payment_id ? getPaymentQueryFn(payment_id) : null,
        enabled: !!userId && !!payment_id,
    });
}

export function useProcessPayment() {
    const queryClient = useQueryClient();
    const userId = getTelegramUserId();
    
    return useMutation({
        mutationFn: processPaymentMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments', userId] });
            queryClient.invalidateQueries({ queryKey: ['isNewUser', userId] });
        },
    });
}
