import { useRef, useState, useEffect } from "react";
import { Box, Flex, Textarea, IconButton } from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode";
import { FaArrowUp } from "react-icons/fa";
import { useLenis } from "lenis/react";
import { COLOR } from "../ui/colors";

export interface ChatInputProps {
  onSend: (content: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
}

export function ChatInput({
  onSend,
  placeholder = "Сообщение...",
  isDisabled = false,
}: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lenis = useLenis();
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const bg = useColorModeValue("#FFFFFF", "#1C1C1C");
  const borderColor = useColorModeValue("rgba(0,0,0,0.1)", "rgba(255,255,255,0.1)");

  useEffect(() => {
    if (!lenis) return;
    
    if (isFocused) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [isFocused, lenis]);

  // Auto-resize effect
  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`; // Max height approx 8 lines
  }, [value]);

  const send = () => {
    const trimmed = value.trim();
    if (!trimmed || isDisabled) return;
    onSend(trimmed);
    setValue("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <Box w="full" maxW="880px" mx="auto" px={2} pb={4}>
      <Flex 
        align="flex-end" 
        bg={bg}
        border="1px solid"
        borderColor={borderColor}
        rounded="3xl"
        p={2}
        boxShadow="sm"
        transition="border-color 0.2s"
        _focusWithin={{ borderColor: COLOR.kit.orange, boxShadow: "md" }}
      >


        <Textarea
          value={value}
          ref={inputRef}
          disabled={isDisabled}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          bg="transparent"
          border="none"
          _focus={{ boxShadow: "none", borderColor: "transparent" }}
          resize="none"
          minH="44px"
          py={2.5}
          px={3}
          fontSize="16px"
          lineHeight="1.5"
          rows={1}
          overflow="hidden"
          flex={1}
          outline="none"
        />

        <IconButton
          aria-label="Send"
          onClick={send}
          disabled={isDisabled || !value.trim()}
          h="40px"
          w="40px"
          rounded="full"
          mb="3px"
          bg={value.trim() ? COLOR.kit.orange : useColorModeValue("gray.200", "gray.700")}
          color="white"
          _hover={{ bg: value.trim() ? COLOR.kit.orange : undefined }}
          transition="all 0.2s"
        >
           <FaArrowUp size="16px" />
        </IconButton>
      </Flex>

    </Box>
  );
}
