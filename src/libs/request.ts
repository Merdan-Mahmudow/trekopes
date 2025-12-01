import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://bot.tpekollec.ru/api",
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10_000
})

export async function request<T = unknown>(
    method: "get" | "post" | "put" | "patch" | "delete",
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
    try {
        const response = await api({
            method,
            url,
            data,
            ...config
        })
        return response
    } catch (error) {
        throw error
    }
}