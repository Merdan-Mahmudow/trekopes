import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { COLOR } from "../ui/colors";
import '../../style/fonts.css'

interface DeviceBlockedProps {
  reason: string;
}

export function DeviceBlocked({ reason }: DeviceBlockedProps) {
  return (
    <Flex
      h="100dvh"
      w="100vw"
      justifyContent="center"
      alignItems="center"
      bg={COLOR.kit.darkGray}
      px={4}
    >
      <VStack
        gap={4}
        textAlign="center"
        maxW="90vw"
      >
        <Text
          fontSize="24px"
          fontWeight="bold"
          color={COLOR.kit.orangeWhite}
          className="font-bicubic"
        >
          ТРЕКОПЁС
        </Text>
        <Box
          bg={COLOR.kit.smoke}
          borderRadius="2xl"
          p={6}
          maxW="400px"
        >
          <VStack gap={3}>
            <Text
              fontSize="18px"
              fontWeight="600"
              color={COLOR.text.primary}
            >
              Приложение недоступно
            </Text>
            <Text
              fontSize="14px"
              color={COLOR.text.secondary}
              lineHeight="1.6"
            >
              {reason}
            </Text>
            <Text
              fontSize="12px"
              color={COLOR.text.muted}
              mt={2}
            >
              Откройте приложение через Telegram Mini App на iOS или Android смартфоне
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Flex>
  );
}

