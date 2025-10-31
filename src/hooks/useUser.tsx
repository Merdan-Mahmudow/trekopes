import { request } from "../libs/request";
import type { Telegram } from "telegram-web-app";

export function useUser() {
    const tg: Telegram = window.Telegram;
  async function getUser() {
    const response = await request('get', `/get-user/${tg.WebApp.initDataUnsafe.user?.id}`);
    return response.data;
  }

  return {
    getUser,
  }
}