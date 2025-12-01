import { Box } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StoryPagination } from "./StoryPagination";
import { StorySlide, type StoryItem } from "./StorySlide";

interface WelcomeStoriesProps {
  stories: StoryItem[];
  onFinish?: () => void;
  durationMsPerSlide?: number; // по умолчанию 4000мс
  autoPlay?: boolean; // по умолчанию true
  waitForVideo?: boolean; // ждать загрузки видео перед показом
  onVideoReady?: () => void; // колбэк когда видео готово к показу
}

export function WelcomeStories({ stories, onFinish, durationMsPerSlide = 15000, autoPlay = true, waitForVideo = false, onVideoReady }: WelcomeStoriesProps) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1
  const [isVideoLoaded, setIsVideoLoaded] = useState(!waitForVideo);
  const timerRef = useRef<number | null>(null);
  const videoReadyCalledRef = useRef(false);
  const preloadVideoRef = useRef<HTMLVideoElement | null>(null);

  const total = stories.length;
  const current = useMemo(() => stories[index], [stories, index]);
  const currentHasVideo = Boolean(current?.video);
  
  // Находим видео в stories для предзагрузки
  const videoStory = useMemo(() => stories.find(s => s.video), [stories]);

  const handleVideoLoaded = useCallback(() => {
    setIsVideoLoaded(true);
    // Вызываем onVideoReady только один раз при первой загрузке видео
    if (waitForVideo && !videoReadyCalledRef.current) {
      videoReadyCalledRef.current = true;
      onVideoReady?.();
    }
  }, [waitForVideo, onVideoReady]);

  // Предзагрузка видео для первого входа
  useEffect(() => {
    if (!waitForVideo || !videoStory?.video) return;

    const video = document.createElement('video');
    video.src = videoStory.video;
    video.preload = 'auto';
    video.style.display = 'none';
    document.body.appendChild(video);
    preloadVideoRef.current = video;

    const handleCanPlay = () => {
      if (waitForVideo && !videoReadyCalledRef.current) {
        videoReadyCalledRef.current = true;
        setIsVideoLoaded(true);
        onVideoReady?.();
      }
    };

    const handleLoadedData = () => {
      if (waitForVideo && !videoReadyCalledRef.current) {
        videoReadyCalledRef.current = true;
        setIsVideoLoaded(true);
        onVideoReady?.();
      }
    };

    const handleError = () => {
      // Если видео не загрузилось, все равно показываем контент
      if (waitForVideo && !videoReadyCalledRef.current) {
        videoReadyCalledRef.current = true;
        setIsVideoLoaded(true);
        onVideoReady?.();
      }
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    // Если видео уже загружено
    if (video.readyState >= 3) {
      handleCanPlay();
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      if (video.parentNode) {
        video.parentNode.removeChild(video);
      }
    };
  }, [waitForVideo, videoStory, onVideoReady]);

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

  // Сбрасываем состояние загрузки видео при смене слайда (только для внутреннего состояния)
  // onVideoReady вызывается только один раз при первой загрузке
  useEffect(() => {
    if (waitForVideo && currentHasVideo) {
      setIsVideoLoaded(false);
    } else {
      setIsVideoLoaded(true);
      // Если нет видео на текущем слайде и мы еще не вызвали onVideoReady,
      // вызываем его (для случая когда видео на другом слайде)
      if (waitForVideo && !videoReadyCalledRef.current) {
        // Не вызываем onVideoReady здесь, так как нужно дождаться загрузки видео
        // Это обработается в handleVideoLoaded когда дойдем до слайда с видео
      }
    }
  }, [index, waitForVideo, currentHasVideo]);

  useEffect(() => {
    if (!autoPlay || (waitForVideo && currentHasVideo && !isVideoLoaded)) return;
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
  }, [index, autoPlay, durationMsPerSlide, goNext, waitForVideo, currentHasVideo, isVideoLoaded]);

  // кликовые зоны 50/50 поверх контента
  return (
    <Box position="relative" w="100vw" h="100vh" bg="black" color="white" overflow="hidden">
      <StoryPagination total={total} activeIndex={index} progress={progress} />

      <StorySlide 
        key={current?.id} 
        item={current} 
        isActive={true} 
        waitForVideo={waitForVideo && currentHasVideo}
        onVideoLoaded={handleVideoLoaded}
      />

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


