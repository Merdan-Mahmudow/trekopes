import { request } from "../libs/request";
import type {
  ClearChatMessagesResponse,
  CreateGenerationRequest,
  CreateGenerationResponse,
  CreateLyricsGenerationRequest,
  CreateLyricsGenerationResponse,
  CreatePaymentRequest,
  CreatePaymentResponse,
  GetChatMessagesQuery,
  GetChatMessagesResponse,
  GetGenerationByIdResponse,
  GetGenerationTemplateArtistsQuery,
  GetGenerationTemplateArtistsResponse,
  GetGenerationTemplatesQuery,
  GetGenerationTemplatesResponse,
  GetGenerationsQuery,
  GetGenerationsResponse,
  GetLyricsGenerationResponse,
  GetMeResponse,
  GetPaymentByUUIDResponse,
  GetPaymentsQuery,
  GetPaymentsResponse,
  LoginRequest,
  LoginResponse,
  SendChatMessageRequest,
  SendChatMessageResponse,
  StreamChatMessageResponse,
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

export async function getWebAppGenerationTemplateArtists(
  token: string,
  params?: GetGenerationTemplateArtistsQuery
): Promise<GetGenerationTemplateArtistsResponse> {
  const response = await request<GetGenerationTemplateArtistsResponse>(
    "get",
    `${WEBAPP_PREFIX}/generation-template-artists`,
    undefined,
    {
      params,
      headers: authHeaders(token)
    }
  );
  return response.data;
}

export async function getWebAppGenerationTemplates(
  token: string,
  params?: GetGenerationTemplatesQuery
): Promise<GetGenerationTemplatesResponse> {
  const response = await request<GetGenerationTemplatesResponse>(
    "get",
    `${WEBAPP_PREFIX}/generation-templates`,
    undefined,
    {
      params,
      headers: authHeaders(token)
    }
  );
  return response.data;
}

export async function getWebAppChatMessages(
  token: string,
  params?: GetChatMessagesQuery
): Promise<GetChatMessagesResponse> {
  const response = await request<GetChatMessagesResponse>(
    "get",
    `${WEBAPP_PREFIX}/chat/messages`,
    undefined,
    {
      params,
      headers: authHeaders(token)
    }
  );
  return response.data;
}

export async function sendWebAppChatMessage(
  token: string,
  payload: SendChatMessageRequest
): Promise<SendChatMessageResponse> {
  const response = await request<SendChatMessageResponse>(
    "post",
    `${WEBAPP_PREFIX}/chat/messages`,
    payload,
    {
      headers: authHeaders(token)
    }
  );
  return response.data;
}

export async function streamWebAppChatMessage(
  token: string,
  payload: SendChatMessageRequest
): Promise<StreamChatMessageResponse> {
  const response = await request<StreamChatMessageResponse>(
    "post",
    `${WEBAPP_PREFIX}/chat/messages/stream`,
    payload,
    {
      headers: authHeaders(token),
    }
  );
  return response.data;
}

export async function clearWebAppChatMessages(
  token: string
): Promise<ClearChatMessagesResponse> {
  const response = await request<ClearChatMessagesResponse>(
    "delete",
    `${WEBAPP_PREFIX}/chat/messages`,
    undefined,
    {
      headers: authHeaders(token),
    }
  );
  return response.data;
}

export async function createLyricsGeneration(
  token: string,
  payload: CreateLyricsGenerationRequest
): Promise<CreateLyricsGenerationResponse> {
  const response = await request<CreateLyricsGenerationResponse>(
    "post",
    `${WEBAPP_PREFIX}/generations/lyrics`,
    payload,
    {
      headers: authHeaders(token),
    }
  );
  return response.data;
}

export async function getLyricsGenerationStatus(
  token: string,
  uuid: string
): Promise<GetLyricsGenerationResponse> {
  const response = await request<GetLyricsGenerationResponse>(
    "get",
    `${WEBAPP_PREFIX}/generations/lyrics/${uuid}`,
    undefined,
    {
      headers: authHeaders(token),
    }
  );
  return response.data;
}

