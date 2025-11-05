import { Center, Image, Text, VStack, Box } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import type React from "react";

export interface StoryItem {
  id: string | number;
  image?: string;
  text?: string;
  content?: React.ReactNode;
}

interface StorySlideProps {
  item: StoryItem;
  isActive: boolean;
}

const MotionBox = motion.create(Box);

export function StorySlide({ item, isActive }: StorySlideProps) {
  return (
    <Center w="100vw" h="100vh">
      <AnimatePresence mode="wait">
        {isActive && (
          <MotionBox
            key={item.id}
            w="full"
            h="full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Center w="full" h="full">
              <VStack gap={4} maxW="90vw" textAlign="center">
                {item.image && (
                  <Image src={item.image} alt="story" maxH="50vh" objectFit="contain" />
                )}
                {item.text && (
                  <Text fontSize={{ base: "lg", md: "xl" }} color="white">
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


