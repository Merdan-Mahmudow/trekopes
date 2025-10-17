import { MessageBox, type MessageProps } from '../components/Message'
import { Avatar, AvatarImage, Box, Circle, Flex, Float, Grid, Text } from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/chat')({
  component: RouteComponent,
})

function RouteComponent() {
  const [messages, addMessage] = useState<[MessageProps]>()
  // useEffect(() => {
  //   setTimeout(() => addMessage(prev => [..., {role: "assistant", content: "HELP MESSAGE"}]), 500)
  // })
  return <>
    <Grid
      h={""}
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
      <Box overflowY={'auto'}>
        
      </Box>
      <Box bg={"black"}></Box>
    </Grid>
  </>
}
