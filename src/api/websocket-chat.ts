import Echo from "laravel-echo";
import Pusher from "pusher-js";
import type { ChatMessageChunkEvent } from "../types/webapp";
import { logWebSocket, logError, debugLog, addBreadcrumb } from "../utils/logger";

type WebSocketStatus = "connecting" | "connected" | "disconnected" | "error";

type ChunkHandler = (event: ChatMessageChunkEvent) => void;
type ErrorHandler = (error: Error) => void;
type StatusChangeHandler = (status: WebSocketStatus) => void;
type EchoInstance = Echo<any>;
type EchoChannel = ReturnType<Echo<any>["channel"]>;

const WS_KEY = import.meta.env.VITE_WS_KEY || "ga70dd0nakp1nrw0npza";
const WS_HOST = import.meta.env.VITE_WS_HOST || "bot.tpekollec.ru";
const WS_PORT = Number(import.meta.env.VITE_WS_PORT || 80);
const WSS_PORT = Number(import.meta.env.VITE_WSS_PORT || 443);
const AUTH_ENDPOINT =
  import.meta.env.VITE_WS_AUTH_ENDPOINT ||
  "https://bot.tpekollec.ru/broadcasting/auth";

declare global {
  interface Window {
    Pusher?: typeof Pusher;
  }
}

if (typeof window !== "undefined") {
  window.Pusher = Pusher;
}

export class WebSocketChatClient {
  private echo: EchoInstance | null = null;
  private channel: EchoChannel | null = null;
  private status: WebSocketStatus = "disconnected";
  private chunkHandlers: Set<ChunkHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private statusChangeHandlers: Set<StatusChangeHandler> = new Set();
  private telegramChatId: string | null = null;
  private authToken: string | null = null;
  private messageCount: number = 0;
  private connectionAttempts: number = 0;
  private reconnectDelay: number = 1000;
  private maxReconnectDelay: number = 30000;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private maxReconnectAttempts: number = 10;
  private reconnectAttempts: number = 0;
  private shouldReconnect: boolean = true;

  connect(telegramChatId: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!telegramChatId) {
        const error = new Error("telegram_chat_id не указан");
        logWebSocket('error', { reason: 'missing_chat_id' });
        reject(error);
        return;
      }

      if (!token) {
        const error = new Error("Auth token не указан");
        logWebSocket('error', { reason: 'missing_token' });
        reject(error);
        return;
      }

      if (
        this.telegramChatId === telegramChatId &&
        this.authToken === token &&
        this.isConnected()
      ) {
        debugLog('[WebSocket] Already connected, reusing connection');
        resolve();
        return;
      }

      this.telegramChatId = telegramChatId;
      this.authToken = token;
      this.connectionAttempts++;
      this.shouldReconnect = true; // Включаем переподключение при новом подключении
      this.setStatus("connecting");

      addBreadcrumb(`WebSocket connecting to chat.${telegramChatId}`, 'websocket', 'info');
      logWebSocket('connect', { 
        chat_id: telegramChatId,
        attempt: this.connectionAttempts 
      });

      try {
        this.initializeEcho(token);
        this.subscribeToChannel(telegramChatId);
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error("Ошибка инициализации Echo");
        this.setStatus("error");
        this.emitError(err);
        logError('WebSocket initialization failed', err, { chat_id: telegramChatId });
        reject(err);
        return;
      }

      const connection = this.getPusherConnection();

      if (!connection) {
        this.setStatus("connected");
        logWebSocket('connect', { 
          chat_id: telegramChatId, 
          status: 'connected_no_pusher' 
        });
        resolve();
        return;
      }

      const handleConnected = () => {
        this.setStatus("connected");
        this.reconnectDelay = 1000; // Сброс задержки при успешном подключении
        this.reconnectAttempts = 0; // Сброс счетчика попыток
        this.cancelReconnect(); // Отменяем запланированное переподключение
        logWebSocket('connect', { 
          chat_id: telegramChatId, 
          status: 'connected',
          attempts: this.connectionAttempts 
        });
        cleanup();
        resolve();
      };

      const handleError = (event?: { error?: { message?: string } }) => {
        const err = new Error(
          event?.error?.message || "Ошибка WebSocket соединения"
        );
        this.setStatus("error");
        cleanup();
        this.emitError(err);
        logWebSocket('error', { 
          chat_id: telegramChatId,
          error_message: err.message 
        });
        logError('WebSocket connection error', err, { chat_id: telegramChatId });
        
        if (this.shouldReconnect && this.telegramChatId && this.authToken) {
          this.scheduleReconnect();
        }
        
        reject(err);
      };

      const cleanup = () => {
        connection.unbind("connected", handleConnected);
        connection.unbind("error", handleError);
        connection.unbind("failed", handleError);
      };

      if (connection.state === "connected") {
        handleConnected();
        return;
      }

      connection.bind("connected", handleConnected);
      connection.bind("error", handleError);
      connection.bind("failed", handleError);
      connection.bind("disconnected", () => {
        this.setStatus("disconnected");
        logWebSocket('disconnect', { chat_id: telegramChatId });
        if (this.shouldReconnect && this.telegramChatId && this.authToken) {
          this.scheduleReconnect();
        }
      });
    });
  }

  disconnect(): void {
    const chatId = this.telegramChatId;
    this.shouldReconnect = false; // Отключаем автоматическое переподключение
    this.cancelReconnect(); // Отменяем запланированное переподключение
    
    if (this.channel) {
      this.channel.stopListening(".ChatMessageChunk");
      this.channel = null;
    }

    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
    }

    this.setStatus("disconnected");
    
    logWebSocket('disconnect', { 
      chat_id: chatId || 'unknown',
      messages_received: this.messageCount 
    });
    
    this.messageCount = 0;
    this.reconnectDelay = 1000; // Сброс задержки
    this.reconnectAttempts = 0; // Сброс счетчика попыток
  }

  onChunk(handler: ChunkHandler): () => void {
    this.chunkHandlers.add(handler);
    return () => {
      this.chunkHandlers.delete(handler);
    };
  }

  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => {
      this.errorHandlers.delete(handler);
    };
  }

  onStatusChange(handler: StatusChangeHandler): () => void {
    this.statusChangeHandlers.add(handler);
    return () => {
      this.statusChangeHandlers.delete(handler);
    };
  }

  getStatus(): WebSocketStatus {
    return this.status;
  }

  isConnected(): boolean {
    const connection = this.getPusherConnection();
    return connection?.state === "connected";
  }

  private initializeEcho(token: string): void {
    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
    }

    debugLog('[WebSocket] Initializing Echo', { host: WS_HOST });

    this.echo = new Echo({
      broadcaster: "reverb",
      key: WS_KEY,
      wsHost: WS_HOST,
      wsPort: WS_PORT,
      wssPort: WSS_PORT,
      forceTLS: true,
      enabledTransports: ["ws", "wss"],
      authEndpoint: AUTH_ENDPOINT,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    });
  }

  private subscribeToChannel(chatId: string): void {
    if (!this.echo) {
      throw new Error("Echo не инициализирован");
    }

    if (this.channel) {
      this.channel.stopListening(".ChatMessageChunk");
    }

    debugLog('[WebSocket] Subscribing to channel', { chatId });
    
    this.channel = this.echo.channel(`chat.${chatId}`);

    this.channel.listen(".ChatMessageChunk", (event: ChatMessageChunkEvent) => {
      this.messageCount++;
      
      logWebSocket('message', { 
        chat_id: chatId,
        message_id: event.message_id,
        is_done: event.done,
        has_error: !!event.error,
        chunk_size: event.chunk?.length || 0
      });

      this.chunkHandlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          logError('Error in chunk handler', error, { chat_id: chatId });
        }
      });
    });

    const channelWithError = this.channel as unknown as {
      error?: (cb: (error: any) => void) => void;
    };

    channelWithError.error?.((error: any) => {
      const err =
        error instanceof Error
          ? error
          : new Error("Ошибка канала WebSocket");
      logWebSocket('error', { 
        chat_id: chatId, 
        error_message: err.message,
        type: 'channel_error' 
      });
      this.emitError(err);
    });
  }

  private getPusherConnection():
    | {
        state: string;
        bind: (name: string, cb: (...args: any[]) => void) => void;
        unbind: (name: string, cb?: (...args: any[]) => void) => void;
      }
    | null {
    const connector = (this.echo as any)?.connector;
    const pusherConnection = connector?.pusher?.connection;
    return pusherConnection ?? null;
  }

  private emitError(error: Error): void {
    this.errorHandlers.forEach((handler) => {
      try {
        handler(error);
      } catch (err) {
        logError('Error in error handler', err);
      }
    });
  }

  private setStatus(status: WebSocketStatus): void {
    if (this.status === status) {
      return;
    }

    const previousStatus = this.status;
    this.status = status;
    
    debugLog('[WebSocket] Status changed', { from: previousStatus, to: status });

    this.statusChangeHandlers.forEach((handler) => {
      try {
        handler(status);
      } catch (error) {
        logError('Error in status handler', error);
      }
    });
  }

  private scheduleReconnect(): void {
    if (!this.shouldReconnect) {
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      debugLog('[WebSocket] Max reconnect attempts reached', { attempts: this.reconnectAttempts });
      logWebSocket('error', { 
        reason: 'max_reconnect_attempts',
        attempts: this.reconnectAttempts 
      });
      this.shouldReconnect = false;
      return;
    }

    this.cancelReconnect(); // Отменяем предыдущий timeout если есть

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay, this.maxReconnectDelay);
    
    debugLog('[WebSocket] Scheduling reconnect', { 
      attempt: this.reconnectAttempts,
      delay,
      maxAttempts: this.maxReconnectAttempts
    });
    
    logWebSocket('reconnect', {
      attempt: this.reconnectAttempts,
      delay_ms: delay
    });

    this.reconnectTimeoutId = setTimeout(() => {
      if (!this.shouldReconnect || !this.telegramChatId || !this.authToken) {
        return;
      }

      debugLog('[WebSocket] Attempting reconnect', { 
        attempt: this.reconnectAttempts,
        chat_id: this.telegramChatId
      });

      this.connect(this.telegramChatId, this.authToken).catch((error) => {
        debugLog('[WebSocket] Reconnect failed', { error, attempt: this.reconnectAttempts });
        // scheduleReconnect будет вызван снова через handleError или disconnected event
      });

      // Увеличиваем задержку экспоненциально для следующей попытки
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
    }, delay);
  }

  private cancelReconnect(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
  }

  enableReconnect(): void {
    this.shouldReconnect = true;
    this.reconnectDelay = 1000;
    this.reconnectAttempts = 0;
  }

  disableReconnect(): void {
    this.shouldReconnect = false;
    this.cancelReconnect();
  }
}

let chatClientInstance: WebSocketChatClient | null = null;

export function getWebSocketChatClient(): WebSocketChatClient {
  if (!chatClientInstance) {
    chatClientInstance = new WebSocketChatClient();
    debugLog('[WebSocket] Created new chat client instance');
  }

  return chatClientInstance;
}
