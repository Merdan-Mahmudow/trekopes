import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { motion, useReducedMotion } from "framer-motion";
import { COLOR } from "../ui/colors";
import '../../style/fonts.css'

const MotionFlex = motion.create(Flex);
const MotionBox = motion.create(Box);
const MotionVStack = motion.create(VStack);
const MotionText = motion.create(Text);

interface DeviceBlockedProps {
  reason: string;
}

export function DeviceBlocked({ reason }: DeviceBlockedProps) {
  const reduceMotion = useReducedMotion();

  return (
    <MotionFlex
      h="100dvh"
      w="100vw"
      justifyContent="center"
      alignItems="center"
      bg={COLOR.kit.darkGray}
      px={4}
      position="relative"
      overflow="hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Градиентные эффекты на фоне */}
      {!reduceMotion && (
        <>
          <MotionBox
            position="absolute"
            left="-15%"
            top="-15%"
            w="500px"
            h="500px"
            bg="radial-gradient(circle, rgba(243,146,4,0.3) 0%, rgba(243,146,4,0) 70%)"
            filter="blur(60px)"
            pointerEvents="none"
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <MotionBox
            position="absolute"
            right="-15%"
            bottom="-15%"
            w="500px"
            h="500px"
            bg="radial-gradient(circle, rgba(243,146,4,0.25) 0%, rgba(243,146,4,0) 70%)"
            filter="blur(60px)"
            pointerEvents="none"
            animate={{
              opacity: [0.15, 0.35, 0.15],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </>
      )}

      <MotionVStack
        gap={6}
        textAlign="center"
        maxW="90vw"
        zIndex={1}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Анимированный заголовок */}
        <Flex gap={1} justifyContent="center">
          {"ТРЕКОПЁС".split("").map((char, index) => (
            <MotionText
              key={index}
              fontSize="28px"
              fontWeight="bold"
              color={COLOR.kit.orange}
              letterSpacing={2}
              className="font-bicubic"
              initial={{ opacity: 0, y: -20 }}
              animate={{
                opacity: 1,
                y: 0,
                textShadow: [
                  `0 0 0px ${COLOR.kit.orange}`,
                  `0 0 15px ${COLOR.kit.orange}`,
                  `0 0 0px ${COLOR.kit.orange}`,
                ],
              }}
              transition={{
                opacity: { duration: 0.5, delay: 0.3 + index * 0.05 },
                y: { duration: 0.5, delay: 0.3 + index * 0.05, type: "spring", stiffness: 200 },
                textShadow: {
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.5 + index * 0.1,
                },
              }}
            >
              {char}
            </MotionText>
          ))}
        </Flex>

        {/* Карточка с информацией */}
        <MotionBox
          bg={COLOR.bg.hex.subtle}
          borderRadius="3xl"
          p={8}
          maxW="420px"
          w="full"
          border="1px solid"
          borderColor="rgba(243, 146, 4, 0.1)"
          backdropFilter="blur(20px)"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <VStack gap={4}>
            {/* Иконка/индикатор */}
            <MotionBox
              w="60px"
              h="60px"
              borderRadius="full"
              bg="radial-gradient(circle, rgba(243,146,4,0.3) 0%, rgba(243,146,4,0.1) 100%)"
              border="2px solid"
              borderColor={COLOR.kit.orange}
              display="flex"
              alignItems="center"
              justifyContent="center"
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  `0 0 0px ${COLOR.kit.orange}`,
                  `0 0 20px ${COLOR.kit.orange}`,
                  `0 0 0px ${COLOR.kit.orange}`,
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Text fontSize="24px">📱</Text>
            </MotionBox>

            <Text
              fontSize="22px"
              fontWeight="600"
              color={COLOR.text.primary}
              letterSpacing="0.5px"
            >
              Приложение недоступно
            </Text>
            
            <Text
              fontSize="15px"
              color={COLOR.text.secondary}
              lineHeight="1.7"
              px={2}
            >
              {reason}
            </Text>

            {/* Пульсирующая подсказка */}
            <MotionText
              fontSize="13px"
              color={COLOR.text.muted}
              mt={2}
              px={2}
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Откройте приложение через Telegram Mini App на iOS или Android смартфоне
            </MotionText>
          </VStack>
        </MotionBox>
      </MotionVStack>
    </MotionFlex>
  );
}

