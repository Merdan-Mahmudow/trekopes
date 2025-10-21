import { useState } from "react";
import { Box, Flex, Input as ChakraInput, Button, Icon } from "@chakra-ui/react";
import { BsSendFill } from "react-icons/bs";

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
  const [value, setValue] = useState("");

  const send = () => {
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
          borderRadius="full"
          size={"md"}
          fontSize="16px"
        />
        <Button
          aria-label="Send"
          onClick={send}
          disabled={isDisabled}
          size="md"
          colorScheme="green"
          rounded={"full"}
          bg={"orange.500"}
        >
          <Icon as={BsSendFill} color={"white"} />
        </Button>
      </Flex>
    </Box>
  );
}