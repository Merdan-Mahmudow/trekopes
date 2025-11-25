import { ChatInput } from '../components/Input'
import { ChatList, type MessageProps } from '../components/Message'
import {
  Avatar,
  Box,
  Circle,
  Flex,
  Float,
  Grid,
  IconButton,
  Text,
  Spinner
} from '@chakra-ui/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useCallback, useLayoutEffect, useState } from 'react'
import type React from 'react'
import type { Telegram } from "telegram-web-app"
import { IoChevronBack } from "react-icons/io5"
import { MdDelete } from "react-icons/md"
import { useAuth } from "../hooks/useUser"
import { getWebSocketChatClient } from "../api/websocket-chat"
import {
  clearWebAppChatMessages,
  getWebAppChatMessages,
  streamWebAppChatMessage,
} from "../api/webapp"
import type { ChatMessage, ChatMessageChunkEvent } from "../types/webapp"

export const Route = createFileRoute('/chat')({
  component: RouteComponent,
})

// Тип для сообщений в чате
interface ChatMessageState {
  role: "user" | "assistant"
  content: string | React.ReactElement
  sent: string
  isPending?: boolean
  isHelpBox?: boolean
  streamId?: string
}

function RouteComponent() {
  const tg: Telegram | undefined = window.Telegram
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const wsClientRef = useRef(getWebSocketChatClient())
  const streamBufferRef = useRef("")
  const streamMessageIdRef = useRef<string | null>(null)
  
  // Состояние сообщений
  const [messages, setMessages] = useState<ChatMessageState[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [connectionError, setConnectionError] = useState<Error | null>(null)
  const [isSending, setIsSending] = useState(false)

  // Получаем telegram_chat_id из данных пользователя
  const telegramChatId = user?.data?.telegram_chat_id 
    ? String(user.data.telegram_chat_id) 
    : undefined

  /* ----------------- Загрузка истории чата ----------------- */
  useEffect(() => {
    if (!telegramChatId || !token) {
      setIsLoadingHistory(false)
      return
    }

    let isMounted = true
    setIsLoadingHistory(true)

    getWebAppChatMessages(token)
      .then((response) => {
        if (!isMounted) return

        const history = response.data.map((message: ChatMessage) => ({
          role: message.role,
          content: message.content,
          sent: message.created_at,
          isPending: false,
        }))

        setMessages(history)
        setConnectionError(null)
        setIsLoadingHistory(false)
      })
      .catch((error) => {
        if (!isMounted) return
        const err = error instanceof Error ? error : new Error("Ошибка загрузки истории")
        setConnectionError(err)
        setIsLoadingHistory(false)
      })

    return () => {
      isMounted = false
    }
  }, [telegramChatId, token])

  /* ----------------- WebSocket подключение и стриминг ----------------- */
  const handleConnectionError = useCallback((error: Error) => {
    setConnectionError(error)
    setIsLoadingHistory(false)
    setIsSending(false)
  }, [])

  const handleChunk = useCallback((event: ChatMessageChunkEvent) => {
    if (event.error) {
      handleConnectionError(new Error(event.error))
      return
    }

    setConnectionError(null)

    // Определяем ID стрима для группировки чанков
    // Если сервер не прислал message_id, генерируем локальный для текущего потока
    let streamId = event.message_id
    
    if (!streamId) {
      // Если нет текущего активного стрима, создаем новый ID
      if (!streamMessageIdRef.current) {
        streamMessageIdRef.current = `local-stream-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
        streamBufferRef.current = "" // Новый стрим - новый буфер
      }
      streamId = streamMessageIdRef.current
    } else {
      // Если сервер прислал ID, и он отличается от текущего - это новый стрим
      if (streamMessageIdRef.current !== streamId) {
        streamMessageIdRef.current = streamId
        streamBufferRef.current = "" // Сброс буфера при смене ID
      }
    }

    // Накапливаем буфер
    const chunkPart = event.chunk ?? ""
    if (chunkPart) {
      streamBufferRef.current += chunkPart
    }
    const currentContent = streamBufferRef.current

    setMessages((prev) => {
      let base = prev
      const lastIndex = prev.length - 1

      // Если последнее сообщение от пользователя и оно pending,
      // значит мы только что получили ответ на него -> снимаем pending
      if (
        lastIndex >= 0 &&
        prev[lastIndex].role === "user" &&
        prev[lastIndex].isPending
      ) {
        base = [
          ...prev.slice(0, lastIndex),
          { ...prev[lastIndex], isPending: false },
        ]
      }

      const assistantMessage: ChatMessageState = {
        role: "assistant",
        content: currentContent,
        sent: event.sent || new Date().toISOString(),
        isPending: !event.done,
        streamId,
      }

      // Ищем, есть ли уже сообщение с таким streamId (обновление существующего)
      const existingIndex = base.findIndex((msg) => msg.streamId === streamId)

      if (existingIndex >= 0) {
        const updated = [...base]
        updated[existingIndex] = assistantMessage
        return updated
      }

      // Если нет - добавляем новое
      return [...base, assistantMessage]
    })

    if (event.done) {
      streamMessageIdRef.current = null
      streamBufferRef.current = ""
      setIsSending(false)
    }
  }, [telegramChatId, handleConnectionError])

  useEffect(() => {
    if (!telegramChatId || !token) {
      return
    }

    const client = wsClientRef.current
    let isMounted = true

    const unsubscribeChunk = client.onChunk((event) => {
      if (!isMounted) return
      handleChunk(event)
    })

    const unsubscribeError = client.onError((error) => {
      if (!isMounted) return
      handleConnectionError(error)
    })

    const unsubscribeStatus = client.onStatusChange((status) => {
      if (!isMounted) return
      if (status === "error") {
        handleConnectionError(new Error("Ошибка соединения"))
      }
    })

    client.connect(telegramChatId, token).catch((error) => {
      if (isMounted) {
        handleConnectionError(error)
      }
    })

    return () => {
      isMounted = false
      unsubscribeChunk()
      unsubscribeError()
      unsubscribeStatus()
    }
  }, [telegramChatId, token, handleChunk, handleConnectionError])

  /* ----------------- Формирование списка сообщений для компонента ----------------- */
  const messageProps: MessageProps[] = useMemo(() => {
    return messages
      .filter(msg => msg != null && msg.role != null && msg.content != null)
      .map(msg => ({
        role: msg.role,
        content: msg.content,
        isPending: msg.isPending,
        isHelpBox: msg.isHelpBox,
      }))
  }, [messages])

  /* ----------------- Telegram Back Button ----------------- */
  const handleBackClick = useCallback(() => {
    navigate({ to: '/' })
  }, [navigate])

  useEffect(() => {
    if (!tg?.WebApp) return

    tg.WebApp.BackButton.show()
    tg.WebApp.BackButton.onClick(handleBackClick)

    return () => {
      tg.WebApp.BackButton.hide()
    }
  }, [tg, handleBackClick])

  /* ----------------- Авто-скролл ----------------- */
  const scrollToBottom = useCallback((smooth = true) => {
    const container = chatContainerRef.current
    if (!container) return

    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      })
    })
  }, [])

  // Скролл при изменении сообщений
  const prevLengthRef = useRef(0)
  useLayoutEffect(() => {
    const currentLength = messageProps.length
    if (currentLength > prevLengthRef.current) {
      scrollToBottom(prevLengthRef.current > 0)
    }
    prevLengthRef.current = currentLength
  }, [messageProps.length, scrollToBottom])

  /* ----------------- Очистка истории чата ----------------- */
  const handleClear = useCallback(() => {
    if (!token) {
      setConnectionError(new Error("Токен авторизации недоступен"))
      return
    }

    setIsLoadingHistory(true)
    clearWebAppChatMessages(token)
      .then(() => {
        setMessages([])
        setIsLoadingHistory(false)
      })
      .catch((error) => {
        const err = error instanceof Error ? error : new Error("Ошибка очистки истории")
        setConnectionError(err)
        setIsLoadingHistory(false)
      })
  }, [token])

  /* ----------------- Отправка сообщения ----------------- */
  const handleSend = useCallback((content: string) => {
    const trimmed = content.trim()
    if (!trimmed || isSending || !telegramChatId || !token) return

    const client = wsClientRef.current
    
    // Проверяем, что соединение установлено
    if (!client.isConnected()) {
      setConnectionError(new Error("Соединение не установлено. Попробуйте перезагрузить страницу."))
      return
    }

    // Добавляем сообщение пользователя с pending статусом
    const userMessage: ChatMessageState = {
      role: "user",
      content: trimmed,
      sent: new Date().toISOString(),
      isPending: true,
    }

    // Добавляем сообщение пользователя
    setMessages(prev => [...prev, userMessage])
    
    setIsSending(true)
    setConnectionError(null)
    
    // Сбрасываем ID текущего стрима, чтобы следующий чанк воспринимался как новый
    streamBufferRef.current = ""
    streamMessageIdRef.current = null

    streamWebAppChatMessage(token, { message: trimmed })
      .catch((error) => {
        const err = error instanceof Error 
          ? error 
          : new Error("Ошибка отправки сообщения")
        
        setMessages(prev => prev.filter(msg => msg !== userMessage))
        setConnectionError(err)
        setIsSending(false)
      })
  }, [isSending, telegramChatId, token])

  return (
    <>
      <Grid templateRows="1fr" h="93dvh" overflow="hidden">
        {/* Header */}
        <Flex
          bg="gray.800"
          alignItems="center"
          pl={2}
          pr={2}
          gapX={4}
          justifyContent="space-between"
          pos="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={10}
          h="70px"
        >
          <Flex gapX={2} alignItems="center" flex={1}>
            <IconButton 
              variant="ghost" 
              onClick={handleBackClick}
              aria-label="Назад"
            >
              <IoChevronBack />
            </IconButton>

            <Avatar.Root variant="subtle" size="lg">
              <Avatar.Fallback name="ТРЕКОПЁС" />
              <Avatar.Image 
                src="https://storage.yandexcloud.net/trekopes/trekopes_ava.jpg"
              />
              <Float placement="bottom-end" offsetX="2" offsetY="1.5">
                <Circle bg="green.500" size="8px" />
              </Float>
            </Avatar.Root>

            <Box>
              <Text textTransform="uppercase" lineHeight="15px">трекопёс</Text>
              <Text fontSize="9pt" color="green">online</Text>
            </Box>
          </Flex>

          <IconButton
            variant="ghost"
            onClick={handleClear}
            aria-label="Очистить чат"
            colorScheme="red"
            disabled={messages.length === 0 || isLoadingHistory}
            title="Очистить историю чата"
          >
            <MdDelete size="20px" />
          </IconButton>
        </Flex>

        {/* Messages */}
        <Box
          ref={chatContainerRef}
          overflowY="auto"
          overflowX="hidden"
          px={3}
          py={2}
          bg="gray.900"
          pb="80px"
          pt="80px"
          minH={0}
          css={{
            WebkitOverflowScrolling: 'touch',
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-thumb': { bg: 'gray.600', borderRadius: '2px' },
          }}
        >
          {isLoadingHistory && messageProps.length === 0 ? (
            <Flex justify="center" align="center" h="100%">
              <Spinner size="lg" color="orange.500" />
            </Flex>
          ) : connectionError && messageProps.length === 0 ? (
            <Flex justify="center" align="center" h="100%" direction="column" gap={2}>
              <Text color="red.500">Ошибка подключения к чату</Text>
              <Text fontSize="sm" color="gray.400">
                {connectionError.message || "Попробуйте обновить страницу"}
              </Text>
            </Flex>
          ) : (
            <ChatList messages={messageProps} />
          )}
        </Box>
      </Grid>

      {/* Input */}
      <Box 
        position="fixed" 
        bottom={0} 
        left={0} 
        right={0} 
        zIndex={10}
        bg="gray.900"
      >
        <ChatInput
          onSend={handleSend}
          isDisabled={isSending || !telegramChatId || isLoadingHistory || !token}
        />
      </Box>
    </>
  )
}
