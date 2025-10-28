import { VStack, Heading, Tabs, TabList, Tab, TabPanels, TabPanel, Input, SimpleGrid, Box, Text, Wrap, WrapItem, Slider, SliderTrack, SliderFilledTrack, SliderThumb } from "@chakra-ui/react";
import { useStore } from "@tanstack/react-store";
import store from "@/store";
import { setStyleMode, setSelectedArtist, setParamStyle } from "@/store/photo-song";
import artists from "@/mocks/artists.json";
import { Artist } from "@/types/photo-song";
import { useState, useMemo } from "react";
import { useDebounce } from "use-debounce";

const genres = ["rap", "pop", "rock", "indie", "edm"];
const moods = ["весёлое", "лиричное", "драйв"];
const voices = ["мужской", "женский", "нейтральный"];


import { Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from "@chakra-ui/react";
import { setFlowStep } from "@/store/photo-song";

export const StepStyle = () => {
  const {
    styleMode,
    selectedArtist,
    paramStyle,
    photoData,
    balance
  } = useStore(store, (state) => state.photoSong);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 250);
  const { isOpen, onOpen, onClose } = useDisclosure();


  const isArtistModeValid = styleMode === 'artist' && !!selectedArtist;
  const isParamsModeValid = styleMode === 'params' && (!!paramStyle.genre || !!paramStyle.mood || !!paramStyle.bpm || !!paramStyle.voice);
  const isGenerateDisabled = !photoData || (!isArtistModeValid && !isParamsModeValid) || balance < 1;

  const handleGenerateClick = () => {
    if (balance < 1) {
      onOpen();
    } else {
      setFlowStep('progress');
    }
  };

  const filteredArtists = useMemo(() => {
    return artists.filter(artist =>
      artist.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [debouncedSearchTerm]);

  return (
    <VStack spacing={4} w="full" align="flex-start">
      <Heading>Выберите стиль</Heading>
      <Tabs index={styleMode === 'artist' ? 0 : 1} onChange={(index) => setStyleMode(index === 0 ? 'artist' : 'params')}>
        <TabList>
          <Tab>По артистам</Tab>
          <Tab>По параметрам</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <VStack spacing={4}>
              <Input
                placeholder="Найти артиста"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SimpleGrid columns={3} spacing={4} w="full">
                {filteredArtists.map((artist: Artist) => (
                  <VStack
                    key={artist.id}
                    onClick={() => setSelectedArtist(artist)}
                    cursor="pointer"
                    border={selectedArtist?.id === artist.id ? "2px solid orange" : "2px solid transparent"}
                    borderRadius="full"
                    p={2}
                  >
                    <Box as="img" src={artist.avatarUrl} alt={artist.name} w="80px" h="80px" borderRadius="full" />
                    <Text>{artist.name}</Text>
                  </VStack>
                ))}
              </SimpleGrid>
            </VStack>
          </TabPanel>
          <TabPanel>
            <VStack spacing={4} align="flex-start">
              <Text>Жанр</Text>
              <Wrap>
                {genres.map(genre => (
                  <WrapItem key={genre}>
                    <Box
                      as="button"
                      px={3} py={1}
                      borderRadius="full"
                      bg={paramStyle.genre === genre ? "orange.500" : "gray.700"}
                      onClick={() => setParamStyle({ ...paramStyle, genre })}
                    >
                      {genre}
                    </Box>
                  </WrapItem>
                ))}
              </Wrap>

              <Text>Настроение</Text>
              <Wrap>
                {moods.map(mood => (
                  <WrapItem key={mood}>
                    <Box
                      as="button"
                      px={3} py={1}
                      borderRadius="full"
                      bg={paramStyle.mood === mood ? "orange.500" : "gray.700"}
                      onClick={() => setParamStyle({ ...paramStyle, mood })}
                    >
                      {mood}
                    </Box>
                  </WrapItem>
                ))}
              </Wrap>

              <Text>Голос</Text>
              <Wrap>
                {voices.map(voice => (
                  <WrapItem key={voice}>
                    <Box
                      as="button"
                      px={3} py={1}
                      borderRadius="full"
                      bg={paramStyle.voice === voice ? "orange.500" : "gray.700"}
                      onClick={() => setParamStyle({ ...paramStyle, voice: voice as any })}
                    >
                      {voice}
                    </Box>
                  </WrapItem>
                ))}
              </Wrap>

              <Text>Темп</Text>
              <Slider
                defaultValue={120}
                min={60}
                max={180}
                step={5}
                onChangeEnd={(val) => setParamStyle({ ...paramStyle, bpm: val })}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
      <Button
        size="lg"
        w="full"
        mt={8}
        isDisabled={isGenerateDisabled}
        onClick={handleGenerateClick}
      >
        Сгенерировать - 1 🐾
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Не хватает лапок</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Пополните баланс, чтобы продолжить.</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Закрыть
            </Button>
            <Button variant="ghost">Пополнить</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};
