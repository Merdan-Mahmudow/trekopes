import { useRef, useState } from "react";
import { Box, Flex, Input as ChakraInput, Button, Icon } from "@chakra-ui/react";
import { BsSendFill } from "react-icons/bs";
import { COLOR } from "../ui/colors";

export interface ChatInputProps {
  onSend: (content: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
}

export function ChatInput({
  onSend,
  placeholder = "Введите сообщение...",
  isDisabled = false,
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState("");

  const send = () => {
    inputRef.current?.focus()
    const trimmed = value.trim();
    if (!trimmed || isDisabled) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <Box bg="gray.800" p={3} h={"fit-content"}>
      <Flex gap={2} align="center">
        <ChakraInput
          value={value}
          ref={inputRef}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={placeholder}
          bg="#0f1111"
          color="white"
          rounded={"2xl"}
          size={"lg"}
          fontSize="16px"
          h={"38px"}
          outline={"none"}
          _focus={{ borderColor: COLOR.kit.orange, outline: "none" }}
        />
        <Button
          aria-label="Send"
          onClick={send}
          disabled={isDisabled}
          h={"38px"}
          w={"45px"}
          colorScheme="green"
          rounded={"2xl"}
          bg={"orange.500"}
        >
          <Icon as={BsSendFill} position={"relative"} right={0.5} color={"white"} />
        </Button>
      </Flex>
    </Box>
  );
}