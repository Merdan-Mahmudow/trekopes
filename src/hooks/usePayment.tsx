import { request } from "../libs/request";
import type { Telegram } from "telegram-web-app";

export function usePayment() {
    const tg: Telegram = window.Telegram;
  // Отправить запрос на оплату
    async function processPayment(pack_id: number, is_recurring: boolean) {
    const response = await request('post', `/process-payment`, {
      telegramChatId: tg.WebApp.initDataUnsafe.user?.id,
      pack_id: pack_id,
      is_recurring: is_recurring,
    });
    return response.data;
  }

  // Получить все платежи пользователя
  async function getUserPayments() {
    const response = await request('get', `/get-payments/${tg.WebApp.initDataUnsafe.user?.id}?limit=50&offset=0`);
    return response.data;
  }

  // Проверяет, новый ли пользователь (нет платежей) и возвращает true или false
  async function isNewUser() {
    const response = await request('get', `/is-new-user/${tg.WebApp.initDataUnsafe.user?.id}`);
    return response.data;
  }

  return {
    processPayment,
    getUserPayments,
    isNewUser,
  }
}