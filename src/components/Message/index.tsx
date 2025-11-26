import { Button, Flex, Float, Grid, Icon, Text, Box, Avatar } from "@chakra-ui/react"
import { useColorModeValue } from "../ui/color-mode"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Transition } from "framer-motion";
import { memo } from "react";
import { BsChatDots, BsQuestionLg } from "react-icons/bs";
import { COLOR } from "../ui/colors";
import { TbExternalLink } from "react-icons/tb";
import { MarkdownRenderer } from "./MarkdownRenderer";
import "./katex-styles.css";
import type { Telegram } from "telegram-web-app";

export interface MessageProps {
  role: "user" | "assistant"
  content: any
  isHelpBox?: boolean
}

export const MessageBox = memo(function MessageBox({ role, content }: MessageProps) {
  const isAssistant = role === "assistant";
  const isStringContent = typeof content === 'string';
  const tg: Telegram | undefined = window.Telegram;

  // Colors
  const assistantBg = useColorModeValue("#F7F7F8", "#1E1E1E");
  const userBg = useColorModeValue("#FFFFFF", "#101010");
  const assistantColor = useColorModeValue("gray.800", "gray.100");
  const userColor = useColorModeValue("gray.900", "white");

  return (
    <Flex 
      gap={4} 
      w="full" 
      maxW="100%" 
      mb={isAssistant ? 6 : 4}
      alignItems="flex-start"
      justifyContent="flex-end"
    >
      

      <Box
        bg={!isAssistant ? assistantBg : userBg}
        color={!isAssistant ? assistantColor : userColor}
        borderRadius="2xl"
        px={6}
        py={4}
        border="1px solid"
        borderColor={useColorModeValue("blackAlpha.50", "whiteAlpha.100")}
        fontSize="md"
        lineHeight="1.5"
        minW="0"
        maxW="100%"
        w={!isAssistant ? "fit-content" : "full"}
      >
        {isAssistant ? (
          isStringContent ? (
            <MarkdownRenderer content={content} role="assistant" />
          ) : (
            content
          )
        ) : (
          <Text 
            whiteSpace="pre-wrap" 
            wordBreak="break-word"
          >
            {content}
          </Text>
        )}
      </Box>
      {
        !isAssistant && (
          <Avatar.Root size="sm" mt={1}>
            <Avatar.Fallback name={tg?.WebApp.initDataUnsafe.user?.first_name} />
            <Avatar.Image src={tg?.WebApp.initDataUnsafe.user?.photo_url} />
          </Avatar.Root>
        )
      }
    </Flex>
  );
})

export const ChatList = memo(function ChatList({ messages }: { messages: MessageProps[] }) {
  const prefersReduced = useReducedMotion();

  // GPT-style: Slide up + Fade
  const enter = prefersReduced
    ? { opacity: 1 }
    : { y: 10, opacity: 0 };
  const show = prefersReduced ? { opacity: 1 } : { y: 0, opacity: 1 };
  const leave = prefersReduced ? { opacity: 0 } : { opacity: 0 }; // No slide down on exit usually

  const transition: Transition = { 
    duration: 0.3, 
    ease: "easeOut" 
  };

  return (
    <Flex
      direction="column"
      w="full"
      gap={2}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {messages.map((msg, idx) => (
          <motion.div
            key={msg.isHelpBox ? 'helpbox' : `${msg.role}-${idx}-${typeof msg.content === 'string' ? msg.content.slice(0, 20) : idx}`}
            layout
            initial={enter}
            animate={show}
            exit={leave}
            transition={transition}
            style={{ width: "100%" }}
          >
            {!msg.isHelpBox ? <MessageBox role={msg.role} content={msg.content} /> : msg.content}
          </motion.div>
        ))}
      </AnimatePresence>
    </Flex>
  );
})

export function MessageHelpBox() {
  const bg = useColorModeValue("#F7F7F8", "#1E1E1E");
  const color = useColorModeValue("gray.800", "gray.100");

  return (
    <Grid marginBlock={3} gap={1}>
      <Flex
        borderRadius={"2xl"}
        textAlign={"left"}
        p={"1rem 1.3rem"}
        maxW={["500px", "325px"]} // Keep specific sizing for helpbox if needed, or remove for consistency
        w={"fit-content"}
        color={color}
        bg={bg}
        direction={"column"}
        gap={3}
        border="1px solid"
        borderColor={useColorModeValue("blackAlpha.50", "whiteAlpha.100")}
      >
        <Flex>
          <BsChatDots size={"28px"} color={COLOR.brand.orange} style={{ position: "relative", top: "-1px", marginRight: "5px" }} />
          <Text>
            В Гав-чате можно спросить совета по треку и получить идеи.
          </Text>
        </Flex>

        <Flex>
          <BsQuestionLg size={"22px"} color={COLOR.brand.orange} style={{ position: "relative", top: "1px", marginRight: "5px" }} />
          <Text>
            Нужна помощь?
          </Text>
        </Flex>

      </Flex>
      <Button color={COLOR.kit.orange} onClick={() => window.location.href = "https://t.me/Help_llec_bot"} rounded={"xl"} bg={"whiteAlpha.300"} letterSpacing={1} size={"lg"}>
        GAVHELP
        <Float offsetX={2.5} offsetY={2.5}>
          <Icon color={"white"} children={<TbExternalLink style={{width: "13px", height: "13px"}} />}/>
        </Float>
        </Button>
    </Grid>
  );
}
