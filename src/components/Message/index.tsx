import { Button, Flex, Float, Grid, Icon, Text } from "@chakra-ui/react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Transition } from "framer-motion";
import {  memo } from "react";
import { BsChatDots, BsQuestionLg } from "react-icons/bs";
import { COLOR } from "../ui/colors";
import { TbExternalLink } from "react-icons/tb";

export interface MessageProps {
  role: "user" | "assistant"
  content: any
  isHelpBox?: boolean
}
export const MessageBox = memo(function MessageBox({ role, content }: MessageProps) {
  return (
    <>
      {role === "assistant" ? (
        <Text
          ml={"3"}
          marginBlock={"3"}
          borderTopRadius={"2xl"}
          borderBottomEndRadius={"2xl"}
          textAlign={"left"}
          paddingLeft={"4"}
          paddingRight={"4"}
          paddingTop={"2"}
          paddingBottom={"2"}
          maxW={["500px", "325px"]}
          w={"fit-content"}
          color={"gray.100"}
          bg={"#242625"}
          display={"block"}
        >
          {content}
        </Text>
      ) : (
        <Text
          mr={"3"}
          marginLeft="auto"
          p={2}
          marginBlock={"3"}
          borderTopRadius={"2xl"}
          borderBottomStartRadius={"2xl"}
          textAlign={"left"}
          paddingLeft={"4"}
          paddingRight={"4"}
          paddingTop={"2"}
          paddingBottom={"2"}
          maxW={["500px", "325px"]}
          w={"fit-content"}
          bg={"#134d37"}
          color={"white"}
          display={"block"}
        >
          {content}
        </Text>
      )}
    </>
  );
})

export const ChatList = memo(function ChatList({ messages }: { messages: MessageProps[] }) {
  const prefersReduced = useReducedMotion();

  const enter = prefersReduced
    ? { opacity: 1 }
    : { y: 16, opacity: 0, scale: 0.98 };
  const show = prefersReduced ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 };
  const leave = prefersReduced ? { opacity: 0 } : { y: 8, opacity: 0, scale: 0.98 };
  const spring: Transition = prefersReduced
    ? { duration: 0 }
    : { type: "spring", stiffness: 500, damping: 30, mass: 0.6 };

  return (
    <div
      className="chat-scroll"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AnimatePresence initial={false}>
        {messages.map((msg, idx) => (
          <motion.div
            key={msg.isHelpBox ? 'helpbox' : `${msg.role}-${idx}-${typeof msg.content === 'string' ? msg.content.slice(0, 20) : idx}`}
            layout
            initial={enter}
            animate={show}
            exit={leave}
            transition={spring}
            style={{ transformOrigin: "bottom left", display: "flex" }}
            className="bubble"
          >
            {!msg.isHelpBox ? <MessageBox role={msg.role} content={msg.content} /> : msg.content}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
})

export function MessageHelpBox() {
  return (
    <>
      <Grid marginBlock={3} gap={1}>
        <Flex
          borderRadius={"2xl"}
          textAlign={"left"}
          p={"1rem 1.3rem"}
          maxW={["500px", "325px"]}
          w={"fit-content"}
          color={"gray.100"}
          bg={"#242625"}
          direction={"column"}
          gap={3}>
          <Flex>
            <BsChatDots size={"28px"} color={COLOR.brand.orange} style={{ position: "relative", top: "-1px", marginRight: "5px" }} />
            <Text >
              В Гав-чате можно спросить совета по треку и получить идеи.
            </Text>
          </Flex>

          <Flex>
            <BsQuestionLg size={"22px"} color={COLOR.brand.orange} style={{ position: "relative", top: "1px", marginRight: "5px" }} />
            <Text >
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
    </>
  );
}

