import { request } from "../libs/request";
import type {
  CreateGenerationRequest,
  CreateGenerationResponse,
  CreatePaymentRequest,
  CreatePaymentResponse,
  GetGenerationByIdResponse,
  GetGenerationsQuery,
  GetGenerationsResponse,
  GetMeResponse,
  GetPaymentByUUIDResponse,
  GetPaymentsQuery,
  GetPaymentsResponse,
  LoginRequest,
  LoginResponse
} from "../types/webapp";

const WEBAPP_PREFIX = "/webapp";

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`
});

export async function loginWebApp(
  payload: LoginRequest
): Promise<LoginResponse> {
  const response = await request<LoginResponse>(
    "post",
    `${WEBAPP_PREFIX}/auth/login`,
    payload
  );
  return response.data;
}

export async function getWebAppGenerations(
  token: string,
  params?: GetGenerationsQuery
): Promise<GetGenerationsResponse> {
  const response = await request<GetGenerationsResponse>(
    "get",
    `${WEBAPP_PREFIX}/generations`,
    undefined,
    {
      params,
      headers: authHeaders(token)
    }
  );
  return response.data;
}

export async function createWebAppGeneration(
  token: string,
  payload: CreateGenerationRequest
): Promise<CreateGenerationResponse> {
  const response = await request<CreateGenerationResponse>(
    "post",
    `${WEBAPP_PREFIX}/generations`,
    payload,
    {
      headers: authHeaders(token)
    }
  );
  return response.data;
}

export async function getWebAppGenerationByUuid(
  token: string,
  uuid: string
): Promise<GetGenerationByIdResponse> {
  const response = await request<GetGenerationByIdResponse>(
    "get",
    `${WEBAPP_PREFIX}/generations/${uuid}`,
    undefined,
    {
      headers: authHeaders(token)
    }
  );
  return response.data;
}

export async function getWebAppMe(token: string): Promise<GetMeResponse> {
  const response = await request<GetMeResponse>(
    "get",
    `${WEBAPP_PREFIX}/me`,
    undefined,
    {
      headers: authHeaders(token)
    }
  );
  return response.data;
}

export async function getWebAppPayments(
  token: string,
  params?: GetPaymentsQuery
): Promise<GetPaymentsResponse> {
  const response = await request<GetPaymentsResponse>(
    "get",
    `${WEBAPP_PREFIX}/payments`,
    undefined,
    {
      params,
      headers: authHeaders(token)
    }
  );
  return response.data;
}

export async function createWebAppPayment(
  token: string,
  payload: CreatePaymentRequest
): Promise<CreatePaymentResponse> {
  const response = await request<CreatePaymentResponse>(
    "post",
    `${WEBAPP_PREFIX}/payments`,
    payload,
    {
      headers: authHeaders(token)
    }
  );
  return response.data;
}

export async function getWebAppPaymentByUUID(
  token: string,
  uuid: string
): Promise<GetPaymentByUUIDResponse> {
  const response = await request<GetPaymentByUUIDResponse>(
    "get",
    `${WEBAPP_PREFIX}/payments/${uuid}`,
    undefined,
    {
      headers: authHeaders(token)
    }
  );
  return response.data;
}

