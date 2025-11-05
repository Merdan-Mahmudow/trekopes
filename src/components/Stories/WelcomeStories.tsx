import { Box } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StoryPagination } from "./StoryPagination";
import { StorySlide, type StoryItem } from "./StorySlide";

interface WelcomeStoriesProps {
  stories: StoryItem[];
  onFinish?: () => void;
  durationMsPerSlide?: number; // по умолчанию 4000мс
  autoPlay?: boolean; // по умолчанию true
}

export function WelcomeStories({ stories, onFinish, durationMsPerSlide = 15000, autoPlay = true }: WelcomeStoriesProps) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1
  const timerRef = useRef<number | null>(null);

  const total = stories.length;
  const current = useMemo(() => stories[index], [stories, index]);

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const goNext = useCallback(() => {
    clearTimer();
    if (index < total - 1) {
      setIndex((v) => v + 1);
      setProgress(0);
    } else {
      onFinish?.();
    }
  }, [index, total, onFinish]);

  const goPrev = useCallback(() => {
    clearTimer();
    if (index > 0) {
      setIndex((v) => v - 1);
      setProgress(0);
    }
  }, [index]);

  useEffect(() => {
    if (!autoPlay) return;
    setProgress(0);
    const stepMs = 50; // шаг отрисовки прогресса
    const totalSteps = Math.max(1, Math.floor(durationMsPerSlide / stepMs));
    let step = 0;
    timerRef.current = window.setInterval(() => {
      step += 1;
      const p = step / totalSteps;
      if (p >= 1) {
        setProgress(1);
        clearTimer();
        // небольшой лаг, чтобы прогресс дорисовался
        setTimeout(goNext, 80);
      } else {
        setProgress(p);
      }
    }, stepMs) as unknown as number;
    return clearTimer;
  }, [index, autoPlay, durationMsPerSlide, goNext]);

  // кликовые зоны 50/50 поверх контента
  return (
    <Box position="relative" w="100vw" h="100vh" bg="black" color="white" overflow="hidden">
      <StoryPagination total={total} activeIndex={index} progress={progress} />

      <StorySlide key={current?.id} item={current} isActive={true} />

      {/* Навигация: левая/правая половины */}
      <Box
        position="absolute"
        inset="0"
        display="flex"
        zIndex={3}
      >
        <Box flex={1} onClick={goPrev} />
        <Box flex={1} onClick={goNext} />
      </Box>
    </Box>
  );
}


