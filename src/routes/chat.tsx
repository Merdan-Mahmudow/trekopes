import { ChatInput } from '../components/Input'
import { ChatList, MessageHelpBox, type MessageProps } from '../components/Message'
import { Avatar, AvatarImage, Box, Circle, Flex, Float, Grid, Text } from '@chakra-ui/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { Telegram } from "telegram-web-app";


export const Route = createFileRoute('/chat')({
  component: RouteComponent,
})

function RouteComponent() {
  const tg: Telegram = window.Telegram;
  const [messages, addMessage] = useState<MessageProps[]>([])
  const navigate = useNavigate()
  useEffect(() => {
    setTimeout(() => addMessage(prev => [...prev, {role: "assistant", content: <MessageHelpBox />, isHelpBox: true}]), 725)
  }, [addMessage])


  tg.WebApp.BackButton.show()
  tg.WebApp.BackButton.onClick(() => {
    navigate({ to: '/' })
  })


  const handleSend = (content: string) => {
    // добавляем сообщение от пользователя
    addMessage(prev => [...prev, { role: "user", content }])
    // пример: симулируем ответ ассистента через небольшой таймаут
    setTimeout(() => {
      addMessage(prev => [...prev, { role: "assistant", content: `Ответ: ${content}` }])
    }, 700)
  }
   return <>
     <Grid
       templateRows={"70px 1fr 65px"}
       h="100%">
       <Flex
         bg={"gray.800"}
         alignItems={"center"}
         pl={7}
         gapX={4}>
         <Avatar.Root colorPalette="green" variant="subtle" size={"lg"}>
           <Avatar.Fallback name="Dari Ann" />
           <AvatarImage src='https://storage.yandexcloud.net/trekopes/trekopes_ava.jpg' />
           <Float placement="bottom-end" offsetX="2" offsetY="1.5">
             <Circle
               bg="green.500"
               size="8px"
             />
           </Float>
         </Avatar.Root>
         <Box>
           <Text textTransform={"uppercase"} lineHeight={"15px"}>трекопёс</Text>
           <Text fontSize={"9pt"} color={"green"}>online</Text>
         </Box>
       </Flex>
       <Box overflowY="auto" px={3} py={2} bg="gray.900" minH={0}>
         <ChatList messages={messages} />
       </Box>
       <Box>
         {/* Здесь должен быть компонент ChatInput */}
         <ChatInput onSend={handleSend} />
       </Box>
     </Grid>
   </>
 }
