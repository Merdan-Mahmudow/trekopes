import { VStack, Heading, Progress, Text, Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { setFlowStep, decreaseBalance } from "@/store/photo-song";

const steps = ["Анализ фото", "Описание", "Текст", "Вокал", "Мастеринг"];

export const ProgressOverlay = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    decreaseBalance();

    const simulateProgress = () => {
      if (currentStepIndex < steps.length) {
        const duration = Math.random() * 1300 + 1200; // 1.2s to 2.5s
        setTimeout(() => {
          setCurrentStepIndex(currentStepIndex + 1);
          setProgress(((currentStepIndex + 1) / steps.length) * 100);
        }, duration);
      } else {
        const isError = Math.random() < 0.05;
        setFlowStep(isError ? "error" : "result");
      }
    };

    simulateProgress();
  }, [currentStepIndex]);

  return (
    <Box position="absolute" top="0" left="0" w="full" h="full" bg="rgba(0,0,0,0.8)" zIndex={10}>
      <VStack spacing={4} w="full" h="full" justify="center">
        <Heading>{steps[currentStepIndex] || "Завершение"}</Heading>
        <Progress value={progress} w="80%" />
        <Text>{Math.round(progress)}%</Text>
      </VStack>
    </Box>
  );
};
