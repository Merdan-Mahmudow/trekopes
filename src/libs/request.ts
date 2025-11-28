import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { API_BASE_URL } from "../utils/constants";

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10_000
})

export async function request<T = any>(
    method: "get" | "post" | "put" | "patch" | "delete",
    url: string,
    data?: any,
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