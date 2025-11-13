import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Accordion,
    Box,
    Button,
    Flex,
    Grid,
    Icon,
    Text,
    VStack,
    Slider,
} from "@chakra-ui/react";
import { FaPaw } from "react-icons/fa";
import { COLOR } from "../../ui/colors";
import { BrandButton, GrayButton } from "../../ui/button";
import { TrackLoadingScreen } from "../TrackLoading";
import type { GenerationDraft, GenerationParams } from "../../../types/generation";
import { useStore } from "@tanstack/react-store";
import store, {
    resetGenerationDraft,
    setGenerationPrompt,
    setGenerationScenario,
    updateGenerationScenario,
} from "../../../store";
import { useGenerationDraft } from "../../../store/generation";
import { buildCreateGenerationRequest } from "../../../utils/generationPayload";
import { createWebAppGeneration } from "../../../api/webapp";
import { useTracks } from "../../../hooks/useTracks";
import { toaster } from "../../ui/toaster";

type GenerationParamsAccordionProps = {
    mode?: "collect" | "submit";
    onBack: () => void;
    onCancel: () => void;
    onGenerate?: (params: GenerationParams) => void | boolean | Promise<void | boolean>;
};

const moodOptions = [
    { value: "happy", label: "Веселое" },
    { value: "sad", label: "Грустное" },
    { value: "energetic", label: "Энергичное" },
    { value: "calm", label: "Спокойное" },
    { value: "romantic", label: "Романтичное" },
];

const styleOptions = [
    { value: "pop", label: "Поп" },
    { value: "rock", label: "Рок" },
    { value: "hip-hop", label: "Хип-хоп" },
    { value: "electronic", label: "Электроника" },
    { value: "jazz", label: "Джаз" },
    { value: "classical", label: "Классика" },
];

const voiceOptions = [
    { value: "male", label: "Мужской" as const },
    { value: "female", label: "Женский" as const },
    { value: "both", label: "Вместе" as const },
];

export function GenerationParamsAccordion({
    mode = "submit",
    onBack,
    onGenerate,
}: GenerationParamsAccordionProps) {
    const [tempo, setTempo] = useState(105);
    const [generationParams, setGenerationParams] = useState<GenerationParams>({
        tempo: 105,
        mood: null,
        style: null,
        voice: null,
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const generationDraft = useGenerationDraft();
    const token = useStore(store, (state) => state.auth.token);
    const { loadTracks } = useTracks();

    const TEMPO_COLORS = useMemo(
        () => ({
            slow: generationParams.tempo >= 60 && generationParams.tempo <= 90 ? COLOR.kit.orange : COLOR.kit.smoke,
            medium: generationParams.tempo >= 91 && generationParams.tempo <= 120 ? COLOR.kit.orange : COLOR.kit.smoke,
            fast: generationParams.tempo >= 121 && generationParams.tempo <= 180 ? COLOR.kit.orange : COLOR.kit.smoke,
        }),
        [generationParams.tempo]
    );

    const moodLabel = useMemo(() => {
        if (!generationParams.mood) return null;
        return moodOptions.find((option) => option.value === generationParams.mood)?.label ?? null;
    }, [generationParams.mood]);

    const styleLabel = useMemo(() => {
        if (!generationParams.style) return null;
        return styleOptions.find((option) => option.value === generationParams.style)?.label ?? null;
    }, [generationParams.style]);

    const voiceLabel = useMemo(() => {
        if (!generationParams.voice) return null;
        return voiceOptions.find((option) => option.value === generationParams.voice)?.label ?? null;
    }, [generationParams.voice]);

    useEffect(() => {
        const scenario = generationDraft?.scenario;
        if (!scenario || !("params" in scenario)) {
            return;
        }
        if (scenario.params) {
            setGenerationParams({
                tempo: scenario.params.tempo ?? 105,
                mood: scenario.params.mood ?? null,
                style: scenario.params.style ?? null,
                voice: scenario.params.voice ?? null,
            });
            setTempo(scenario.params.tempo ?? 105);
        }
    }, [generationDraft]);

    const handleParamsChange = useCallback(
        (key: keyof GenerationParams, value: number | string | null) => {
            setGenerationParams((prev) => {
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
        },
        [updateGenerationScenario]
    );

    const handleGenerate = async () => {
        setError(null);
        setIsGenerating(true);
        try {
            const callbackResult = await onGenerate?.(generationParams);

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
                params: { ...generationParams },
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
                console.error(loadError);
            }

            resetGenerationDraft();
            toaster.create({
                type: "success",
                title: "Генерация запущена",
                description: "Мы уведомим, когда трек будет готов.",
            });
        } catch (err) {
            console.error(err);
            setIsLoading(false);
            setError(err instanceof Error ? err.message : "Не удалось запустить генерацию");
            toaster.create({
                type: "error",
                title: "Ошибка запуска генерации",
                description: err instanceof Error ? err.message : "Попробуйте ещё раз позже.",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) {
        return <TrackLoadingScreen />;
    }
    return (
        <VStack gap={4} w="full" color="white">
            <Box w="full" borderRadius="24px" p={6}>
                <VStack gap={4} align="stretch">
                    <Box>
                        <Text fontSize="lg" fontWeight="bold" color={COLOR.kit.orange}>Параметры трека</Text>
                        <Text fontSize="sm" color="#8A8A8A">Выберите настройки, чтобы получить нужное звучание</Text>
                    </Box>

                    <Accordion.Root collapsible >
                        <Accordion.Item value="params" border="none">
                            <Box borderRadius="16px" bg="#1E1E20" overflow="hidden">
                                <Accordion.ItemTrigger
                                    px={4}
                                    py={3}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    fontWeight="medium"
                                    _hover={{ bg: "#232325" }}
                                    _expanded={{ bg: "#232325" }}
                                >
                                    <Text fontWeight="light" color={COLOR.kit.smoke}>Выбрать параметры</Text>
                                    <Accordion.ItemIndicator />
                                </Accordion.ItemTrigger>
                                <Accordion.ItemContent bg="#1E1E20" borderTop="1px solid #232325">
                                    <Accordion.ItemBody px={4} pb={4} pt={3}>
                                        <VStack align="stretch" w="full" gap={6}>
                                            <VStack align="flex-start" w="full">
                                                <Text fontSize="sm" fontWeight="medium">Темп: {generationParams.tempo} BPM</Text>
                                                <Slider.Root
                                                    size="md"
                                                    value={[tempo]}
                                                    defaultValue={[105]}
                                                    width="full"
                                                    min={60}
                                                    max={180}
                                                    onValueChange={(value) => {
                                                        const nextTempo = value.value[0];
                                                        handleParamsChange("tempo", nextTempo);
                                                        setTempo(nextTempo);
                                                    }}
                                                >
                                                    <Slider.Control>
                                                        <Slider.Track>
                                                            <Slider.Range />
                                                        </Slider.Track>
                                                        <Slider.Thumbs />
                                                    </Slider.Control>
                                                </Slider.Root>
                                                <Flex gap={2} alignItems="center" justifyContent="space-between" w="full" mt={2}>
                                                    <Text
                                                        color={TEMPO_COLORS.slow}
                                                        fontSize="sm"
                                                        cursor="pointer"
                                                        onClick={() => {
                                                            handleParamsChange("tempo", 75);
                                                            setTempo(75);
                                                        }}
                                                    >
                                                        Медленный
                                                    </Text>
                                                    <Text
                                                        color={TEMPO_COLORS.medium}
                                                        fontSize="sm"
                                                        cursor="pointer"
                                                        onClick={() => {
                                                            handleParamsChange("tempo", 105);
                                                            setTempo(105);
                                                        }}
                                                    >
                                                        Средний
                                                    </Text>
                                                    <Text
                                                        color={TEMPO_COLORS.fast}
                                                        fontSize="sm"
                                                        cursor="pointer"
                                                        onClick={() => {
                                                            handleParamsChange("tempo", 135);
                                                            setTempo(135);
                                                        }}
                                                    >
                                                        Быстрый
                                                    </Text>
                                                </Flex>
                                            </VStack>

                                            <VStack align="flex-start" w="full">
                                                <Text fontSize="sm" fontWeight="medium">
                                                    {`Настроение${moodLabel ? `: ${moodLabel}` : ""}`}
                                                </Text>
                                                <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap={2} w="full">
                                                    {moodOptions.map((mood) => (
                                                        <Button
                                                            key={mood.value}
                                                            rounded="xl"
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

                                            <VStack align="flex-start" w="full">
                                                <Text fontSize="sm" fontWeight="medium">
                                                    {`Стиль${styleLabel ? `: ${styleLabel}` : ""}`}
                                                </Text>
                                                <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap={2} w="full">
                                                    {styleOptions.map((style) => (
                                                        <Button
                                                            key={style.value}
                                                            rounded="xl"
                                                            size="md"
                                                            onClick={() =>
                                                                handleParamsChange(
                                                                    "style",
                                                                    generationParams.style === style.value ? null : style.value
                                                                )
                                                            }
                                                            bg={generationParams.style === style.value ? COLOR.kit.orange : COLOR.kit.darkGray}
                                                            color="white"
                                                            fontSize="xs"
                                                        >
                                                            {style.label}
                                                        </Button>
                                                    ))}
                                                </Grid>
                                            </VStack>

                                            <VStack align="flex-start" w="full">
                                                <Text fontSize="sm" fontWeight="medium">
                                                    {`Голос${voiceLabel ? `: ${voiceLabel}` : ""}`}
                                                </Text>
                                                <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={2} w="full">
                                                    {voiceOptions.map((voice) => (
                                                        <Button
                                                            key={voice.value}
                                                            size="md"
                                                            rounded="xl"
                                                            onClick={() =>
                                                                handleParamsChange(
                                                                    "voice",
                                                                    generationParams.voice === voice.value ? null : voice.value
                                                                )
                                                            }
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
                                    </Accordion.ItemBody>
                                </Accordion.ItemContent>
                            </Box>
                        </Accordion.Item>
                    </Accordion.Root>

                    <VStack gap={3}>
                        <BrandButton onClick={handleGenerate} disabled={isGenerating} w="full">
                            <Flex alignItems="center" gap={2}>
                                <Text>Сгенерировать</Text>
                                <Flex alignItems="center" gap={1}>
                                    <Text fontSize="md">-1</Text>
                                    <Icon as={FaPaw} />
                                </Flex>
                            </Flex>
                        </BrandButton>
                        <GrayButton onClick={onBack} disabled={isGenerating} w="full">
                            Назад
                        </GrayButton>

                        {error && (
                            <Text color="red.300" fontSize="sm" textAlign="center">
                                {error}
                            </Text>
                        )}
                    </VStack>
                </VStack>
            </Box>
        </VStack>
    );
}


