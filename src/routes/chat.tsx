import { ChatInput } from '../components/Input'
import { ChatList, MessageHelpBox, type MessageProps } from '../components/Message'
import { Avatar, AvatarImage, Box, Circle, Flex, Float, Grid, Text } from '@chakra-ui/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { Telegram } from "telegram-web-app";


export const Route = createFileRoute('/chat')({
  component: RouteComponent,
})

const INITIAL_MESSAGE_DELAY = 725;
const RESPONSE_DELAY = 700;

function RouteComponent() {
  const tg: Telegram | undefined = window.Telegram;
  const [messages, addMessage] = useState<MessageProps[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      addMessage(prev => [...prev, {role: "assistant", content: <MessageHelpBox />, isHelpBox: true}])
    }, INITIAL_MESSAGE_DELAY);
    return () => clearTimeout(timer);
  }, [])

  useEffect(() => {
    if (!tg?.WebApp) return;

    tg.WebApp.BackButton.show();
    const handleBack = () => {
      navigate({ to: '/' });
    };
    tg.WebApp.BackButton.onClick(handleBack);

    return () => {
      tg.WebApp.BackButton.hide();
    };
  }, [navigate, tg])


  const handleSend = (content: string) => {
    // добавляем сообщение от пользователя
    addMessage(prev => [...prev, { role: "user", content }])
    // пример: симулируем ответ ассистента через небольшой таймаут
    setTimeout(() => {
      addMessage(prev => [...prev, { role: "assistant", content: `Ответ: ${content}` }])
    }, RESPONSE_DELAY)
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
