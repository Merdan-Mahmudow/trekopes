// TrackLoadingScreen.tsx
import { VStack, Text, Box, Image } from "@chakra-ui/react";
import { motion, useReducedMotion } from "framer-motion";
import { COLOR } from "../../../components/ui/colors";

const MotionSvg = motion.svg;
const MotionGroup = motion.g;
const MotionPath = motion.path;

export const TrackLoadingScreen = () => {
  const reduceMotion = useReducedMotion();

  // --- Нормализованные размеры под viewBox 200x200 ---
  const R_OUT = 92;                // внешний радиус кольца
  const RING_SW = 33;              // толщина базового кольца (по скрину ~26px → масштаб до ~33px)
  const R = R_OUT - RING_SW / 2;   // центральный радиус штриха
  const ARC_SW = RING_SW;          // дугу делаем той же толщины
  const CIRC = 2 * Math.PI * R;
  const DASH = Math.round(0.29 * CIRC); // ~28–30% окружности
  const GAP = Math.round(2 * CIRC);     // большой gap, чтобы была одна дуга

  // Размер лапки ≈ 0.82 от внутреннего диаметра (визуально аккуратнее, чем 0.92)
  const INNER_DIAM = 2 * (R_OUT - RING_SW);
  const PAW_SIZE = Math.round(0.82 * INNER_DIAM); // ≈ 98px

  return (
    <VStack gap={4} w="full" color="white">
      <Box
        w="full"
        bg={COLOR.kit.darkGray}
        borderRadius="24px"
        p={6}
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={4}
      >
        <Text fontSize="lg" fontWeight="bold" color={COLOR.kit.orange}>
          Готовим твой трек
        </Text>
        <Text fontSize="sm" color="#8A8A8A" textAlign="center">
          Я напишу в телеграм, когда всё будет готово
        </Text>

        <Box position="relative" w="200px" h="200px">
          {/* Центр — лапка */}
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            zIndex={1}
          >
            <Image
              src="/src/assets/img/paw.svg"
              alt="paw"
              boxSize={`${PAW_SIZE}px`}
            />
          </Box>

          {/* Кольцо + вращающаяся дуга */}
          <MotionSvg
            width="200"
            height="200"
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
            </defs>

            {/* Базовое кольцо (приглушённое) */}
            <circle
              cx="100"
              cy="100"
              r={R}
              stroke="#5A3A12"
              strokeOpacity="0.50"
              strokeWidth={Math.round(RING_SW * 0.3)}  // чуть тоньше, чтобы дуга визуально «вела»
              fill="none"
            />

            {/* Вращающаяся яркая дуга */}
            <MotionGroup
              style={{ originX: 0.5, originY: 0.5 }}
              animate={reduceMotion ? {} : { rotate: 360 }}
              transition={
                reduceMotion
                  ? {}
                  : { duration: 1.6, repeat: Infinity, ease: "linear" }
              }
              filter="url(#glow)"
            >
              <circle
                cx="100"
                cy="100"
                r={R}
                stroke="url(#strokeGrad)"
                strokeWidth={ARC_SW * 0.3}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${DASH} ${GAP}`}      // ~ одна дуга ~30% окружности
                strokeDashoffset="0"
              />
            </MotionGroup>

            {/* Боковые волны — статичные по форме, мягко «дышат» прозрачностью */}
            <g strokeLinecap="round" fill="none">
              {/* LEFT */}
              <MotionPath
                d="M34 76 C22 90, 22 110, 34 124"   // ближняя к кольцу
                stroke={COLOR.kit.orange}
                strokeWidth={10}
                strokeOpacity="0.65"
                animate={reduceMotion ? { opacity: 0.45 } : { opacity: [0.25, 0.8, 0.25] }}
                transition={reduceMotion ? {} : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
              <MotionPath
                d="M20 70 C8 90, 8 110, 20 130"     // дальняя
                stroke={COLOR.kit.orange}
                strokeWidth={10}
                strokeOpacity="0.35"
                animate={reduceMotion ? { opacity: 0.25 } : { opacity: [0.15, 0.55, 0.15] }}
                transition={reduceMotion ? {} : { duration: 2.1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              />

              {/* RIGHT (противофаза) */}
              <MotionPath
                d="M166 76 C178 90, 178 110, 166 124"
                stroke={COLOR.kit.orange}
                strokeWidth={10}
                strokeOpacity="0.65"
                animate={reduceMotion ? { opacity: 0.45 } : { opacity: [0.8, 0.25, 0.8] }}
                transition={reduceMotion ? {} : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
              <MotionPath
                d="M180 70 C192 90, 192 110, 180 130"
                stroke={COLOR.kit.orange}
                strokeWidth={10}
                strokeOpacity="0.35"
                animate={reduceMotion ? { opacity: 0.25 } : { opacity: [0.55, 0.15, 0.55] }}
                transition={reduceMotion ? {} : { duration: 2.1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              />
            </g>
          </MotionSvg>
        </Box>

        <Text fontSize="xs" color="#6B7280" textAlign="center">
          Можно закрывать экран — я уже работаю
        </Text>
      </Box>
    </VStack>
  );
};
