// TrackLoadingScreen.tsx
import { Box, Center, Flex, Heading, Icon, Text, VStack } from "@chakra-ui/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FaCircleCheck, FaRegCircleCheck } from "react-icons/fa6";
import { COLOR } from "../../../components/ui/colors";
import { BrandButton, GrayButton } from "../../ui/custom-button";
import { TbExternalLink } from "react-icons/tb";
import { useNavigate } from "@tanstack/react-router";
import { BsMusicNote } from "react-icons/bs";

const MotionFlex = motion(Flex);

type StepDisplay = {
  stepIndex: number;
  iteration: number;
};

type StepStatus = "completed" | "current" | "upcoming";

export const TrackLoadingScreen = () => {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
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

    // Increased interval delay to 3500ms
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
    }, 3500); // Changed from 3200 to 3500

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
      w="100vw"
      h="100dvh"
      position="fixed"
      left={0}
      right={0}
      overflow={"hidden"}
      color={COLOR.kit.white}
      align="stretch"
    >
      <Box position="relative" w="full" overflow={"hidden"} rounded={"24px"}>


        <Box
          w="full"
          p={{ base: 6, md: 8 }}
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={8}
          position="relative"
          overflow="hidden"
          borderRadius="24px"
        >
          <VStack gap={3} textAlign="center" zIndex={1}>
            <Heading size="lg">Готовим твой трек</Heading>
            <Text fontSize="sm" color={COLOR.text.secondary} maxW="340px">
              Система собирает референсы, строит аранжировку и готовит мастеринг.
            </Text>
          </VStack>

          <VStack w="full" gap={3} zIndex={1} overflow="hidden" minH="156px">
            <AnimatePresence initial={false} mode="popLayout">
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
                    // Increased duration for a smoother transition
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} // Changed from 0.45 to 0.6
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
      <Center flexDirection="column" gap={4}>
          <BrandButton w="300px" onClick={() => navigate({ to: "/profile" })}>
            К трекам <Icon as={BsMusicNote} size={"sm"} />
          </BrandButton>
          <GrayButton w="300px" onClick={() => window.open("https://nika--art.ru?dog&tg")}>
            Хочу портрет <Icon as={TbExternalLink} size={"sm"} />
          </GrayButton>
      </Center>
    </VStack>
  );
};