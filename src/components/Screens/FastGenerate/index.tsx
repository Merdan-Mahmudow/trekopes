import { Button, Heading, Text, Textarea, VStack, Box } from "@chakra-ui/react"
import { useCallback, useEffect, useState } from "react"
import { useStore } from "@tanstack/react-store"
import { COLOR } from "../../../components/ui/colors"
import { ProPayScreen } from "../ProPay"
import { TrackLoadingScreen } from "../TrackLoading"
import { useIsPro } from "../../../store/user"
import {
	setGenerationScenario,
	setGenerationPrompt,
	updateGenerationScenario,
	useGenerationScenario,
	useGenerationDraft,
	resetGenerationDraft,
} from "../../../store/generation"
import store from "../../../store"
import {
	createFastGenerationDraft,
	type FastGenerationDraft,
	type GenerationDraft,
} from "../../../types/generation"
import { buildCreateGenerationRequest } from "../../../utils/generationPayload"
import { createWebAppGeneration } from "../../../api/webapp"
import { useTracks } from "../../../hooks/useTracks"
import { toaster } from "../../ui/toaster"
import { logError } from "../../../utils/logger"
import { Dictaphone } from "../../ui/SpeechRecognitionButton"

export const FastGenerateScreen = ({ onClose: _onClose }: { onClose: () => void }) => {
	const [prompt, setPrompt] = useState("")
	const [screen, setScreen] = useState<"form" | "pro" | "loading">("form")
	const isPro = useIsPro()
	const scenarioState = useGenerationScenario()
	const generationDraft = useGenerationDraft()
	const token = useStore(store, (state) => state.auth.token)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const { loadTracks } = useTracks()

	useEffect(() => {
		if (!scenarioState || scenarioState.mode !== "text") {
			setGenerationScenario(createFastGenerationDraft())
		}
	}, [scenarioState])

	useEffect(() => {
		if (scenarioState?.mode === "text") {
			if (
				typeof scenarioState.prompt === "string" &&
				scenarioState.prompt !== prompt
			) {
				setPrompt(scenarioState.prompt)
			}
		}
	}, [scenarioState, prompt])

	const patchFastScenario = useCallback(
		(updater: (draft: FastGenerationDraft) => FastGenerationDraft) => {
			updateGenerationScenario((scenario) => {
				const base =
					scenario && scenario.mode === "text"
						? { ...scenario }
						: createFastGenerationDraft()
				return updater(base)
			})
		},
		[updateGenerationScenario]
	)

	const handlePromptChange = useCallback(
		(value: string) => {
			setPrompt(value)
			setGenerationPrompt(value)
			patchFastScenario((draft) => ({
				...draft,
				prompt: value,
			}))
		},
		[patchFastScenario]
	)

	if (screen === "pro" && !isPro) {
		return <ProPayScreen onBack={() => setScreen("form")} onPay={_onClose} />
	}

	if (screen === "loading") {
		return <TrackLoadingScreen />
	}

	return (
		<VStack gap={4} w="full" alignItems="stretch">
			<Heading size="lg" color={COLOR.kit.white}>Песня по тексту</Heading>
			<Text color={COLOR.kit.smoke}>Опишите идею песни или вставьте готовый текст</Text>
			<Box position="relative">
				<Textarea
					value={prompt}
					onChange={(e) => handlePromptChange(e.target.value)}
					placeholder="Например: лирический трек о ночном городе и надежде"
					minH="160px"
					bg={COLOR.kit.darkGray}
					color={COLOR.kit.white}
					borderRadius="2xl"
					resize="vertical"
					border="1px solid transparent"
					outline={"none"}
					_focus={{ borderColor: COLOR.kit.orange, boxShadow: "none" }}
					_placeholder={{ color: COLOR.kit.smoke }}
					pr="48px"
					pb="48px"
				/>
				<Dictaphone
					onTranscript={(transcript) => handlePromptChange(transcript)}
					/>
			</Box>
			<Button
				w="full"
				h={12}
				borderRadius="xl"
				bg={COLOR.kit.orange}
				color={COLOR.kit.white}
				_disabled={{ opacity: 0.5, cursor: "not-allowed" }}
				_hover={{ bg: COLOR.brand.orange700 }}
				disabled={!prompt.trim() || isSubmitting}
				onClick={async () => {
					if (!isPro) {
						setScreen("pro")
						return
					}

					setIsSubmitting(true)
					try {
						const draft = generationDraft
						if (!draft?.scenario || draft.scenario.mode !== "text") {
							throw new Error("Заполните описание для генерации")
						}

						const updatedScenario = {
							...draft.scenario,
							prompt,
						}

						const effectiveDraft: GenerationDraft = {
							...draft,
							prompt,
							scenario: updatedScenario,
						}

						const payload = buildCreateGenerationRequest(effectiveDraft)

						if (!token) {
							throw new Error("Нет токена авторизации")
						}

						await createWebAppGeneration(token, payload)

						setGenerationScenario(updatedScenario)
						setGenerationPrompt(payload.prompt)
						setScreen("loading")

					try {
						await loadTracks()
					} catch (loadError) {
						logError("Failed to load tracks after fast generation", loadError)
					}

					resetGenerationDraft()
					toaster.create({
						type: "success",
						title: "Генерация запущена",
						description: "Новый трек появится в списке после обработки.",
					})
				} catch (err) {
					logError("Failed to start fast generation", err)
						const errorMessage = err instanceof Error ? err.message : "Не удалось запустить генерацию"
						toaster.create({
							type: "error",
							title: "Ошибка запуска генерации",
							description: errorMessage,
						})
					} finally {
						setIsSubmitting(false)
					}
				}}
			>
				Сгенерировать
			</Button>
		</VStack>
	);
};