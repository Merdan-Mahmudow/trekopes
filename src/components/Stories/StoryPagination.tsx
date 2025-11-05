import { HStack, Box } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { COLOR } from "../ui/colors";

const MotionBox = motion.create(Box);

interface StoryPaginationProps {
  total: number;
  activeIndex: number;
  progress: number; // 0..1
}

export function StoryPagination({ total, activeIndex, progress }: StoryPaginationProps) {
  return (
    <HStack
      position="absolute"
      top={{ base: 3, md: 5 }}
      left="50%"
      transform="translateX(-50%)"
      spacing={2}
      w="92vw"
      zIndex={2}
    >
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === activeIndex;
        return (
          <Box
            key={i}
            flex={1}
            h={{ base: 1, md: 1.5 }}
            bg={COLOR.kit.darkGray}
            borderRadius="full"
            overflow="hidden"
          >
            {isActive && (
              <MotionBox
                h="full"
                bg={COLOR.kit.primary}
                initial={{ width: "0%" }}
                animate={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
                transition={{ duration: 0.05, ease: "linear" }}
              />
            )}
            {!isActive && i < activeIndex && (
              <Box h="full" bg={COLOR.kit.primary} w="100%" />
            )}
          </Box>
        );
      })}
    </HStack>
  );
}


