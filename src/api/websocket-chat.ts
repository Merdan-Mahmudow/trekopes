import Echo from "laravel-echo";
import Pusher from "pusher-js";
import type { ChatMessageChunkEvent } from "../types/webapp";
import { logError } from "../utils/logger";

type WebSocketStatus = "connecting" | "connected" | "disconnected" | "error";

type ChunkHandler = (event: ChatMessageChunkEvent) => void;
type ErrorHandler = (error: Error) => void;
type StatusChangeHandler = (status: WebSocketStatus) => void;
type EchoInstance = Echo<unknown>;
type EchoChannel = ReturnType<Echo<unknown>["channel"]>;

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

  connect(telegramChatId: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!telegramChatId) {
        reject(new Error("telegram_chat_id не указан"));
        return;
      }

      if (!token) {
        reject(new Error("Auth token не указан"));
        return;
      }

      if (
        this.telegramChatId === telegramChatId &&
        this.authToken === token &&
        this.isConnected()
      ) {
        resolve();
        return;
      }

      this.telegramChatId = telegramChatId;
      this.authToken = token;
      this.setStatus("connecting");

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
        reject(err);
        return;
      }

      const connection = this.getPusherConnection();

      if (!connection) {
        this.setStatus("connected");
        resolve();
        return;
      }

      const handleConnected = () => {
        this.setStatus("connected");
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
      });
    });
  }

  disconnect(): void {
    if (this.channel) {
      this.channel.stopListening(".ChatMessageChunk");
      this.channel = null;
    }

    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
    }

    this.setStatus("disconnected");
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

    this.channel = this.echo.channel(`chat.${chatId}`);

    this.channel.listen(".ChatMessageChunk", (event: ChatMessageChunkEvent) => {
      this.chunkHandlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          logError("Ошибка в обработчике чанка", error);
        }
      });
    });

    const channelWithError = this.channel as unknown as {
      error?: (cb: (error: unknown) => void) => void;
    };

    channelWithError.error?.((error: unknown) => {
      const err =
        error instanceof Error
          ? error
          : new Error("Ошибка канала WebSocket");
      this.emitError(err);
    });
  }

  private getPusherConnection():
    | {
        state: string;
        bind: (name: string, cb: (...args: unknown[]) => void) => void;
        unbind: (name: string, cb?: (...args: unknown[]) => void) => void;
      }
    | null {
    const connector = (this.echo as { connector?: unknown })?.connector as { pusher?: { connection?: unknown } } | undefined;
    const pusherConnection = connector?.pusher?.connection;
    return pusherConnection as ReturnType<typeof this.getPusherConnection> | null ?? null;
  }

  private emitError(error: Error): void {
    this.errorHandlers.forEach((handler) => {
      try {
        handler(error);
      } catch (err) {
        logError("Ошибка в обработчике ошибок", err);
      }
    });
  }

  private setStatus(status: WebSocketStatus): void {
    if (this.status === status) {
      return;
    }

    this.status = status;
    this.statusChangeHandlers.forEach((handler) => {
      try {
        handler(status);
      } catch (error) {
        logError("Ошибка в обработчике статуса", error);
      }
    });
  }
}

let chatClientInstance: WebSocketChatClient | null = null;

export function getWebSocketChatClient(): WebSocketChatClient {
  if (!chatClientInstance) {
    chatClientInstance = new WebSocketChatClient();
  }

  return chatClientInstance;
}