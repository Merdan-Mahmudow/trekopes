import { request } from "../libs/request";
import type { Telegram } from "telegram-web-app";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { logPayment, logError, debugLog } from "../utils/logger";

const getTelegramUserId = (): string | undefined => {
    const tg: Telegram | undefined = window.Telegram;
    if (!tg?.WebApp) {
        return undefined;
    }
    const id = tg.WebApp.initDataUnsafe.user?.id;
    return id ? String(id) : undefined;
}

// Query функции
async function getUserPaymentsQueryFn(limit: number = 50, offset: number = 0) {
    const userId = getTelegramUserId();
    if (!userId) throw new Error("ID пользователя недоступен");
    const response = await request('get', `/get-payments/${userId}?limit=${limit}&offset=${offset}`);
    return response.data;
}

async function isNewUserQueryFn() {
    const userId = getTelegramUserId();
    if (!userId) throw new Error("ID пользователя недоступен");
    const response = await request('get', `/is-new-user/${userId}`);
    return response.data;
}

async function getPaymentQueryFn(payment_id: number) {
    const userId = getTelegramUserId();
    if (!userId) throw new Error("ID пользователя недоступен");
    const response = await request('get', `/get-payment/${userId}/${payment_id}`);
    return response.data;
}

// Mutation функции
async function processPaymentMutationFn({ pack_id, is_recurring }: {
    pack_id: number;
    is_recurring: boolean;
}) {
    const userId = getTelegramUserId();
    if (!userId) throw new Error("ID пользователя недоступен");
    
    debugLog('[Payment] Processing payment', { pack_id, is_recurring, userId });
    logPayment('process', {
        pack_id,
        is_recurring
    });
    
    try {
        const response = await request('post', `/process-payment`, {
            telegramChatId: userId,
            pack_id: pack_id,
            is_recurring: is_recurring,
        });
        
        logPayment('success', {
            pack_id,
            is_recurring,
            payment_id: response.data?.id
        });
        
        return response.data;
    } catch (error) {
        logPayment('error', {
            pack_id,
            is_recurring,
            error_message: error instanceof Error ? error.message : 'unknown'
        });
        logError('Payment processing failed', error, { pack_id, is_recurring });
        throw error;
    }
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
        onMutate: (variables) => {
            logPayment('initiate', {
                pack_id: variables.pack_id,
                is_recurring: variables.is_recurring
            });
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['payments', userId] });
            queryClient.invalidateQueries({ queryKey: ['isNewUser', userId] });
            
            debugLog('[Payment] Payment successful', { data, variables });
        },
        onError: (error, variables) => {
            debugLog('[Payment] Payment failed', { error, variables });
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
        onMutate: (variables) => {
            logPayment('initiate', {
                pack_id: variables.pack_id,
                is_recurring: variables.is_recurring
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments', userId] });
            queryClient.invalidateQueries({ queryKey: ['isNewUser', userId] });
        },
    });
}
