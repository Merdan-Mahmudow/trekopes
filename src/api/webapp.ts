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
import { logGeneration, logChat, logPayment, debugLog, addBreadcrumb } from "../utils/logger";

const WEBAPP_PREFIX = "/webapp";

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`
});

export async function loginWebApp(
  payload: LoginRequest
): Promise<LoginResponse> {
  addBreadcrumb('Login attempt', 'auth', 'info');
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
  debugLog('[API] Getting generations', { params });
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
  debugLog('[API] Creating generation', { payload });
  addBreadcrumb('Creating music generation', 'generation', 'info');
  
  logGeneration('start', {
    template_id: payload.template_id ? String(payload.template_id) : undefined,
    template_artist_id: payload.template_artist_id ? String(payload.template_artist_id) : undefined,
  });
  
  const response = await request<CreateGenerationResponse>(
    "post",
    `${WEBAPP_PREFIX}/generations`,
    payload,
    {
      headers: authHeaders(token)
    }
  );
  
  logGeneration('complete', {
    generation_id: response.data.data?.generation_id,
  });
  
  return response.data;
}

export async function getWebAppGenerationByUuid(
  token: string,
  uuid: string
): Promise<GetGenerationByIdResponse> {
  debugLog('[API] Getting generation by UUID', { uuid });
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
  debugLog('[API] Getting user profile');
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
  debugLog('[API] Getting payments', { params });
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
  debugLog('[API] Creating payment', { payload });
  addBreadcrumb('Creating payment', 'payment', 'info');
  
  logPayment('process', {
    pack_id: payload.pack_id,
    is_recurring: payload.is_recurring
  });
  
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
  debugLog('[API] Getting payment by UUID', { uuid });
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
  debugLog('[API] Getting generation template artists', { params });
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
  debugLog('[API] Getting generation templates', { params });
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
  debugLog('[API] Getting chat messages', { params });
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
  debugLog('[API] Sending chat message');
  addBreadcrumb('Sending chat message', 'chat', 'info');
  
  logChat('send_message', {
    message_length: payload.message?.length || 0
  });
  
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
  debugLog('[API] Streaming chat message');
  addBreadcrumb('Streaming chat message', 'chat', 'info');
  
  logChat('send_message', {
    message_length: payload.message?.length || 0,
    is_stream: true
  });
  
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
  debugLog('[API] Clearing chat messages');
  addBreadcrumb('Clearing chat history', 'chat', 'info');
  
  logChat('clear_history', {});
  
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
  debugLog('[API] Creating lyrics generation', { payload });
  addBreadcrumb('Creating lyrics generation', 'generation', 'info');
  
  logGeneration('start', {
    template_id: payload.type ? String(payload.type) : undefined,
  });
  
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
  debugLog('[API] Getting lyrics generation status', { uuid });
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
