// TrackLoadingScreen.tsx
import { Box, Flex, Heading, Image, Text, VStack } from "@chakra-ui/react";
import { motion, useReducedMotion } from "framer-motion";
import { COLOR } from "../../../components/ui/colors";

const MotionSvg = motion.svg;
const MotionGroup = motion.g;
const MotionPath = motion.path;
const MotionBox = motion(Box);

export const TrackLoadingScreen = () => {
  const reduceMotion = useReducedMotion();

  // --- Нормализованные размеры под viewBox 200x200 ---
  const R_OUT = 92; // внешний радиус кольца
  const RING_SW = 33; // толщина базового кольца (по скрину ~26px → масштаб до ~33px)
  const R = R_OUT - RING_SW / 2; // центральный радиус штриха
  const ARC_SW = RING_SW; // дугу делаем той же толщины
  const CIRC = 2 * Math.PI * R;
  const DASH = Math.round(0.29 * CIRC); // ~28–30% окружности
  const GAP = Math.round(2 * CIRC); // большой gap, чтобы была одна дуга

  // Размер лапки ≈ 0.82 от внутреннего диаметра (визуально аккуратнее, чем 0.92)
  const INNER_DIAM = 2 * (R_OUT - RING_SW);
  const PAW_SIZE = Math.round(0.82 * INNER_DIAM); // ≈ 98px

  const steps = [
    {
      title: "Анализируем идею",
      description: "Собираем референсы и проверяем, что трек соответствует запросу.",
    },
    {
      title: "Готовим аранжировку",
      description: "Подбираем звучание, строим драм-партию и сочетаем мелодии.",
    },
    {
      title: "Выводим мастер",
      description: "Делаем чистый микс и готовим файл к прослушиванию.",
    },
  ];

  return (
    <VStack
      gap={8}
      w="full"
      color={COLOR.kit.white}
      align="stretch"
      px={{ base: 2, md: 4 }}
      py={{ base: 4, md: 6 }}
    >
      <Box position="relative" w="full">
        {!reduceMotion && (
          <>
            <MotionBox
              position="absolute"
              insetInlineStart="-120px"
              insetBlockStart="-160px"
              w="320px"
              h="320px"
              bg="radial-gradient(70% 70% at 50% 50%, rgba(243,146,4,0.4) 0%, rgba(243,146,4,0) 90%)"
              filter="blur(20px)"
              pointerEvents="none"
              animate={{ opacity: [0.35, 0.6, 0.35], scale: [0.9, 1.05, 0.9] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <MotionBox
              position="absolute"
              insetInlineEnd="-140px"
              insetBlockEnd="-140px"
              w="360px"
              h="360px"
              bg="radial-gradient(65% 65% at 50% 50%, rgba(98,74,255,0.35) 0%, rgba(98,74,255,0) 85%)"
              filter="blur(22px)"
              pointerEvents="none"
              animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.1, 1] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
            />
          </>
        )}

        <Box
          w="full"
          bg="rgba(30, 30, 32, 0.75)"
          backdropFilter="blur(24px)"
          borderRadius="28px"
          border="1px solid rgba(255, 255, 255, 0.06)"
          boxShadow="0px 24px 80px rgba(0, 0, 0, 0.55)"
          p={{ base: 6, md: 8 }}
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={8}
          position="relative"
          overflow="hidden"
        >
          {!reduceMotion && (
            <MotionBox
              position="absolute"
              insetBlockStart="18%"
              insetInlineEnd="-120px"
              w="220px"
              h="220px"
              borderRadius="50%"
              border="1px solid rgba(255, 255, 255, 0.12)"
              opacity={0.2}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            />
          )}

          <VStack gap={3} textAlign="center" zIndex={1}>
            <Heading size="lg">Готовим твой трек</Heading>
            <Text fontSize="sm" color={COLOR.text.secondary} maxW="360px">
              Мы подбираем лучшие референсы и доводим аранжировку до идеального звучания. Сообщим, когда всё
              будет готово.
            </Text>
          </VStack>

          <Box position="relative" w={{ base: "220px", md: "240px" }} h={{ base: "220px", md: "240px" }}>
            {/* Центр — лапка */}
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              zIndex={2}
            >
              <Image
                src="/src/assets/img/paw.svg"
                alt="paw"
                boxSize={`${PAW_SIZE}px`}
                filter="drop-shadow(0px 12px 25px rgba(243, 146, 4, 0.35))"
              />
            </Box>

            {/* Кольцо + вращающаяся дуга */}
            <MotionSvg
              width="240"
              height="240"
              viewBox="0 0 200 200"
              style={{ overflow: "visible" }}
              aria-label="Загрузка трека"
            >
              <defs>
                {/* мягкое свечение для дуги */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3.2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* тёплый градиент штриха */}
                <linearGradient id="strokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={COLOR.kit.orange} />
                  <stop offset="100%" stopColor="#FBEBBB" />
                </linearGradient>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(243,146,4,0.25)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
                </linearGradient>
              </defs>

              {/* Базовое кольцо (приглушённое) */}
              <circle
                cx="100"
                cy="100"
                r={R}
                stroke="url(#ringGrad)"
                strokeOpacity="0.8"
                strokeWidth={Math.round(RING_SW * 0.28)} // чуть тоньше, чтобы дуга визуально «вела»
                fill="none"
              />

              {/* Вращающаяся яркая дуга */}
              <MotionGroup
                style={{ originX: 0.5, originY: 0.5 }}
                animate={reduceMotion ? {} : { rotate: 360 }}
                transition={
                  reduceMotion ? {} : { duration: 1.6, repeat: Infinity, ease: "linear" }
                }
                filter="url(#glow)"
              >
                <circle
                  cx="100"
                  cy="100"
                  r={R}
                  stroke="url(#strokeGrad)"
                  strokeWidth={ARC_SW * 0.35}
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={`${DASH} ${GAP}`} // ~ одна дуга ~30% окружности
                  strokeDashoffset="0"
                />
              </MotionGroup>

              {/* Боковые волны — статичные по форме, мягко «дышат» прозрачностью */}
              <g strokeLinecap="round" fill="none">
                {/* LEFT */}
                <MotionPath
                  d="M34 76 C22 90, 22 110, 34 124" // ближняя к кольцу
                  stroke={COLOR.kit.orange}
                  strokeWidth={8}
                  strokeOpacity="0.5"
                  animate={reduceMotion ? { opacity: 0.35 } : { opacity: [0.2, 0.7, 0.2] }}
                  transition={
                    reduceMotion ? {} : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                  }
                />
                <MotionPath
                  d="M20 70 C8 90, 8 110, 20 130" // дальняя
                  stroke={COLOR.kit.orange}
                  strokeWidth={7}
                  strokeOpacity="0.25"
                  animate={reduceMotion ? { opacity: 0.2 } : { opacity: [0.12, 0.45, 0.12] }}
                  transition={
                    reduceMotion
                      ? {}
                      : { duration: 2.1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }
                  }
                />

                {/* RIGHT (противофаза) */}
                <MotionPath
                  d="M166 76 C178 90, 178 110, 166 124"
                  stroke={COLOR.kit.orange}
                  strokeWidth={8}
                  strokeOpacity="0.5"
                  animate={reduceMotion ? { opacity: 0.35 } : { opacity: [0.7, 0.2, 0.7] }}
                  transition={
                    reduceMotion ? {} : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                  }
                />
                <MotionPath
                  d="M180 70 C192 90, 192 110, 180 130"
                  stroke={COLOR.kit.orange}
                  strokeWidth={7}
                  strokeOpacity="0.25"
                  animate={reduceMotion ? { opacity: 0.2 } : { opacity: [0.45, 0.12, 0.45] }}
                  transition={
                    reduceMotion
                      ? {}
                      : { duration: 2.1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }
                  }
                />
              </g>
            </MotionSvg>
          </Box>

          <VStack w="full" gap={5} zIndex={1}>
            {steps.map((step) => (
              <Flex
                key={step.title}
                w="full"
                align="flex-start"
                gap={3}
                p={4}
                borderRadius="20px"
                bg="rgba(255, 255, 255, 0.04)"
                border="1px solid rgba(255, 255, 255, 0.05)"
              >
                <Box
                  w="12px"
                  h="12px"
                  borderRadius="full"
                  bgGradient="linear(to-br, rgba(243,146,4,1), rgba(255,186,107,1))"
                  mt={1.5}
                  flexShrink={0}
                />
                <VStack align="flex-start" gap={1}>
                  <Text fontWeight="semibold" fontSize="sm">
                    {step.title}
                  </Text>
                  <Text color={COLOR.text.secondary} fontSize="sm">
                    {step.description}
                  </Text>
                </VStack>
              </Flex>
            ))}
          </VStack>

          <VStack gap={1} zIndex={1} textAlign="center">
            <Text fontSize="sm" color={COLOR.kit.orange}>
              Можно смело закрывать экран
            </Text>
            <Text fontSize="xs" color={COLOR.text.muted}>
              Мы напишем в Telegram, как только трек появится в библиотеке
            </Text>
          </VStack>
        </Box>
      </Box>
    </VStack>
  );
};
