import { Box, Text, VStack, Grid, Textarea } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "@tanstack/react-store";
import { COLOR } from "../../ui/colors";
import { BrandButton, GrayButton } from "../../ui/custom-button";
import { ProPayScreen } from "../ProPay";
import { useIsPro } from "../../../store/user";
import { ArtistParams } from "../ArtistParams";
import { TrackLoadingScreen } from "../TrackLoading";
import {
    createStyleGenerationDraft,
    type StyleGenerationDraft,
    type GenerationDraft,
} from "../../../types/generation";
import {
    setGenerationScenario,
    updateGenerationScenario,
    useGenerationScenario,
    useGenerationDraft,
    resetGenerationDraft,
} from "../../../store/generation";
import store, { setGenerationPrompt } from "../../../store";
import { buildCreateGenerationRequest } from "../../../utils/generationPayload";
import { createWebAppGeneration } from "../../../api/webapp";
import { logError } from "../../../utils/logger";
import { useTracks } from "../../../hooks/useTracks";
import { toaster, Toaster } from "../../ui/toaster";
import { VoiceRecorder } from "../../ui/VoiceRecorder";
import { useAuth } from "../../../hooks/useUser";
import { setUserState } from "../../../store";
type StyleGenerateScreenProps = {
    onClose: () => void;
};

// delete button "Отмена"

export function StyleGenerateScreen({ onClose }: StyleGenerateScreenProps) {
    const [currentStep, setCurrentStep] = useState<"select" | "prompt" | "loading">("select");
    const isPro = useIsPro();
    const [prompt, setPrompt] = useState("");
    const promptRef = useRef<HTMLTextAreaElement>(null);
    const scenarioState = useGenerationScenario();
    const generationDraft = useGenerationDraft();
    const token = useStore(store, (state) => state.auth.token);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { loadTracks } = useTracks();
    const { getUser } = useAuth();

    useEffect(() => {
        if (!scenarioState || scenarioState.mode !== "style") {
            setGenerationScenario(createStyleGenerationDraft());
        }
    }, [scenarioState]);

    // Используем ref для отслеживания изменений prompt извне
    const prevScenarioPromptRef = useRef<string | null>(null);

    useEffect(() => {
        if (scenarioState?.mode === "style") {
            const scenarioPrompt = scenarioState.prompt;
            // Только обновляем если prompt изменился извне (не из нашего компонента)
            if (
                typeof scenarioPrompt === "string" &&
                prevScenarioPromptRef.current !== scenarioPrompt
            ) {
                prevScenarioPromptRef.current = scenarioPrompt;
                setPrompt(scenarioPrompt);
            }
        }
    }, [scenarioState]); // ✅ Убрали prompt из зависимостей

    const patchStyleScenario = useCallback(
        (updater: (draft: StyleGenerationDraft) => StyleGenerationDraft) => {
            updateGenerationScenario((scenario) => {
                const base =
                    scenario && scenario.mode === "style"
                        ? { ...scenario }
                        : createStyleGenerationDraft();
                return updater(base);
            });
        },
        [updateGenerationScenario]
    );

    const handlePromptChange = useCallback(
        (value: string) => {
            setPrompt(value);
            setGenerationPrompt(value);
            patchStyleScenario((draft) => ({
                ...draft,
                prompt: value,
            }));
        },
        [patchStyleScenario]
    );

    const handleGenerate = async () => {
        setIsSubmitting(true);
        try {
            const draft = generationDraft;
            if (!draft?.scenario || draft.scenario.mode !== "style") {
                throw new Error("Заполните параметры генерации");
            }

            const updatedScenario = {
                ...draft.scenario,
                prompt,
            };

            const effectiveDraft: GenerationDraft = {
                ...draft,
                prompt,
                scenario: updatedScenario,
            };

            const payload = buildCreateGenerationRequest(effectiveDraft);

            if (!token) {
                throw new Error("Нет токена авторизации");
            }

            await createWebAppGeneration(token, payload);

            setGenerationScenario(updatedScenario);
            setGenerationPrompt(payload.prompt);
            setCurrentStep("loading");

            // Обновляем данные пользователя для актуального баланса
            try {
                const userResponse = await getUser();
                if (userResponse?.data) {
                    setUserState(userResponse.data);
                }
            } catch (userError) {
                logError("Failed to refresh user data after style generation", userError);
            }

            try {
                await loadTracks();
            } catch (loadError) {
                logError("Failed to load tracks after style generation", loadError);
            }

            resetGenerationDraft();
            toaster.dismiss()
            toaster.create({
                type: "success",
                title: "Генерация запущена",
                description: "Следи за списком — трек появится после обработки.",
            });
        } catch (err: any) {
            logError("Failed to start style generation", err);
            
            // Обработка ошибки 409 (Conflict)
            if (err?.response?.status === 409) {
                toaster.dismiss()
                toaster.create({
                    type: "error",
                    title: "Ошибка генерации",
                    description: "У вас есть активная генерация. Пожалуйста, дождитесь её завершения.",
                });
                return;
            }
            
            const errorMessage = err instanceof Error ? err.message : "Не удалось запустить генерацию"
            toaster.dismiss()
            toaster.create({
                type: "error",
                title: "Ошибка запуска генерации",
                description: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    // focus if current step is "prompt" is active and not focused
    useEffect(() => {
        if (
            currentStep === "prompt" &&
            !promptRef.current?.contains(document.activeElement)
        ) {
            promptRef.current?.focus();
        }
    }, [currentStep]);

    if (!isPro) {
        return <ProPayScreen onBack={onClose} onPay={onClose} />
    }

    return (
        <VStack gap={4} w="full" color="white">
            {currentStep === "select" ? (
                <ArtistParams
                    mode="collect"
                    displayMode="artist"
                    onBack={onClose}
                    onCancel={onClose}
                    onGenerate={({ artist, params }) => {
                        patchStyleScenario((draft) => ({
                            ...draft,
                            artist,
                            params,
                        }));
                        setCurrentStep("prompt");
                    }}
                />
            ) : currentStep === "loading" ? (
                <TrackLoadingScreen />
            ) : (
                <>
                    <Box w="full" bg={COLOR.kit.darkGray} borderRadius="24px" p={6}>
                        <VStack gap={4} w="full" alignItems="stretch" textAlign="center">
                            <Text
                                color={COLOR.kit.orangeWhite}
                                fontSize="24px"
                                lineHeight="130%"
                            >
                                Что должно быть в песне?
                            </Text>
                            <Box position="relative">
                                <Textarea
                                    value={prompt}
                                    ref={promptRef}
                                    onChange={(e) => handlePromptChange(e.target.value)}
                                    placeholder="Например: лирический трек о ночном городе и надежде"
                                    fontSize="16px"
                                    lineHeight="130%"
                                    minH="160px"
                                    bg="#1E1E20"
                                    color={COLOR.kit.white}
                                    borderRadius="3xl"
                                    border="1px solid transparent"
                                    resize="vertical"
                                    _focus={{ borderColor: COLOR.kit.orange, boxShadow: "none" }}
                                    _placeholder={{ color: COLOR.kit.smoke }}
                                    pr="48px"
                                    pb="48px"
                                />
                                <VoiceRecorder
                                    onTranscript={(transcript) => {
                                        // Добавляем к существующему тексту
                                        const newText = prompt.trim() 
                                            ? `${prompt.trim()} ${transcript}` 
                                            : transcript;
                                        handlePromptChange(newText);
                                    }}
                                />
                            </Box>
                        </VStack>
                    </Box>
                    <Grid templateColumns="1fr 1fr" gap={3} w="full">
                        <GrayButton
                            color={COLOR.kit.white}
                            onClick={() => setCurrentStep("select")}
                            w="full"
                        >
                            Назад
                        </GrayButton>
                        <BrandButton
                            onClick={handleGenerate}
                            w="full"
                            disabled={!prompt.trim() || isSubmitting}
                        >
                            Сгенерировать
                        </BrandButton>
                    </Grid>
                </>
            )}
			<Toaster />
        </VStack>
    );
}
