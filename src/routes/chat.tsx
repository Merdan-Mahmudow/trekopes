import { ChatInput } from '../components/Input'
import { ChatList, MessageHelpBox, type MessageProps } from '../components/Message'
import { Avatar, AvatarImage, Box, Circle, Flex, Float, Grid, Text } from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'


export const Route = createFileRoute('/chat')({
  component: RouteComponent,
})

function RouteComponent() {
  const [messages, addMessage] = useState<MessageProps[]>([])
  useEffect(() => {
    setTimeout(() => addMessage(prev => [...prev, {role: "assistant", content: <MessageHelpBox />, isHelpBox: true}]), 725)
  }, [addMessage])

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
       templateRows={"70px 1fr 50px"}>
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
       <Box overflowY="auto" px={3} py={2} bg="gray.900">
         <ChatList messages={messages} />
       </Box>
       <Box>
         {/* Здесь должен быть компонент ChatInput */}
         <ChatInput onSend={handleSend} />
       </Box>
     </Grid>
   </>
 }
