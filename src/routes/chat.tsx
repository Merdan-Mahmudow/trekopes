import { ChatInput } from '../components/Input'
import { ChatList, type MessageProps, MessageHelpBox } from '../components/Message'
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
import type { WebSocketResponse } from "../types/webapp"

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
}

function RouteComponent() {
  const tg: Telegram | undefined = window.Telegram
  const navigate = useNavigate()
  const { user } = useAuth()
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const wsClientRef = useRef(getWebSocketChatClient())
  
  // Состояние сообщений
  const [messages, setMessages] = useState<ChatMessageState[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [connectionError, setConnectionError] = useState<Error | null>(null)
  const [isSending, setIsSending] = useState(false)

  // Получаем telegram_chat_id из данных пользователя
  const telegramChatId = user?.data?.telegram_chat_id 
    ? String(user.data.telegram_chat_id) 
    : undefined

  /* ----------------- WebSocket подключение и обработка сообщений ----------------- */
  useEffect(() => {
    if (!telegramChatId) {
      setIsLoadingHistory(false)
      return
    }

    const client = wsClientRef.current
    let isMounted = true

    // Обработчик сообщений от сервера
    const handleMessage = (response: WebSocketResponse) => {
      if (!isMounted) return

      switch (response.command) {
        case "history":
          // Загружена история чата
          setMessages(response.data.map(item => {
            // Проверяем, является ли элемент helpbox
            if ('command' in item && item.command === 'helpbox') {
              return {
                role: 'assistant' as const,
                content: <MessageHelpBox />,
                sent: response.sent,
                isPending: false,
                isHelpBox: true,
              }
            }
            // Обычное сообщение (type guard для TypeScript)
            if ('role' in item && 'content' in item && 'sent' in item) {
              return {
                role: item.role,
                content: item.content,
                sent: item.sent,
                isPending: false,
              }
            }
            // Fallback (не должно произойти, но для безопасности)
            return {
              role: 'assistant' as const,
              content: '',
              sent: response.sent,
              isPending: false,
            }
          }))
          setIsLoadingHistory(false)
          setConnectionError(null)
          break

        case "answer":
          // Получен ответ от ассистента
          setMessages(prev => {
            // Убираем pending статус с последнего сообщения пользователя
            const updated = prev.map((msg, idx) => {
              if (idx === prev.length - 1 && msg.role === "user" && msg.isPending) {
                return { ...msg, isPending: false }
              }
              return msg
            })
            
            // Добавляем ответ ассистента
            return [
              ...updated,
              ...response.data.map(msg => ({
                role: msg.role,
                content: msg.content,
                sent: msg.sent,
                isPending: false,
              }))
            ]
          })
          setIsSending(false)
          break

        case "error":
          // Ошибка от сервера
          setConnectionError(new Error(response.error || "Неизвестная ошибка"))
          setIsSending(false)
          setIsLoadingHistory(false)
          break

        case "clear":
          // История очищена
          setMessages([])
          break
      }
    }

    // Обработчик ошибок
    const handleError = (error: Error) => {
      if (!isMounted) return
      setConnectionError(error)
      setIsLoadingHistory(false)
      setIsSending(false)
    }

    // Обработчик изменения статуса
    const handleStatusChange = (status: string) => {
      if (!isMounted) return
      if (status === "error") {
        setConnectionError(new Error("Ошибка соединения"))
      }
    }

    // Подписываемся на события
    const unsubscribeMessage = client.onMessage(handleMessage)
    const unsubscribeError = client.onError(handleError)
    const unsubscribeStatus = client.onStatusChange(handleStatusChange)

    // Подключаемся к WebSocket
    setIsLoadingHistory(true)
    client.connect(telegramChatId).catch((error) => {
      if (isMounted) {
        handleError(error)
      }
    })

    // Очистка при размонтировании
    return () => {
      isMounted = false
      unsubscribeMessage()
      unsubscribeError()
      unsubscribeStatus()
      // Не отключаемся полностью, так как клиент может использоваться в других местах
      // client.disconnect()
    }
  }, [telegramChatId])

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
    if (!telegramChatId) return

    const client = wsClientRef.current
    
    // Проверяем, что соединение установлено
    if (!client.isConnected()) {
      setConnectionError(new Error("Соединение не установлено. Попробуйте перезагрузить страницу."))
      return
    }

    try {
      client.clearHistory()
      // Сообщения будут очищены при получении ответа от сервера (команда "clear")
    } catch (error) {
      const err = error instanceof Error 
        ? error 
        : new Error("Ошибка очистки истории")
      setConnectionError(err)
    }
  }, [telegramChatId])

  /* ----------------- Отправка сообщения ----------------- */
  const handleSend = useCallback((content: string) => {
    const trimmed = content.trim()
    if (!trimmed || isSending || !telegramChatId) return

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

    setMessages(prev => [...prev, userMessage])
    setIsSending(true)
    setConnectionError(null)

    try {
      client.sendMessage(trimmed)
    } catch (error) {
      const err = error instanceof Error 
        ? error 
        : new Error("Ошибка отправки сообщения")
      
      // Убираем pending сообщение при ошибке
      setMessages(prev => prev.filter(msg => msg !== userMessage))
      setConnectionError(err)
      setIsSending(false)
    }
  }, [isSending, telegramChatId])

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
          isDisabled={isSending || !telegramChatId || isLoadingHistory}
        />
      </Box>
    </>
  )
}