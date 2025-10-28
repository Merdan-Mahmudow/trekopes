import { Box, Text, VStack, Input, Icon, Flex, Grid, GridItem, Button, Slider } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { FaPaw } from 'react-icons/fa';
import { COLOR } from "../../ui/colors";
import { BrandButton, GrayButton } from "../../ui/button";

type Artist = {
    id: string;
    name: string;
    avatar: string;
};

export type GenerationParams = {
    tempo: number;
    mood: string;
    style: string;
    voice: 'male' | 'female' | 'both';
};

type ArtistParamsProps = {
    onBack: () => void;
    onCancel: () => void;
    onGenerate: (data: { artist: Artist | null, params: GenerationParams }) => void;
};



export function ArtistParams({ onBack, onCancel, onGenerate }: ArtistParamsProps) {
    const [tempo, setTempo] = useState(105);
    const [activeTab, setActiveTab] = useState<"mode" | "params">("mode");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationParams, setGenerationParams] = useState<GenerationParams>({
        tempo: 105,
        mood: "happy",
        style: "pop",
        voice: 'both'
    });
    const TEMPO_COLORS = {
        slow: (generationParams.tempo >= 60  && generationParams.tempo <= 90) ? COLOR.kit.orange : COLOR.kit.smoke,
        medium: (generationParams.tempo >= 91 && generationParams.tempo <= 120) ? COLOR.kit.orange : COLOR.kit.smoke,
        fast: (generationParams.tempo >= 121 && generationParams.tempo <= 180) ? COLOR.kit.orange : COLOR.kit.smoke,
    }
    const artists: Artist[] = useMemo(() => ([
        { id: "1", name: "Мияги", avatar: "👨‍🎤" },
        { id: "2", name: "Скриптонит", avatar: "🎵" },       
        { id: "3", name: "Zivert", avatar: "🎶" },
        { id: "4", name: "Клава Кока", avatar: "🎤" },
        { id: "5", name: "ICEGERGERT", avatar: "🎸" },
        { id: "6", name: "Макс Корж", avatar: "🎹" },
        { id: "7", name: "Баста", avatar: "🎺" },
        { id: "8", name: "KSON", avatar: "🎻" },
    ]), []);

    const filteredArtists = useMemo(() => artists.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase())), [artists, searchQuery]);

    const handleParamsChange = (key: keyof GenerationParams, value: number | string) => {
        setGenerationParams(prev => ({ ...prev, [key]: value }));
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            await new Promise(r => setTimeout(r, 800));
            onGenerate({ artist: activeTab === "mode" ? selectedArtist : null, params: generationParams });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <VStack gap={4} w="full" color="white">
            <Box w="full" bg={COLOR.kit.darkGray} borderRadius="24px" p={6}>
                <Flex gap={4} mb={6}>
                    <Box
                        cursor="pointer"
                        onClick={() => setActiveTab("mode")}
                        borderBottom={activeTab === "mode" ? `2px solid ${COLOR.kit.orange}` : "2px solid transparent"}
                        pb={2}
                    >
                        <Text color={activeTab === "mode" ? COLOR.kit.orange : "#8A8A8A"} fontWeight={activeTab === "mode" ? "bold" : "normal"}>РЕЖИМ</Text>
                    </Box>
                    <Box
                        cursor="pointer"
                        onClick={() => setActiveTab("params")}
                        borderBottom={activeTab === "params" ? `2px solid ${COLOR.kit.orange}` : "2px solid transparent"}
                        pb={2}
                    >
                        <Text color={activeTab === "params" ? COLOR.kit.orange : "#8A8A8A"} fontWeight={activeTab === "params" ? "bold" : "normal"}>ПО ПАРАМЕТРАМ</Text>
                    </Box>
                </Flex>

                {activeTab === "mode" ? (
                    <VStack gap={4} w="full">
                        <Input
                            placeholder="Найти артиста"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            bg="#1E1E20"
                            borderColor="#2A2A2D"
                            borderRadius="16px"
                            color="white"
                            _placeholder={{ color: "#8A8A8A" }}
                            _focus={{ borderColor: COLOR.kit.orange, boxShadow: "0 0 0 1px #F59A0E" }}
                        />

                        <Grid templateColumns="repeat(4, 1fr)" gap={4} w="full">
                            {filteredArtists.map((artist) => (
                                <GridItem key={artist.id}>
                                    <VStack
                                        cursor="pointer"
                                        onClick={() => setSelectedArtist(artist)}
                                        p={3}
                                        borderRadius="16px"
                                        bg={selectedArtist?.id === artist.id ? COLOR.kit.orange : "#1E1E20"}
                                        _hover={{ bg: selectedArtist?.id === artist.id ? COLOR.kit.orange : "#2A2A2D" }}
                                        transition="all 0.2s"
                                    >
                                        <Box w="60px" h="60px" borderRadius="50%" bg={selectedArtist?.id === artist.id ? "white" : COLOR.kit.iconBg} display="flex" alignItems="center" justifyContent="center" fontSize="24px">
                                            {artist.avatar}
                                        </Box>
                                        <Text fontSize="xs" textAlign="center" color={selectedArtist?.id === artist.id ? "white" : "#8A8A8A"} fontWeight={selectedArtist?.id === artist.id ? "bold" : "normal"}>
                                            {artist.name}
                                        </Text>
                                    </VStack>
                                </GridItem>
                            ))}
                        </Grid>
                    </VStack>
                ) : (
                    <VStack gap={6} w="full">
                        <VStack key={"md"} align="flex-start" w="full">
                            <Text fontSize="sm" fontWeight="medium">Темп (BPM): {generationParams.tempo}</Text>
                            <Slider.Root
                                size={"md"}
                                value={[tempo]}
                                defaultValue={[105]}
                                width="full"
                                min={60}
                                max={180}
                                onValueChange={(value) => { handleParamsChange("tempo", value.value[0]); setTempo(value.value[0]) }}
                            >
                                <Slider.Control>
                                    <Slider.Track>
                                        <Slider.Range />
                                    </Slider.Track>
                                    <Slider.Thumbs />
                                </Slider.Control>
                            </Slider.Root>
                            <Flex gap={2} alignItems="center" justifyContent="space-between" w="275px" mt={2}>
                                <Text color={TEMPO_COLORS.slow} onClick={() => {handleParamsChange("tempo", 75); setTempo(75)}} fontSize="sm">Медленный</Text>
                                <Text color={TEMPO_COLORS.medium} onClick={() => { handleParamsChange("tempo", 105); setTempo(105) }} fontSize="sm">Средний</Text>
                                <Text color={TEMPO_COLORS.fast} onClick={() => { handleParamsChange("tempo", 135); setTempo(135) }} fontSize="sm">Быстрый</Text>
                            </Flex>

                        </VStack>

                        <VStack gap={3} w="full" align="start">
                            <Text fontSize="sm" fontWeight="medium">Настроение</Text>
                            <Grid templateColumns="repeat(2, 1fr)" gap={2} w="full">
                                {[
                                    { value: "happy", label: "Веселое" },
                                    { value: "sad", label: "Грустное" },
                                    { value: "energetic", label: "Энергичное" },
                                    { value: "calm", label: "Спокойное" },
                                    { value: "romantic", label: "Романтичное" }
                                ].map((mood) => (
                                    <Button rounded={"xl"} key={mood.value} size="md" onClick={() => handleParamsChange("mood", mood.value)} bg={generationParams.mood === mood.value ? COLOR.kit.orange : COLOR.kit.darkGray} color="white" fontSize="xs">{mood.label}</Button>
                                ))}
                            </Grid>
                        </VStack>

                        <VStack gap={3} w="full" align="start">
                            <Text fontSize="sm" fontWeight="medium">Стиль</Text>
                            <Grid templateColumns="repeat(2, 1fr)" gap={2} w="full">
                                {[
                                    { value: "pop", label: "Поп" },
                                    { value: "rock", label: "Рок" },
                                    { value: "hip-hop", label: "Хип-хоп" },
                                    { value: "electronic", label: "Электроника" },
                                    { value: "jazz", label: "Джаз" },
                                    { value: "classical", label: "Классика" }
                                ].map((style) => (
                                    <Button rounded={"xl"} key={style.value} size="md" onClick={() => handleParamsChange("style", style.value)} bg={generationParams.style === style.value ? COLOR.kit.orange : COLOR.kit.darkGray} color="white" fontSize="xs">{style.label}</Button>
                                ))}
                            </Grid>
                        </VStack>

                        <VStack gap={3} w="full" align="start">
                            <Text fontSize="sm" fontWeight="medium">Голос</Text>
                            <Grid templateColumns="repeat(3, 1fr)" gap={2} w="full">
                                {[
                                    { value: 'male', label: 'Мужской' },
                                    { value: 'female', label: 'Женский' },
                                    { value: 'both', label: 'Вместе' },
                                ].map((voice) => (
                                    <Button
                                        key={voice.value}
                                        size="md"
                                        rounded={"xl"}
                                        onClick={() => handleParamsChange("voice", voice.value)}
                                        bg={generationParams.voice === voice.value ? COLOR.kit.orange : COLOR.kit.darkGray}
                                        color="white"
                                        fontSize="xs"
                                    >
                                        {voice.label}
                                    </Button>
                                ))}
                            </Grid>
                        </VStack>
                    </VStack>
                )
                }

                <VStack gap={3} mt={6}>
                    <BrandButton onClick={handleGenerate} disabled={isGenerating || (activeTab === "mode" && !selectedArtist)} w="full">
                        <Flex alignItems="center" gap={2}>
                            <Text>Сгенерировать</Text>
                            <Flex alignItems="center" gap={1}>
                                <Text fontSize="md">-1</Text>
                                <Icon as={FaPaw} />
                            </Flex>
                        </Flex>
                    </BrandButton>
                </VStack>
            </Box >

            <Grid templateColumns="1fr 1fr" gap={3} w="full">
                <GrayButton onClick={onBack} disabled={isGenerating} w="full">Назад</GrayButton>
                <GrayButton onClick={onCancel} disabled={isGenerating} w="full">Отмена</GrayButton>
            </Grid>
        </VStack >
    );
}


