import { ChatInput } from '../components/Input'
import { ChatList, type MessageProps } from '../components/Message'
import {
  Box,
  Flex,
  IconButton,
  Text,
  Spinner,
  Container,
  Avatar,
  Float,
  Circle
} from '@chakra-ui/react'
import { useColorModeValue } from "../components/ui/color-mode"
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useCallback, useLayoutEffect, useState } from 'react'
import type React from 'react'
import type { Telegram } from "telegram-web-app"
import { IoChevronBack, IoArrowDown } from "react-icons/io5"
import { FaRegTrashAlt } from "react-icons/fa"
import { useAuth } from "../hooks/useUser"
import { getWebSocketChatClient } from "../api/websocket-chat"
import {
  clearWebAppChatMessages,
  getWebAppChatMessages,
  streamWebAppChatMessage,
} from "../api/webapp"
import type { ChatMessage, ChatMessageChunkEvent } from "../types/webapp"
import { COLOR } from '../components/ui/colors'

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
  const [showScrollButton, setShowScrollButton] = useState(false)

  // UI Colors
  const bg = useColorModeValue("#FCFCFC", "#131313")
  const headerBg = useColorModeValue("rgba(255,255,255,0.8)", "rgba(19,19,19,0.8)")
  const borderColor = useColorModeValue("rgba(0,0,0,0.05)", "rgba(255,255,255,0.05)")
  const scrollbarThumbBg = useColorModeValue('rgba(0,0,0,0.2)', 'rgba(255,255,255,0.2)')
  const scrollButtonBg = useColorModeValue("white", "gray.700")

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
    let streamId = event.message_id

    if (!streamId) {
      if (!streamMessageIdRef.current) {
        streamMessageIdRef.current = `local-stream-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
        streamBufferRef.current = ""
      }
      streamId = streamMessageIdRef.current
    } else {
      if (streamMessageIdRef.current !== streamId) {
        streamMessageIdRef.current = streamId
        streamBufferRef.current = ""
      }
    }

    const chunkPart = event.chunk ?? ""
    if (chunkPart) {
      streamBufferRef.current += chunkPart
    }
    const currentContent = streamBufferRef.current

    setMessages((prev) => {
      let base = prev
      const lastIndex = prev.length - 1

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

      const existingIndex = base.findIndex((msg) => msg.streamId === streamId)

      if (existingIndex >= 0) {
        const updated = [...base]
        updated[existingIndex] = assistantMessage
        return updated
      }

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

    // Используем window.scrollTo если это основной скроллбар страницы, но у нас контейнер
    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      })
    })
  }, [])

  // Отслеживание скролла для кнопки "Вниз"
  const handleScroll = useCallback(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isBottom);
  }, []);

  // Скролл при добавлении новых сообщений (если мы уже внизу)
  const prevLengthRef = useRef(0)
  useLayoutEffect(() => {
    const currentLength = messageProps.length

    if (currentLength > prevLengthRef.current) {
      // Если это ответ бота или пользователь только что отправил - скроллим
      // Простая эвристика: всегда скроллим при новом сообщении
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

    if (!client.isConnected()) {
      setConnectionError(new Error("Соединение не установлено. Попробуйте перезагрузить страницу."))
      return
    }

    const userMessage: ChatMessageState = {
      role: "user",
      content: trimmed,
      sent: new Date().toISOString(),
      isPending: true,
    }

    setMessages(prev => [...prev, userMessage])
    setIsSending(true)
    setConnectionError(null)

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
    <Box h="100dvh" bg={bg} display="flex" flexDirection="column" overflow="hidden">
      {/* Header */}
      <Flex
        bg={headerBg}
        backdropFilter="blur(10px)"
        alignItems="center"
        px={4}
        justifyContent="space-between"
        pos="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={20}
        h="60px"
        borderBottom="1px solid"
        borderColor={borderColor}
      >
        <Flex gap={3} alignItems="center">
          <IconButton
            variant="ghost"
            onClick={handleBackClick}
            aria-label="Назад"
            size="sm"
            rounded="full"
          >
            <IoChevronBack size="20px" />
          </IconButton>
          <Avatar.Root size="sm">
            <Avatar.Fallback name="Трекопёс" />
            <Avatar.Image src="https://storage.yandexcloud.net/trekopes/trekopes_ava.jpg" />
            <Float placement="bottom-end" offsetX={1.5} offsetY={1.5}>
              <Circle size="7px" bg={"green.500"} />
            </Float>
          </Avatar.Root>
          <Box>
            <Text fontWeight="600" fontSize="md" lineHeight="1.2">
              Трекопёс
            </Text>
            <Text fontSize="xs" color="green.500" lineHeight="1.2">
              online
            </Text>
          </Box>
        </Flex>

        <IconButton
          variant="ghost"
          onClick={handleClear}
          aria-label="Очистить чат"
          colorScheme="red"
          size="sm"
          rounded="full"
          disabled={messages.length === 0 || isLoadingHistory}
          title="Очистить историю чата"
          color="gray.500"
        >
          <FaRegTrashAlt size="20px" />
        </IconButton>
      </Flex>

      {/* Messages Area */}
      <Box
        ref={chatContainerRef}
        flex={1}
        overflowY="auto"
        overflowX="hidden"
        pt="80px" // Header height + padding
        pb="140px" // Input height + padding
        px={4}
        onScroll={handleScroll}
        css={{
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: scrollbarThumbBg,
            borderRadius: '3px'
          },
          '&::-webkit-scrollbar-track': { background: 'transparent' }
        }}
      >
        <Container maxW="800px" p={0}>
          {isLoadingHistory && messageProps.length === 0 ? (
            <Flex justify="center" align="center" py={20}>
              <Spinner size="xl" color={COLOR.kit.orange} borderWidth="3px" />
            </Flex>
          ) : connectionError && messageProps.length === 0 ? (
            <Flex justify="center" align="center" direction="column" gap={3} py={20}>
              <Text color="red.500" fontWeight="bold">Ошибка подключения</Text>
              <Text fontSize="sm" color="gray.500">
                {connectionError.message || "Попробуйте обновить страницу"}
              </Text>
            </Flex>
          ) : (
            <ChatList messages={messageProps} />
          )}
        </Container>
      </Box>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <IconButton
          aria-label="Scroll to bottom"
          position="fixed"
          bottom="100px"
          right="50%"
          transform="translateX(50%)"
          zIndex={15}
          rounded="full"
          size="sm"
          shadow="md"
          bg={scrollButtonBg}
          onClick={() => scrollToBottom(true)}
        >
          <IoArrowDown color='white' />
        </IconButton>
      )}

      {/* Input Area */}
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        zIndex={20}
        bg={bg} // Match page bg to cover content
        pt={2}
      >
        {/* Gradient fade at top of input area */}
        <Box
          position="absolute"
          top="-20px"
          left={0}
          right={0}
          h="20px"
          bg={`linear-gradient(to top, ${bg}, transparent)`}
          pointerEvents="none"
        />
        <ChatInput
          onSend={handleSend}
          isDisabled={isSending || !telegramChatId || isLoadingHistory || !token}
        />
      </Box>
    </Box>
  )
}
