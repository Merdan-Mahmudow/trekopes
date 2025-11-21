import type {
  WebSocketRequest,
  WebSocketResponse,
  WebSocketChatMessage,
} from "../types/webapp";

type WebSocketStatus = "connecting" | "connected" | "disconnected" | "error";

type MessageHandler = (response: WebSocketResponse) => void;
type ErrorHandler = (error: Error) => void;
type StatusChangeHandler = (status: WebSocketStatus) => void;

const WS_URL = import.meta.env.VITE_WS_URL || "wss://gpt.skyrodev.ru/ws/chat";
const WS_URL_LOCAL = "wss://gpt.skyrodev.ru/ws/chat";

export class WebSocketChatClient {
  private ws: WebSocket | null = null;
  private status: WebSocketStatus = "disconnected";
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private statusChangeHandlers: Set<StatusChangeHandler> = new Set();
  private telegramChatId: string | null = null;
  private isManualClose = false;

  constructor() {
    // Автоматическое переподключение при потере соединения
  }

  /**
   * Подключение к WebSocket серверу
   */
  connect(telegramChatId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        if (this.telegramChatId === telegramChatId) {
          resolve();
          return;
        }
        // Если уже подключен с другим chat_id, переподключаемся
        this.disconnect();
      }

      this.telegramChatId = telegramChatId;
      this.isManualClose = false;
      this.setStatus("connecting");

      // Определяем URL (локальный для разработки, продакшн для остального)
      const url = import.meta.env.DEV ? WS_URL_LOCAL : WS_URL;

      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          this.setStatus("connected");
          this.reconnectAttempts = 0;
          
          // Отправляем команду new_connection для инициализации
          this.send({
            command: "new_connection",
            data: [],
            telegram_chat_id: telegramChatId,
          });
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const response: WebSocketResponse = JSON.parse(event.data);
            this.handleMessage(response);
          } catch (error) {
            const err = error instanceof Error 
              ? error 
              : new Error("Ошибка парсинга сообщения от сервера");
            this.handleError(err);
          }
        };

        this.ws.onerror = () => {
          const error = new Error("WebSocket ошибка соединения");
          this.handleError(error);
          reject(error);
        };

        this.ws.onclose = () => {
          this.setStatus("disconnected");
          
          // Автоматическое переподключение, если не было ручного закрытия
          if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            const error = new Error("Превышено максимальное количество попыток переподключения");
            this.handleError(error);
          }
        };
      } catch (error) {
        const err = error instanceof Error 
          ? error 
          : new Error("Ошибка создания WebSocket соединения");
        this.setStatus("error");
        this.handleError(err);
        reject(err);
      }
    });
  }

  /**
   * Отправка команды на сервер
   */
  send(request: WebSocketRequest): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket соединение не установлено");
    }

    try {
      this.ws.send(JSON.stringify(request));
    } catch (error) {
      const err = error instanceof Error 
        ? error 
        : new Error("Ошибка отправки сообщения");
      this.handleError(err);
      throw err;
    }
  }

  /**
   * Отправка нового сообщения пользователя
   */
  sendMessage(content: string): void {
    if (!this.telegramChatId) {
      throw new Error("telegram_chat_id не установлен");
    }

    const message: WebSocketChatMessage = {
      role: "user",
      content: content,
      sent: new Date().toISOString(),
    };

    this.send({
      command: "new_message",
      data: [message],
      telegram_chat_id: this.telegramChatId,
    });
  }

  /**
   * Синхронизация ответа ассистента
   */
  syncAnswer(message: WebSocketChatMessage): void {
    if (!this.telegramChatId) {
      throw new Error("telegram_chat_id не установлен");
    }

    this.send({
      command: "answer",
      data: [message],
      telegram_chat_id: this.telegramChatId,
    });
  }

  /**
   * Очистка истории
   */
  clearHistory(): void {
    if (!this.telegramChatId) {
      throw new Error("telegram_chat_id не установлен");
    }

    this.send({
      command: "clear",
      data: [],
      telegram_chat_id: this.telegramChatId,
    });
  }

  /**
   * Отключение от сервера
   */
  disconnect(): void {
    this.isManualClose = true;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.setStatus("disconnected");
  }

  /**
   * Подписка на сообщения от сервера
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  /**
   * Подписка на ошибки
   */
  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => {
      this.errorHandlers.delete(handler);
    };
  }

  /**
   * Подписка на изменения статуса
   */
  onStatusChange(handler: StatusChangeHandler): () => void {
    this.statusChangeHandlers.add(handler);
    return () => {
      this.statusChangeHandlers.delete(handler);
    };
  }

  /**
   * Получить текущий статус соединения
   */
  getStatus(): WebSocketStatus {
    return this.status;
  }

  /**
   * Проверка, подключен ли клиент
   */
  isConnected(): boolean {
    return this.status === "connected" && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Обработка сообщения от сервера
   */
  private handleMessage(response: WebSocketResponse): void {
    this.messageHandlers.forEach((handler) => {
      try {
        handler(response);
      } catch (error) {
        console.error("Ошибка в обработчике сообщений:", error);
      }
    });
  }

  /**
   * Обработка ошибок
   */
  private handleError(error: Error): void {
    this.errorHandlers.forEach((handler) => {
      try {
        handler(error);
      } catch (err) {
        console.error("Ошибка в обработчике ошибок:", err);
      }
    });
  }

  /**
   * Установка статуса и уведомление подписчиков
   */
  private setStatus(status: WebSocketStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.statusChangeHandlers.forEach((handler) => {
        try {
          handler(status);
        } catch (error) {
          console.error("Ошибка в обработчике изменения статуса:", error);
        }
      });
    }
  }

  /**
   * Планирование переподключения
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.telegramChatId && !this.isManualClose) {
        this.connect(this.telegramChatId).catch((error) => {
          console.error("Ошибка переподключения:", error);
        });
      }
    }, delay);
  }
}

// Singleton экземпляр клиента
let chatClientInstance: WebSocketChatClient | null = null;

/**
 * Получить экземпляр WebSocket клиента (singleton)
 */
export function getWebSocketChatClient(): WebSocketChatClient {
  if (!chatClientInstance) {
    chatClientInstance = new WebSocketChatClient();
  }
  return chatClientInstance;
}

