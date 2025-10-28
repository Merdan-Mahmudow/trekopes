import { Flex, Text } from "@chakra-ui/react";
import { useStore } from "@tanstack/react-store";
import store from "@/store";

export const BadgePaws = () => {
  const { balance } = useStore(store, (state) => state.photoSong);

  return (
    <Flex align="center" bg="gray.700" borderRadius="full" px={3} py={1}>
      <Text mr={2}>🐾</Text>
      <Text fontWeight="bold">{balance}</Text>
    </Flex>
  );
};
