// TrackLoadingScreen.tsx
import { VStack, Text, Box } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion(Box);

export const TrackLoadingScreen = () => {
  return (
    <VStack
      w="100vw"
      h="100vh"
      bg="black"
      color="white"
      justify="center"
      align="center"
      gap={6}
    >
      <Text fontSize="2xl" fontWeight="bold" color="orange.400">
        Готовим твой трек!
      </Text>
      <Text fontSize="md" color="gray.300">
        Я напишу в телеграм, когда все будет готово
      </Text>

      <AnimatePresence>
        <MotionBox
          w="100px"
          h="100px"
          borderRadius="full"
          bg="orange.400"
          display="flex"
          justifyContent="center"
          alignItems="center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        >
          <Text fontSize="4xl">🐾</Text>
        </MotionBox>
      </AnimatePresence>

      <Text fontSize="sm" color="gray.500">
        Можно закрывать экран, я уже работаю
      </Text>
    </VStack>
  );
};
