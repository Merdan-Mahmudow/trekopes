import { VStack, Heading, Box, Button, Flex, Text } from "@chakra-ui/react";
import { useStore } from "@tanstack/react-store";
import store from "@/store";
import { setFlowStep } from "@/store/photo-song";

export const ResultScreen = () => {
  const { photoData } = useStore(store, (state) => state.photoSong);

  return (
    <VStack spacing={8} w="full" h="full" justify="center">
      <Heading>Ваш трек готов!</Heading>
      <Box
        w="300px"
        h="300px"
        bgImage={`url(${photoData?.dataUrl})`}
        bgSize="cover"
        bgPos="center"
        borderRadius="lg"
      />
      {/* Mock player */}
      <VStack w="full">
        <Flex w="80%" justify="space-between">
          <Text>0:00</Text>
          <Text>0:30</Text>
        </Flex>
        <Box w="80%" h="4px" bg="gray.600" borderRadius="full" />
        <Button mt={4}>Play</Button>
      </VStack>

      <Flex w="full" justify="space-around">
        <Button>Сохранить</Button>
        <Button>Поделиться</Button>
        <Button onClick={() => setFlowStep("photo")}>Ещё один</Button>
      </Flex>
    </VStack>
  );
};
