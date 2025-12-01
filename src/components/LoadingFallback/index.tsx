import { Spinner, Flex, Text } from "@chakra-ui/react";
import { COLOR } from "../ui/colors";

interface LoadingFallbackProps {
  message?: string;
}

export function LoadingFallback({ message = "Загрузка..." }: LoadingFallbackProps) {
  return (
    <Flex
      justify="center"
      align="center"
      minH="200px"
      direction="column"
      gap={4}
    >
      <Spinner size="xl" color={COLOR.kit.orange} borderWidth="3px" />
      {message && (
        <Text fontSize="sm" color="gray.500">
          {message}
        </Text>
      )}
    </Flex>
  );
}


