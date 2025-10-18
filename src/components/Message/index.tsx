import { Text } from "@chakra-ui/react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Transition } from "framer-motion";
import { useRef, useEffect } from "react";

export interface MessageProps {
    role: "user" | "assistant"
    content: string
}
export function MessageBox({ role, content }: MessageProps) {
  return (
    <>
      {role == "assistant" ? (
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
          maxW={["500px", "325px" ]}
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
          maxW={["500px", "325px" ]}
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
}

export function ChatList({ messages }: { messages: MessageProps[] }) {
  const prefersReduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);

  // Автоматически держим скролл внизу при приходе новых сообщений
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    // скроллим в следующем фрейме после рендера — теперь ВСЕГДА прокручиваем в конец
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages]);

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
      ref={wrapRef}
      className="chat-scroll"
      style={{
        height: "100%", 
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AnimatePresence initial={false}>
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            layout
            initial={enter}
            animate={show}
            exit={leave}
            transition={spring}
            style={{ transformOrigin: "bottom left", display: "flex" }}
            className="bubble"
          >
            <MessageBox role={msg.role} content={msg.content} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}