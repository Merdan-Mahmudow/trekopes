import { Box, Text, VStack, Input, Icon, Flex, Grid, GridItem, Button, Slider, Skeleton, Image } from "@chakra-ui/react";
import { Toaster } from "../../ui/toaster";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaQuestion } from 'react-icons/fa';
import { COLOR } from "../../ui/colors";
import { BrandButton, GrayButton } from "../../ui/button";
import { TrackLoadingScreen } from "../TrackLoading";
import type { Artist, GenerationParams, GenerationDraft } from "../../../types/generation";
import { useStore } from "@tanstack/react-store";
import store, {
  setGenerationPrompt,
  setGenerationScenario,
  updateGenerationScenario,
  resetGenerationDraft,
} from "../../../store";
import { useGenerationDraft } from "../../../store/generation";
import { buildCreateGenerationRequest } from "../../../utils/generationPayload";
import { createWebAppGeneration } from "../../../api/webapp";
import { useTracks } from "../../../hooks/useTracks";
import { useGenerationTemplateArtists } from "../../../hooks/useGenerationTemplateArtists";
import { toaster } from "../../ui/toaster";
import { logError } from "../../../utils/logger";
import { moodOptions } from "../../../utils/moodPrompts";
import { genreOptions } from "../../../utils/genrePrompts";

type ArtistParamsDisplayMode = "full" | "artist";

type ArtistParamsProps = {
    mode?: "collect" | "submit";
    displayMode?: ArtistParamsDisplayMode;
    onBack: () => void;
    onCancel: () => void;
    onGenerate?: (data: { artist: Artist | null; params: GenerationParams }) => void | boolean | Promise<void | boolean>;
};



export function ArtistParams({ mode = "submit", displayMode = "full", onBack, onCancel, onGenerate }: ArtistParamsProps) {
    const isArtistOnly = displayMode === "artist";
    const { artists: apiArtists, isLoading: isLoadingArtists, error: artistsError } = useGenerationTemplateArtists();
    
    // Преобразуем артистов из API в формат Artist и добавляем "Не выбрано"
    const artists: Artist[] = useMemo(() => {
        const defaultOption: Artist = { id: "none", name: "Случайный артист", avatar: "❔", description: null };
        const mappedArtists: Artist[] = apiArtists.map((apiArtist) => ({
            id: apiArtist.id,
            name: apiArtist.name,
            avatar: "👨‍🎤", // Дефолтный аватар, можно заменить на логику с первыми буквами
            description: apiArtist.description ?? null,
        }));
        return [defaultOption, ...mappedArtists];
    }, [apiArtists]);
    const [tempo, setTempo] = useState(105);
    const [activeTab, setActiveTab] = useState<"mode" | "params">("mode");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedArtistId, setSelectedArtistId] = useState<string>("none");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [generationParams, setGenerationParams] = useState<GenerationParams>({
        tempo: 105,
        mood: null,
        style: null,
        voice: null
    });
    const generationDraft = useGenerationDraft();
    const token = useStore(store, (state) => state.auth.token);
    const { loadTracks } = useTracks();

    const TEMPO_COLORS = {
        slow: (generationParams.tempo >= 60 && generationParams.tempo <= 90) ? COLOR.kit.orange : COLOR.kit.smoke,
        medium: (generationParams.tempo >= 91 && generationParams.tempo <= 120) ? COLOR.kit.orange : COLOR.kit.smoke,
        fast: (generationParams.tempo >= 121 && generationParams.tempo <= 180) ? COLOR.kit.orange : COLOR.kit.smoke,
    };

    const filteredArtists = useMemo(
        () => artists.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase())),
        [artists, searchQuery]
    );
    
    useEffect(() => {
        if (isArtistOnly) {
            setActiveTab("mode");
        }
    }, [isArtistOnly]);
    
    // Обработка ошибок загрузки артистов
    useEffect(() => {
        if (artistsError) {
            logError("Failed to load generation template artists", artistsError);
            toaster.create({
                type: "error",
                title: "Ошибка загрузки артистов",
                description: "Не удалось загрузить список артистов. Попробуйте позже.",
            });
        }
    }, [artistsError]);

    const normalizeArtist = useCallback(
        (artistId: string | null): Artist | null => {
            if (!artistId || artistId === "none") {
                return null;
            }
            return artists.find((artist) => artist.id === artistId) ?? null;
        },
        [artists]
    );

    useEffect(() => {
        const scenario = generationDraft?.scenario;
        if (!scenario) return;

        if ("artist" in scenario && scenario.artist) {
            const scenarioArtistId = scenario.artist.id ?? "none";
            // Если артисты загружены, проверяем существование, иначе просто устанавливаем ID из scenario
            if (!isLoadingArtists && artists.length > 0) {
                const artistExists = artists.some(a => a.id === scenarioArtistId);
                if (artistExists && selectedArtistId !== scenarioArtistId) {
                    setSelectedArtistId(scenarioArtistId);
                } else if (!artistExists && selectedArtistId !== "none") {
                    // Если артиста нет в списке, выбираем "Не выбрано"
                    setSelectedArtistId("none");
                }
            } else if (isLoadingArtists && selectedArtistId !== scenarioArtistId) {
                // Пока загружаются артисты, устанавливаем ID из scenario
                setSelectedArtistId(scenarioArtistId);
            }
        } else {
            // Если артист не выбран в scenario, выбираем "Не выбрано" (первый элемент списка)
            if (!isLoadingArtists && artists.length > 0 && selectedArtistId !== "none") {
                setSelectedArtistId("none");
            }
        }
        if ("params" in scenario && scenario.params) {
            setGenerationParams({
                tempo: scenario.params.tempo ?? 105,
                mood: scenario.params.mood ?? null,
                style: scenario.params.style ?? null,
                voice: scenario.params.voice ?? null,
            });
            setTempo(scenario.params.tempo ?? 105);
        }
    }, [generationDraft, artists, isLoadingArtists, selectedArtistId]);

    const handleParamsChange = useCallback((key: keyof GenerationParams, value: number | string | null) => {
        setGenerationParams(prev => {
            const next = { ...prev, [key]: value };
            updateGenerationScenario((scenario) => {
                if (!scenario) return scenario;
                if ("params" in scenario) {
                    return {
                        ...scenario,
                        params: { ...next },
                    } as typeof scenario;
                }
                return scenario;
            });
            return next;
        });
    }, [updateGenerationScenario]);

    const handleSelectArtist = useCallback((artist: Artist) => {
        setSelectedArtistId(artist.id ?? "none");
        updateGenerationScenario((scenario) => {
            if (!scenario) return scenario;
            if ("artist" in scenario) {
                return {
                    ...scenario,
                    artist: artist.id === "none" ? null : artist,
                } as typeof scenario;
            }
            return scenario;
        });
    }, [updateGenerationScenario]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const normalizedArtist = normalizeArtist(selectedArtistId);
            const selection = {
                artist: isArtistOnly || activeTab === "mode" ? normalizedArtist : null,
                params: generationParams,
            };

            const callbackResult = await onGenerate?.(selection);

            if (mode === "collect" || callbackResult === false) {
                setIsGenerating(false);
                return;
            }

            setIsLoading(true);

            const scenario = generationDraft?.scenario;
            if (!scenario) {
                throw new Error("Нет данных сценария для генерации");
            }

            const updatedScenario = {
                ...scenario,
                artist: selection.artist,
                params: selection.params,
            } as typeof scenario;

            const effectiveDraft: GenerationDraft = {
                ...generationDraft,
                scenario: updatedScenario,
            };

            const payload = buildCreateGenerationRequest(effectiveDraft);

            if (!token) {
                throw new Error("Нет токена авторизации");
            }

            await createWebAppGeneration(token, payload);

            setGenerationScenario(updatedScenario);
            setGenerationPrompt(payload.prompt);

            try {
                await loadTracks();
            } catch (loadError) {
                logError("Failed to load tracks after artist generation", loadError);
            }

            resetGenerationDraft();
            toaster.create({
                type: "success",
                title: "Генерация запущена",
                description: "Мы уведомим, когда трек будет готов.",
            });
        } catch (err: any) {
            logError("Failed to start artist generation", err);
            setIsLoading(false);
            
            // Обработка ошибки 409 (Conflict)
            if (err?.response?.status === 409) {
                toaster.create({
                    type: "error",
                    title: "Ошибка генерации",
                    description: "У вас есть активная генерация. Пожалуйста, дождитесь её завершения.",
                });
                return;
            }
            
            const errorMessage = err instanceof Error ? err.message : "Не удалось запустить генерацию"
            toaster.create({
                type: "error",
                title: "Ошибка запуска генерации",
                description: errorMessage,
            });
        } finally {
            setIsGenerating(false);
        }
    };
    if (isLoading) {
        return (
            <>
                <TrackLoadingScreen /></>
        )
    }
    return (
        <VStack gap={4} w="full" color="white">
            <Box w="full" bg={COLOR.kit.darkGray} borderRadius="24px" p={6}>
                {!isArtistOnly && (
                    <Flex gap={4} mb={6}>
                        <Box
                            cursor="pointer"
                            onClick={() => setActiveTab("mode")}
                            borderBottom={activeTab === "mode" ? `2px solid ${COLOR.kit.orange}` : "2px solid transparent"}
                            pb={2}
                        >
                            <Text color={activeTab === "mode" ? COLOR.kit.orange : "#8A8A8A"} fontWeight={activeTab === "mode" ? "bold" : "normal"}>ПО АРТИСТУ</Text>
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
                )}

                {isArtistOnly || activeTab === "mode" ? (
                    <VStack gap={4} w="full">
                        <Input
                            placeholder="Найти артиста"
                            value={searchQuery}
                            w={"80vw"}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            bg="#1E1E20"
                            borderColor="#2A2A2D"
                            borderRadius="16px"
                            outline={"none"}
                            color="white"
                            _placeholder={{ color: "#8A8A8A" }}
                            _focus={{ borderColor: COLOR.kit.orange, boxShadow: "0 0 0 1px #F59A0E" }}
                            disabled={isLoadingArtists}
                        />

                        {isLoadingArtists ? (
                            <Grid templateColumns="repeat(auto-fill, minmax(100px, 1fr))" gap={4} w="80vw">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <GridItem key={index} w="full">
                                        <Skeleton w="full" h="160px" borderRadius="16px" />
                                    </GridItem>
                                ))}
                            </Grid>
                        ) : filteredArtists.length === 0 ? (
                            <VStack gap={2} py={8}>
                                <Text color="#8A8A8A" fontSize="sm">
                                    {searchQuery ? "Артисты не найдены" : "Артисты не доступны"}
                                </Text>
                            </VStack>
                        ) : (
                            <Grid templateColumns="repeat(auto-fill, minmax(100px, 1fr))" gap={4} w="80vw">
                                {filteredArtists.map((artist) => (
                                    <GridItem key={artist.id} w="full">
                                        <VStack
                                            w={"full"}
                                            py={4}
                                            cursor="pointer"
                                            onClick={() => handleSelectArtist(artist)}
                                            borderRadius="16px"
                                            bg={selectedArtistId === artist.id ? COLOR.kit.orange : "#1E1E20"}
                                            _hover={{ bg: selectedArtistId === artist.id ? COLOR.kit.orange : "#2A2A2D" }}
                                            transition="all 0.2s"
                                        >
                                            <Box w="60px" h="60px" borderRadius="50%" bg={selectedArtistId === artist.id ? "white" : COLOR.kit.iconBg} display="flex" alignItems="center" justifyContent="center" fontSize="24px">
                                                {artist.id === "none" ? (
                                                    <Icon as={FaQuestion} w="24px" h="24px" color={selectedArtistId === artist.id ? "black" : COLOR.kit.white} />
                                                ) : (
                                                    <Image src={`https://storage.yandexcloud.net/trekopes-ai/avatars/${artist.id}.jpg`} alt={artist.name} w="100%" h="100%" borderRadius="50%" />
                                                )}
                                            </Box>
                                            <Text fontSize="xs" textAlign="center" color={selectedArtistId === artist.id ? "white" : "#8A8A8A"} fontWeight={selectedArtistId === artist.id ? "bold" : "normal"}>
                                                {artist.name}
                                            </Text>
                                        </VStack>
                                    </GridItem>
                                ))}
                            </Grid>
                        )}
                    </VStack>
                ) : (
                    <VStack gap={6} w="full">
                        <VStack key={"md"} align="flex-start" w="full">
                            <Text fontSize="sm" fontWeight="medium">Темп (ударов в минуту): {generationParams.tempo}</Text>
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
                                <Text color={TEMPO_COLORS.slow} onClick={() => { handleParamsChange("tempo", 75); setTempo(75) }} fontSize="sm">Медленный</Text>
                                <Text color={TEMPO_COLORS.medium} onClick={() => { handleParamsChange("tempo", 105); setTempo(105) }} fontSize="sm">Средний</Text>
                                <Text color={TEMPO_COLORS.fast} onClick={() => { handleParamsChange("tempo", 135); setTempo(135) }} fontSize="sm">Быстрый</Text>
                            </Flex>

                        </VStack>

                        <VStack gap={3} w="full" align="start">
                            <Text fontSize="sm" fontWeight="medium">Настроение</Text>
                            <Grid templateColumns="repeat(2, 1fr)" gap={2} w="full">
                                {moodOptions.map((mood) => (
                                    <Button
                                        rounded={"xl"}
                                        key={mood.value}
                                        size="md"
                                        onClick={() =>
                                            handleParamsChange(
                                                "mood",
                                                generationParams.mood === mood.value ? null : mood.value
                                            )
                                        }
                                        bg={generationParams.mood === mood.value ? COLOR.kit.orange : COLOR.kit.darkGray}
                                        color="white"
                                        fontSize="xs"
                                    >
                                        {mood.label}
                                    </Button>
                                ))}
                            </Grid>
                        </VStack>

                        <VStack gap={3} w="full" align="start">
                            <Text fontSize="sm" fontWeight="medium">Стиль</Text>
                            <Grid templateColumns="repeat(2, 1fr)" gap={2} w="full">
                                {genreOptions.map((genre) => (
                                    <Button
                                        rounded={"xl"}
                                        key={genre.value}
                                        size="md"
                                        onClick={() =>
                                            handleParamsChange(
                                                "style",
                                                generationParams.style === genre.value ? null : genre.value
                                            )
                                        }
                                        bg={generationParams.style === genre.value ? COLOR.kit.orange : COLOR.kit.darkGray}
                                        color="white"
                                        fontSize="xs"
                                    >
                                        {genre.label}
                                    </Button>
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
                    <BrandButton
                        onClick={handleGenerate}
                        disabled={isGenerating || (!isArtistOnly && activeTab === "mode" && (selectedArtistId === "none"))}
                        w="full"
                    >
                            <Text>Далее</Text>

                    </BrandButton>
                </VStack>
            </Box >

            <Grid templateColumns="1fr 1fr" gap={3} w="full">
                <GrayButton onClick={onBack} disabled={isGenerating} w="full">Назад</GrayButton>
                <GrayButton onClick={onCancel} disabled={isGenerating} w="full">Отмена</GrayButton>
            </Grid>
			<Toaster />
        </VStack >
    );
}


