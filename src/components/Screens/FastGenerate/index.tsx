import { Button, Heading, Text, Textarea, VStack, Box, Icon, HStack, IconButton} from "@chakra-ui/react"
import { Toaster } from "../../ui/toaster"
import { useCallback, useEffect, useState, useRef } from "react"
import { useStore } from "@tanstack/react-store"
import { COLOR } from "../../../components/ui/colors"
import { TrackLoadingScreen } from "../TrackLoading"
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
import { createWebAppGeneration, createLyricsGeneration, getLyricsGenerationStatus } from "../../../api/webapp"
import { useTracks } from "../../../hooks/useTracks"
import { toaster } from "../../ui/toaster"
import { logError } from "../../../utils/logger"
import { VoiceRecorder } from "../../ui/VoiceRecorder"
import { TbSparkles, TbX } from "react-icons/tb"
import { GenerationParamsAccordion } from "../GenerationParamsAccordion"
import { useAuth } from "../../../hooks/useUser"
import { setUserState } from "../../../store"

export const FastGenerateScreen = ({ onClose: _onClose }: { onClose: () => void }) => {
	const [prompt, setPrompt] = useState("")
	const [screen, setScreen] = useState<"form" | "params" | "loading">("form")
	const [isGenerated, setIsGenerated] = useState(false)
	const scenarioState = useGenerationScenario()
	const generationDraft = useGenerationDraft()
	const token = useStore(store, (state) => state.auth.token)
	const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false)
	const { loadTracks } = useTracks()
	const { getUser } = useAuth()

	useEffect(() => {
		if (!scenarioState || scenarioState.mode !== "text") {
			setGenerationScenario(createFastGenerationDraft())
		}
	}, [scenarioState])

	// Используем ref для отслеживания изменений prompt извне
	const prevScenarioPromptRef = useRef<string | null>(null);

	useEffect(() => {
		if (scenarioState?.mode === "text") {
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

			// если текст был сгенерирован, но пользователь очистил/уменьшил его до < 200 символов,
			// возвращаемся в режим "ручного ввода" с лимитом 200 и доступной кнопкой генерации текста
			if (isGenerated && value.length < 200) {
				setIsGenerated(false)
			}
		},
		[patchFastScenario, isGenerated]
	)

	const handleReset = useCallback(() => {
		setPrompt("")
		setIsGenerated(false)
		setGenerationPrompt("")
		patchFastScenario((draft) => ({
			...draft,
			prompt: "",
		}))
	}, [patchFastScenario])

	const handleGenerateLyrics = useCallback(async () => {
		if (!prompt.trim()) {
			toaster.dismiss()
			toaster.create({
				type: "error",
				title: "Ошибка",
				description: "Введите описание для генерации лирики",
			})
			return
		}

		if (!token) {
			toaster.dismiss()
			toaster.create({
				type: "error",
				title: "Ошибка",
				description: "Нет токена авторизации",
			})
			return
		}

		setIsGeneratingLyrics(true)
		try {
			// Создаем задачу генерации лирики
			const response = await createLyricsGeneration(token, { prompt, type: "suno" })
			const taskId = response.data.id

			// Опрашиваем статус генерации
			let attempts = 0
			const maxAttempts = 60 // максимум 60 попыток (примерно 5 минут при интервале 5 секунд)
			const pollInterval = 5000 // 5 секунд

			const pollStatus = async (): Promise<void> => {
				try {
					const statusResponse = await getLyricsGenerationStatus(token, taskId)
					const status = statusResponse.data.status

				if (status === "completed") {
					const generatedLyrics = statusResponse.data.lyrics
					// Автоматически заменяем текст в textarea на сгенерированную лирику
					setPrompt(generatedLyrics)
					setGenerationPrompt(generatedLyrics)
					setIsGenerated(true)
					patchFastScenario((draft) => ({
						...draft,
						prompt: generatedLyrics,
					}))
					setIsGeneratingLyrics(false)
					toaster.dismiss()
					toaster.create({
						type: "success",
						title: "Лирика сгенерирована!",
						description: "Текст заменён на сгенерированную лирику",
					})
					} else if (status === "failed") {
						throw new Error("Генерация лирики завершилась с ошибкой")
					} else if (attempts < maxAttempts) {
						attempts++
						setTimeout(pollStatus, pollInterval)
					} else {
						throw new Error("Превышено время ожидания генерации лирики")
					}
				} catch (err: any) {
					if (err?.response?.status === 404 && attempts < maxAttempts) {
						// Задача еще не создана, продолжаем опрос
						attempts++
						setTimeout(pollStatus, pollInterval)
					} else {
						throw err
					}
				}
			}

			// Начинаем опрос через небольшую задержку
			setTimeout(pollStatus, pollInterval)
		} catch (err: any) {
			logError("Failed to generate lyrics", err)
			setIsGeneratingLyrics(false)
			
			const errorMessage = err instanceof Error ? err.message : "Не удалось сгенерировать лирику"
			toaster.dismiss()
			toaster.create({
				type: "error",
				title: "Ошибка генерации лирики",
				description: errorMessage,
			})
		}
	}, [prompt, token, patchFastScenario])

	if (screen === "loading") {
		return <TrackLoadingScreen />
	}

	if (screen === "params") {
		return (
			<GenerationParamsAccordion
				mode="submit"
				onBack={() => setScreen("form")}
				onCancel={_onClose}
				onGenerate={async () => {
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

					const basePayload = buildCreateGenerationRequest(effectiveDraft)
					
					// Если лирика уже сгенерирована, извлекаем title и lyrics из текста
					let payload: typeof basePayload & { skip_lyrics_generation?: boolean; lyrics?: string; title?: string } = { ...basePayload }
					
					if (isGenerated && prompt.trim()) {
						const lines = prompt.trim().split('\n').filter(line => line.trim().length > 0)
						
						if (lines.length > 1) {
							// Первая непустая строка - название песни
							const title = lines[1].trim()
							// Остальной текст - лирика
							const lyrics = lines.slice(1).join('\n').trim()
							
							payload = {
								...basePayload,
								skip_lyrics_generation: true,
								lyrics: lyrics || prompt, // если нет строк после первой, используем весь текст
								title: title,
							}
						} else {
							// Если нет строк, используем весь текст как лирику
							payload = {
								...basePayload,
								skip_lyrics_generation: true,
								lyrics: prompt,
							}
						}
					} else {
						payload = {
							...basePayload,
							skip_lyrics_generation: false,
						}
					}

					if (!token) {
						throw new Error("Нет токена авторизации")
					}

					await createWebAppGeneration(token, payload)

					setGenerationScenario(updatedScenario)
					setGenerationPrompt(payload.prompt)
					setScreen("loading")

					// Обновляем данные пользователя для актуального баланса
					try {
						const userResponse = await getUser()
						if (userResponse?.data) {
							setUserState(userResponse.data)
						}
					} catch (userError) {
						logError("Failed to refresh user data after fast generation", userError)
					}

					try {
						await loadTracks()
					} catch (loadError) {
						logError("Failed to load tracks after fast generation", loadError)
					}

					resetGenerationDraft()
					toaster.dismiss()
					toaster.create({
						type: "success",
						title: "Генерация запущена",
						description: "Новый трек появится в списке после обработки.",
					})
					return true
				}}
				onLoadingStart={() => setScreen("loading")}
			/>
		)
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
					fontSize={"sm"}
					h={isGenerated ? "320px" : "160px"}
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
					maxLength={isGenerated ? undefined : 200}
				/>
				<VoiceRecorder
					onTranscript={(transcript) => {
						// Добавляем к существующему тексту (или заменяем если пустой)
						const newText = prompt.trim() 
							? `${prompt.trim()} ${transcript}` 
							: transcript;
						handlePromptChange(newText);
						setIsGenerated(false);
					}}
				/>
			</Box>
			<VStack gap={3} w="full">
				<HStack gap={3} w="full" justifyContent="space-between" alignItems="center">
					<Button
						w={"fit"}
						rounded={"full"}
						bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
						color={COLOR.kit.white}
						_disabled={{ opacity: 0.5, cursor: "not-allowed" }}
						_hover={{ 
							bg: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
							transform: "translateY(-2px)",
							boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)"
						}}
						// после генерации текста кнопка блокируется, пока пользователь не очистит текст (< 200 символов)
						disabled={isGenerated || !prompt.trim() || isGeneratingLyrics}
						onClick={handleGenerateLyrics}
						transition="all 0.3s ease"
						loading={isGeneratingLyrics}
						loadingText="Генерирую..."
					>
						<HStack gap={2}>
							<Icon as={TbSparkles} boxSize={5} />
							<Text>Сгенерировать текст</Text>
						</HStack>
					</Button>
					<HStack gap={2} alignItems="center">
						<Text color={COLOR.kit.smoke} fontSize="sm">
							{isGenerated ? `${prompt.length}/∞` : `${prompt.length}/200`}
						</Text>
						{prompt.trim() && (
							<IconButton
								aria-label="Очистить"
								size="sm"
								variant="ghost"
								color={COLOR.kit.smoke}
								_hover={{ 
									color: COLOR.kit.white,
									bg: COLOR.kit.darkGray 
								}}
								onClick={handleReset}
								rounded="full"
							>
								<Icon as={TbX} boxSize={4} />
							</IconButton>
						)}
					</HStack>
				</HStack>
				<Button
					flex={1}
					h={12}
					w={"full"}
					py={4}
					borderRadius="xl"
					bg={COLOR.kit.orange}
					color={COLOR.kit.white}
					_disabled={{ opacity: 0.5, cursor: "not-allowed" }}
					_hover={{ bg: COLOR.brand.orange700 }}
					disabled={!prompt.trim() || isGeneratingLyrics}
					onClick={() => {
						setScreen("params")
					}}
				>
					Далее
				</Button>
			</VStack>
			<Toaster />
		</VStack>
	);
};