// TrackLoadingScreen.tsx
import { Box, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FaCircleCheck, FaRegCircleCheck } from "react-icons/fa6";
import { COLOR } from "../../../components/ui/colors";

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

type StepDisplay = {
  stepIndex: number;
  iteration: number;
};

type StepStatus = "completed" | "current" | "upcoming";

export const TrackLoadingScreen = () => {
  const reduceMotion = useReducedMotion();

  const steps = [
    { title: "Анализируем идею" },
    { title: "Готовим аранжировку" },
    { title: "Выводим мастер" },
  ];

  const stepsCount = steps.length;
  const iterationRef = useRef(0);

  const createInitialQueue = () => {
    if (stepsCount === 0) {
      return [] as StepDisplay[];
    }

    if (stepsCount === 1) {
      return [{ stepIndex: 0, iteration: 0 }];
    }

    const prevIndex = stepsCount - 1;
    const nextIndex = (0 + 1) % stepsCount;

    return [
      { stepIndex: prevIndex, iteration: 0 },
      { stepIndex: 0, iteration: 0 },
      { stepIndex: nextIndex, iteration: 0 },
    ];
  };

  const [visibleSteps, setVisibleSteps] = useState<StepDisplay[]>(createInitialQueue);

  useEffect(() => {
    if (reduceMotion || stepsCount <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setVisibleSteps((prev) => {
        if (prev.length === 0) {
          return prev;
        }

        const last = prev[prev.length - 1];
        const nextStepIndex = (last.stepIndex + 1) % stepsCount;

        if (nextStepIndex === 0) {
          iterationRef.current += 1;
        }

        const nextEntry: StepDisplay = {
          stepIndex: nextStepIndex,
          iteration: iterationRef.current,
        };

        const updated = [...prev];
        if (updated.length === 1) {
          return updated;
        }

        updated.shift();
        updated.push(nextEntry);

        return updated;
      });
    }, 3200);

    return () => window.clearInterval(interval);
  }, [reduceMotion, stepsCount]);

  useEffect(() => {
    iterationRef.current = 0;
    setVisibleSteps(createInitialQueue());
  }, [stepsCount]);

  const getStatusByPosition = (position: number): StepStatus => {
    if (visibleSteps.length <= 1) {
      return "current";
    }

    if (position === 0) {
      return "completed";
    }

    if (position === 1) {
      return "current";
    }

    return "upcoming";
  };

  const renderStepIcon = (status: StepStatus) => {
    if (status === "upcoming") {
      return <FaRegCircleCheck size={20} color="rgba(255, 255, 255, 0.35)" />;
    }

    return <FaCircleCheck size={20} color={COLOR.kit.orange} />;
  };

  const getTitleSize = (status: StepStatus) => {
    if (status === "current") {
      return "md";
    }
    return "sm";
  };

  const getTitleOpacity = (status: StepStatus) => {
    if (status === "current") {
      return 1;
    }
    if (status === "completed") {
      return 0.55;
    }
    return 0.4;
  };

  return (
    <VStack
      gap={6}
      w="full"
      overflow={"hidden"}
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
              insetBlockStart="-140px"
              w="280px"
              h="280px"
              bg="radial-gradient(70% 70% at 50% 50%, rgba(243,146,4,0.4) 0%, rgba(243,146,4,0) 90%)"
              filter="blur(18px)"
              pointerEvents="none"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.35, 0.55, 0.35], scale: [0.9, 1.05, 0.9] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <MotionBox
              position="absolute"
              insetInlineEnd="-120px"
              insetBlockEnd="-140px"
              w="300px"
              h="300px"
              bg="radial-gradient(65% 65% at 50% 50%, rgba(98,74,255,0.35) 0%, rgba(98,74,255,0) 85%)"
              filter="blur(20px)"
              pointerEvents="none"
              initial={{ opacity: 0.25 }}
              animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.1, 1] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
            />
          </>
        )}

        <Box
          w="full"
          backdropFilter="blur(24px)"
          p={{ base: 6, md: 8 }}
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={8}
          position="relative"
          overflow="hidden"
          borderRadius="24px"
          border="1px solid rgba(255, 255, 255, 0.06)"
          bg="rgba(18, 18, 20, 0.75)"
        >
          <VStack gap={3} textAlign="center" zIndex={1}>
            <Heading size="lg">Готовим твой трек</Heading>
            <Text fontSize="sm" color={COLOR.text.secondary} maxW="340px">
              Система собирает референсы, строит аранжировку и готовит мастеринг.
            </Text>
          </VStack>

          <VStack w="full" gap={3} zIndex={1} overflow="hidden" minH="156px">
            <AnimatePresence initial={false}>
              {visibleSteps.map((entry, position) => {
                const step = steps[entry.stepIndex];
                const status = getStatusByPosition(position);
                const key = `${entry.stepIndex}-${entry.iteration}`;

                return (
                  <MotionFlex
                    key={key}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    w="full"
                    align="center"
                    justify="center"
                    gap={4}
                    px={4}
                    py={3}


                  >
                    {renderStepIcon(status)}
                    <Text
                      fontWeight={status === "current" ? "semibold" : "medium"}
                      fontSize={getTitleSize(status)}
                      opacity={getTitleOpacity(status)}
                      color={COLOR.kit.white}
                    >
                      {step.title}
                    </Text>
                  </MotionFlex>
                );
              })}
            </AnimatePresence>
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
