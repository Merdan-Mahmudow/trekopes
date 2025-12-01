import { Center, Image, Text, VStack, Box } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import type React from "react";
import { useEffect, useRef, useState } from "react";

export interface StoryItem {
  id: string | number;
  image?: string;
  text?: string;
  video?: string;
  content?: React.ReactNode;
}

interface StorySlideProps {
  item: StoryItem;
  isActive: boolean;
  onVideoLoaded?: () => void;
  waitForVideo?: boolean;
}

const MotionBox = motion.create(Box);

export function StorySlide({ item, isActive, onVideoLoaded, waitForVideo = false }: StorySlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(!waitForVideo || !item.video);

  useEffect(() => {
    if (!item.video || !waitForVideo) {
      setIsVideoReady(true);
      if (!item.video && onVideoLoaded) {
        onVideoLoaded();
      }
      return;
    }

    const video = videoRef.current;
    if (!video) {
      // Если элемент еще не создан, проверяем через небольшую задержку
      const timeoutId = setTimeout(() => {
        const videoElement = videoRef.current;
        if (videoElement && videoElement.readyState >= 3) {
          setIsVideoReady(true);
          onVideoLoaded?.();
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }

    const handleCanPlay = () => {
      setIsVideoReady(true);
      onVideoLoaded?.();
    };

    const handleLoadedData = () => {
      setIsVideoReady(true);
      onVideoLoaded?.();
    };

    const handleLoadedMetadata = () => {
      // Метаданные загружены, можно начинать показ
      setIsVideoReady(true);
      onVideoLoaded?.();
    };

    const handleError = () => {
      // Если видео не загрузилось, все равно показываем контент
      setIsVideoReady(true);
      onVideoLoaded?.();
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('canplaythrough', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);

    // Если видео уже загружено (readyState >= HAVE_FUTURE_DATA)
    if (video.readyState >= 3) {
      setIsVideoReady(true);
      onVideoLoaded?.();
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('canplaythrough', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
    };
  }, [item.video, waitForVideo, onVideoLoaded]);

  return (
    <Center w="100vw" h="100vh" position="relative">
      <AnimatePresence mode="wait">
        {isActive && (
          <MotionBox
            key={item.id}
            w="full"
            h="full"
            position="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {/* Видео на весь экран */}
            {item.video && (
              <Box
                position="absolute"
                top={0}
                left={0}
                w="100%"
                h="100%"
                zIndex={1}
                overflow="hidden"
              >
                <video
                  ref={videoRef}
                  src={item.video}
                  autoPlay
                  loop
                  playsInline
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: isVideoReady ? 1 : 0,
                  }}
                />
              </Box>
            )}
            
            {/* Изображение (если нет видео) */}
            {!item.video && item.image && (
              <Image
                src={item.image}
                alt="story"
                position="absolute"
                top={0}
                left={0}
                w="100%"
                h="100%"
                objectFit="cover"
                zIndex={1}
              />
            )}
            
            {/* Текст поверх видео/изображения */}
            <Center
              w="full"
              h="full"
              position="relative"
              zIndex={2}
            >
              <VStack gap={4} maxW="90vw" textAlign="center">
                {item.text && (
                  <Text
                    fontSize={{ base: "lg", md: "xl" }}
                    color="white"
                    textShadow="0 2px 8px rgba(0,0,0,0.8)"
                    fontWeight="semibold"
                  >
                    {item.text}
                  </Text>
                )}
                {item.content}
              </VStack>
            </Center>
          </MotionBox>
        )}
      </AnimatePresence>
    </Center>
  );
}


