import { ChatInput } from '../components/Input'
import { ChatList, type MessageProps } from '../components/Message'
import {
  Avatar,
  AvatarImage,
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
import { useEffect, useMemo, useRef, useCallback, useLayoutEffect, useReducer } from 'react'
import type { Telegram } from "telegram-web-app"
import { IoChevronBack } from "react-icons/io5"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getWebAppChatMessages, sendWebAppChatMessage } from "../api/webapp"
import { useAuth } from "../hooks/useUser"
import type { ChatMessage } from "../types/webapp"

export const Route = createFileRoute('/chat')({
  component: RouteComponent,
})

// Тип для локальных pending-сообщений
interface PendingMessage {
  id: string
  role: "user" | "assistant"
  content: string
  isPending?: boolean
}

function RouteComponent() {
  const tg: Telegram | undefined = window.Telegram
  const navigate = useNavigate()
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const chatContainerRef = useRef<HTMLDivElement>(null)
  
  // Локальные pending-сообщения (оптимистичные обновления)
  const pendingMessagesRef = useRef<PendingMessage[]>([])
  const [pendingCount, setPendingCount] = useReducer(x => x + 1, 0)

  /* ----------------- Загрузка истории ----------------- */
  const {
    data: chatHistory,
    isLoading: isLoadingHistory,
    error: historyError,
  } = useQuery({
    queryKey: ["webapp-chat-messages", token],
    queryFn: async () => {
      if (!token) throw new Error("Токен недоступен")
      return getWebAppChatMessages(token, { limit: 50, offset: 0 })
    },
    enabled: !!token,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  // Убрали автоматическое очищение pending - сообщения добавляются напрямую в кэш

  /* ----------------- Отправка сообщения ----------------- */
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!token) throw new Error("Токен недоступен")
      return sendWebAppChatMessage(token, { message })
    },
    onMutate: async (message) => {
      // Отменяем текущие запросы чтобы не было race condition
      await queryClient.cancelQueries({ queryKey: ["webapp-chat-messages", token] })
      
      // Добавляем pending сообщение
      const pendingId = `pending-${Date.now()}`
      pendingMessagesRef.current = [
        ...pendingMessagesRef.current,
        { id: pendingId, role: "user", content: message, isPending: true }
      ]
      setPendingCount()
      
      return { pendingId }
    },
    onSuccess: (response: any, message: string, context: any) => {
      // Убираем pending сообщение пользователя
      pendingMessagesRef.current = pendingMessagesRef.current.filter(
        m => m.id !== context?.pendingId
      )
      
      // Добавляем ответ ассистента в pending для немедленного рендера
      if (response?.data) {
        const assistantId = `assistant-${Date.now()}`
        pendingMessagesRef.current = [
          ...pendingMessagesRef.current,
          { 
            id: assistantId, 
            role: response.data.role || "assistant", 
            content: response.data.content || "",
            isPending: false 
          }
        ]
      }
      
      setPendingCount()
      
      // Обновляем кэш в фоне для синхронизации
      queryClient.setQueryData(
        ["webapp-chat-messages", token],
        (old: any) => {
          const base = old ?? {
            success: true,
            data: [] as ChatMessage[],
          }
          
          // Создаем сообщения пользователя и ассистента
          const userMsg: ChatMessage = {
            id: `temp-user-${Date.now()}`,
            role: "user",
            content: message,
            created_at: new Date().toISOString(),
          }
          
          const assistantMsg: ChatMessage = response?.data || {
            id: `temp-assistant-${Date.now()}`,
            role: "assistant",
            content: response?.data?.content || "",
            created_at: new Date().toISOString(),
          }
          
          return {
            ...base,
            data: [...base.data, userMsg, assistantMsg]
          }
        }
      )
    },
    onError: (_err, _message, context) => {
      // Убираем pending сообщение при ошибке
      pendingMessagesRef.current = pendingMessagesRef.current.filter(
        m => m.id !== context?.pendingId
      )
      setPendingCount()
    },
  })

  /* ----------------- Формирование списка сообщений ----------------- */
  const messages: MessageProps[] = useMemo(() => {
    // Фильтруем undefined/null значения из истории
    const historyMessages: MessageProps[] = (chatHistory?.data || [])
      .filter((msg): msg is ChatMessage => msg != null && msg.role != null && msg.content != null)
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))
    
    // Фильтруем pending сообщения
    const pending: MessageProps[] = pendingMessagesRef.current
      .filter(msg => msg != null && msg.role != null && msg.content != null)
      .map(msg => ({
        role: msg.role,
        content: msg.content,
        isPending: msg.isPending,
      }))
    
    // Возвращаем историю + pending сообщения
    return [...historyMessages, ...pending]
  }, [chatHistory?.data, pendingCount])

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
    const currentLength = messages.length
    if (currentLength > prevLengthRef.current) {
      scrollToBottom(prevLengthRef.current > 0)
    }
    prevLengthRef.current = currentLength
  }, [messages.length, scrollToBottom])

  /* ----------------- Отправка сообщения ----------------- */
  const handleSend = useCallback((content: string) => {
    const trimmed = content.trim()
    if (!trimmed || sendMessageMutation.isPending) return
    sendMessageMutation.mutate(trimmed)
  }, [sendMessageMutation])

  return (
    <>
      <Grid templateRows="1fr" h="93dvh" overflow="hidden">
        {/* Header */}
        <Flex
          bg="gray.800"
          alignItems="center"
          pl={2}
          gapX={4}
          pos="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={10}
          h="70px"
        >
          <Flex gapX={2}>
            <IconButton 
              variant="ghost" 
              onClick={handleBackClick}
              aria-label="Назад"
            >
              <IoChevronBack />
            </IconButton>

            <Avatar.Root variant="subtle" size="lg">
              <Avatar.Fallback name="ТРЕКОПЁС" />
              <AvatarImage 
                src="https://storage.yandexcloud.net/trekopes/trekopes_ava.jpg"
                loading="lazy"
              />
              <Float placement="bottom-end" offsetX="2" offsetY="1.5">
                <Circle bg="green.500" size="8px" />
              </Float>
            </Avatar.Root>
          </Flex>

          <Box>
            <Text textTransform="uppercase" lineHeight="15px">трекопёс</Text>
            <Text fontSize="9pt" color="green">online</Text>
          </Box>
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
          {isLoadingHistory && messages.length === 0 ? (
            <Flex justify="center" align="center" h="100%">
              <Spinner size="lg" color="orange.500" />
            </Flex>
          ) : historyError && messages.length === 0 ? (
            <Flex justify="center" align="center" h="100%" direction="column" gap={2}>
              <Text color="red.500">Ошибка загрузки истории чата</Text>
              <Text fontSize="sm" color="gray.400">
                Попробуйте обновить страницу
              </Text>
            </Flex>
          ) : (
            <ChatList messages={messages} />
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
          isDisabled={sendMessageMutation.isPending || !token}
        />
      </Box>
    </>
  )
}