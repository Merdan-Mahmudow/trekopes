import { VStack, Heading, Textarea, Button, Flex, Text } from "@chakra-ui/react";
import { useStore } from "@tanstack/react-store";
import store from "@/store";
import { setExtras, setFlowStep } from "@/store/photo-song";

export const StepExtras = () => {
  const { extras } = useStore(store, (state) => state.photoSong);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExtras({ text: e.target.value });
  };

  return (
    <VStack spacing={4} w="full" align="flex-start">
      <Heading>Что хотите добавить в трек?</Heading>
      <Textarea
        value={extras.text}
        onChange={handleTextChange}
        placeholder="Имена, повод, эмоции, ключевые слова — по желанию"
        minH="120px"
        maxLength={200}
      />
      <Text color="gray.500" fontSize="sm">
        Можно пропустить — это поможет точнее настроить текст и настроение.
      </Text>
      <Flex w="full" justify="space-between" mt={4}>
        <Button onClick={() => setFlowStep("photo")}>Назад</Button>
        <Button onClick={() => setFlowStep("style")}>
          {extras.text ? "Далее" : "Пропустить"}
        </Button>
      </Flex>
    </VStack>
  );
};
