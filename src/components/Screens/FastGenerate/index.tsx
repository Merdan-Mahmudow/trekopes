import { Heading, Text, VStack, Box, IconButton, Flex, HStack, Textarea, Button } from "@chakra-ui/react"
import { Toaster } from "../../ui/toaster"
import { useCallback, useEffect, useState, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BsClipboard, BsCheck2, BsX, BsPencil } from "react-icons/bs"
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
// import { VoiceRecorder } from "../../ui/VoiceRecorder"
import { GenerationParamsAccordion } from "../GenerationParamsAccordion"
import { useAuth } from "../../../hooks/useUser"
import { setUserState } from "../../../store"
import { PromptInput, type GenerationMode } from "../../PromptInput"

const STORAGE_KEY_PROMPT = "fast_generate_prompt"
const STORAGE_KEY_IS_GENERATED = "fast_generate_is_generated"
const STORAGE_KEY_GENERATED_TEXT = "fast_generate_generated_text"
const STORAGE_KEY_USER_MESSAGE = "fast_generate_user_message"

// Компонент кнопки копирования
const CopyButton = ({ text }: { text: string }) => {
	const [hasCopied, setHasCopied] = useState(false)

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(text)
			setHasCopied(true)
			setTimeout(() => setHasCopied(false), 2000)
		} catch (err) {
			console.error("Failed to copy:", err)
		}
	}

	return (
		<IconButton
			aria-label="Копировать текст"
			size="sm"
			onClick={handleCopy}
			bg="whiteAlpha.100"
			_hover={{ bg: "whiteAlpha.200" }}
			color={hasCopied ? "green.400" : "gray.400"}
			borderRadius="lg"
			transition="all 0.2s"
		>
			{hasCopied ? <BsCheck2 /> : <BsClipboard />}
		</IconButton>
	)
}

// Компонент индикатора печатания
const TypingIndicator = () => (
	<HStack gap={1} p={2}>
		<motion.div
			style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: COLOR.kit.smoke }}
			animate={{ y: [0, -5, 0] }}
			transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
		/>
		<motion.div
			style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: COLOR.kit.smoke }}
			animate={{ y: [0, -5, 0] }}
			transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
		/>
		<motion.div
			style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: COLOR.kit.smoke }}
			animate={{ y: [0, -5, 0] }}
			transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
		/>
	</HStack>
)

// Компонент анимированного текста в стиле ChatGPT
const AnimatedLyrics = ({ text }: { text: string }) => {
	const [displayedText, setDisplayedText] = useState("")
	const [isComplete, setIsComplete] = useState(false)
	const animationRef = useRef<number | null>(null)
	const indexRef = useRef(0)

	useEffect(() => {
		// Сбрасываем при изменении текста
		setDisplayedText("")
		setIsComplete(false)
		indexRef.current = 0

		if (!text) return

		const animate = () => {
			if (indexRef.current < text.length) {
				// Добавляем по несколько символов за раз для более быстрой анимации
				const charsToAdd = Math.min(3, text.length - indexRef.current)
				setDisplayedText(text.slice(0, indexRef.current + charsToAdd))
				indexRef.current += charsToAdd
				animationRef.current = requestAnimationFrame(() => {
					setTimeout(animate, 10) // Небольшая задержка между символами
				})
			} else {
				setIsComplete(true)
			}
		}

		// Начинаем анимацию с небольшой задержкой
		const timeout = setTimeout(animate, 100)

		return () => {
			clearTimeout(timeout)
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current)
			}
		}
	}, [text])

	// Разбиваем текст на строки для красивого отображения
	const lines = displayedText.split("\n")

	return (
		<Box fontFamily="'Inter', sans-serif" fontSize="sm" lineHeight="1.8">
			{lines.map((line, index) => {
				// Определяем тип строки для стилизации
				const isTitle = index === 0 && line.trim().length > 0
				const isSection = /^\[.*\]$/.test(line.trim()) || /^(Куплет|Припев|Verse|Chorus|Bridge|Outro|Intro)/i.test(line.trim())
				const isEmpty = line.trim() === ""

				return (
					<motion.div
						key={index}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.1 }}
					>
						<Text
							color={isTitle ? COLOR.kit.orange : isSection ? "yellow.400" : "gray.100"}
							fontWeight={isTitle ? "700" : isSection ? "600" : "400"}
							fontSize={isTitle ? "lg" : isSection ? "sm" : "sm"}
							mb={isEmpty ? 3 : 1}
							opacity={isSection ? 0.8 : 1}
							letterSpacing={isTitle ? "0.02em" : "normal"}
						>
							{line || "\u00A0"}
						</Text>
					</motion.div>
				)
			})}
			{/* Мигающий курсор */}
			{!isComplete && (
				<motion.span
					initial={{ opacity: 1 }}
					animate={{ opacity: [1, 0, 1] }}
					transition={{ duration: 0.8, repeat: Infinity }}
					style={{
						display: "inline-block",
						width: "2px",
						height: "1em",
						backgroundColor: COLOR.kit.orange,
						marginLeft: "2px",
						verticalAlign: "text-bottom",
					}}
				/>
			)}
		</Box>
	)
}

const EditingTextarea = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
	const ref = useRef<HTMLTextAreaElement>(null)
	const scrollContainerRef = useRef<HTMLElement | null>(null)
	const isResizingRef = useRef(false)

	// Находим ближайший скроллируемый контейнер
	useEffect(() => {
		if (ref.current) {
			let parent = ref.current.parentElement
			while (parent) {
				const style = window.getComputedStyle(parent)
				if (style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflow === 'auto' || style.overflow === 'scroll') {
					scrollContainerRef.current = parent
					break
				}
				parent = parent.parentElement
			}
		}
	}, [])

	useEffect(() => {
		if (ref.current && !isResizingRef.current) {
			isResizingRef.current = true
			
			// Сохраняем позицию скролла контейнера и курсора
			const scrollContainer = scrollContainerRef.current
			const scrollTop = scrollContainer?.scrollTop ?? 0
			const selectionStart = ref.current.selectionStart
			const selectionEnd = ref.current.selectionEnd
			
			// Сохраняем позицию элемента относительно viewport
			const textareaRect = ref.current.getBoundingClientRect()
			const containerRect = scrollContainer?.getBoundingClientRect()
			const relativeTop = containerRect ? textareaRect.top - containerRect.top + scrollTop : textareaRect.top
			
			// Изменяем высоту
			ref.current.style.height = "auto"
			const newHeight = ref.current.scrollHeight + "px"
			ref.current.style.height = newHeight
			
			// Восстанавливаем позицию после изменения высоты
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					if (ref.current) {
						// Восстанавливаем позицию курсора
						ref.current.setSelectionRange(selectionStart, selectionEnd)
						
						// Восстанавливаем позицию скролла, учитывая изменение высоты
						if (scrollContainer) {
							const newTextareaRect = ref.current.getBoundingClientRect()
							const newRelativeTop = newTextareaRect.top - containerRect!.top + scrollTop
							const heightDiff = newRelativeTop - relativeTop
							
							// Корректируем скролл, чтобы элемент оставался на том же месте
							scrollContainer.scrollTop = scrollTop - heightDiff
						}
						
						isResizingRef.current = false
					}
				})
			})
		}
	}, [value])

	return (
		<Textarea
			ref={ref}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			bg="transparent"
			border="none"
			_focus={{ boxShadow: "none", outline: "none" }}
			p={0}
			borderRadius="0"
			minH="300px"
			maxH="55vh"
			fontSize="sm"
			lineHeight="1.8"
			color="white"
			fontFamily="'Inter', sans-serif"
			resize="none"
			overflowY="auto"
		/>
	)
}

export const FastGenerateScreen = ({ onClose: _onClose }: { onClose: () => void }) => {
	const [prompt, setPrompt] = useState(() => {
		try {
			return localStorage.getItem(STORAGE_KEY_PROMPT) || ""
		} catch {
			return ""
		}
	})
	const [screen, setScreen] = useState<"form" | "params" | "loading">("form")
	const [isGenerated, setIsGenerated] = useState(() => {
		try {
			return localStorage.getItem(STORAGE_KEY_IS_GENERATED) === "true"
		} catch {
			return false
		}
	})
	const [generatedText, setGeneratedText] = useState<string>(() => {
		try {
			return localStorage.getItem(STORAGE_KEY_GENERATED_TEXT) || ""
		} catch {
			return ""
		}
	})
	const [generationMode, setGenerationMode] = useState<GenerationMode>("generate")
	const scenarioState = useGenerationScenario()
	const generationDraft = useGenerationDraft()
	const token = useStore(store, (state) => state.auth.token)
	const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false)
	const [isEditing, setIsEditing] = useState(false)
	const { loadTracks } = useTracks()
	const { getUser } = useAuth()
	
	const [userMessage, setUserMessage] = useState<string>(() => {
		try {
			return localStorage.getItem(STORAGE_KEY_USER_MESSAGE) || ""
		} catch {
			return ""
		}
	})

	useEffect(() => {
		if (!scenarioState || scenarioState.mode !== "text") {
			setGenerationScenario(createFastGenerationDraft())
		}
	}, [scenarioState])

	// Сохраняем сообщение пользователя
	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY_USER_MESSAGE, userMessage)
		} catch {
			// Ignore
		}
	}, [userMessage])

	// Сохраняем prompt и isGenerated в localStorage
	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY_PROMPT, prompt)
		} catch {
			// Ignore localStorage errors
		}
	}, [prompt])

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY_IS_GENERATED, isGenerated ? "true" : "false")
		} catch {
			// Ignore localStorage errors
		}
	}, [isGenerated])


	// Сохраняем сгенерированный текст в localStorage
	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY_GENERATED_TEXT, generatedText)
		} catch {
			// Ignore localStorage errors
		}
	}, [generatedText])

	// Используем ref для отслеживания изменений prompt извне
	const prevScenarioPromptRef = useRef<string | null>(null);

	useEffect(() => {
		// НЕ обновляем prompt если текст уже сгенерирован (он показывается отдельно)
		if (isGenerated) return;
		
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
	}, [scenarioState, isGenerated]);

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
			// Обновляем только если текст не был сгенерирован (иначе используем generatedText)
			if (!isGenerated) {
				setGenerationPrompt(value)
				patchFastScenario((draft) => ({
					...draft,
					prompt: value,
				}))
			}
		},
		[patchFastScenario, isGenerated]
	)


	const handleGenerateLyrics = useCallback(async () => {
		if (!prompt.trim()) {
			toaster.dismiss()
			toaster.create({
				type: "error",
				title: "Ошибка",
				description: "Введите описание для генерации текста",
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
		// Очищаем поле ввода после отправки, но сохраняем значение на случай ошибки
		const currentPrompt = prompt
		setUserMessage(currentPrompt) // Сохраняем сообщение пользователя для чата
		setPrompt("")
		
		try {
			// Создаем задачу генерации текста
			const response = await createLyricsGeneration(token, { prompt: currentPrompt, type: "suno" })
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
					// Сохраняем сгенерированный текст ТОЛЬКО для отображения в блоке
					// НЕ обновляем prompt/scenarioState - это вызовет вставку в поле ввода
					setGeneratedText(generatedLyrics)
					setIsGenerated(true)
					setIsGeneratingLyrics(false)
					toaster.dismiss()
					toaster.create({
						type: "success",
						title: "Текст сгенерирован!",
						description: "Нажмите ▶ для создания трека.",
					})
					} else if (status === "failed") {
						setIsGeneratingLyrics(false)
						toaster.dismiss()
						toaster.create({
							type: "error",
							title: "Ошибка генерации текста",
							description: "Генерация текста завершилась с ошибкой. Попробуйте ещё раз.",
						})
						return
					} else if (attempts < maxAttempts) {
						attempts++
						setTimeout(pollStatus, pollInterval)
					} else {
						throw new Error("Превышено время ожидания генерации текста")
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
			// Восстанавливаем промпт при ошибке, чтобы пользователь мог повторить попытку
			setPrompt(currentPrompt)
			
			const errorMessage = err instanceof Error ? err.message : "Не удалось сгенерировать текст"
			toaster.dismiss()
			toaster.create({
				type: "error",
				title: "Ошибка генерации текста",
				description: errorMessage,
			})
		}
	}, [prompt, token])

	const handleClearGenerated = useCallback(() => {
		setGeneratedText("")
		setIsGenerated(false)
		setUserMessage("")
		setIsEditing(false)
		try {
			localStorage.removeItem(STORAGE_KEY_GENERATED_TEXT)
			localStorage.removeItem(STORAGE_KEY_IS_GENERATED)
			localStorage.removeItem(STORAGE_KEY_USER_MESSAGE)
		} catch {
			// Ignore
		}
	}, [])

	// Компонент области чата
	const ChatArea = useMemo(() => {
		// Если нет сообщений, ничего не рендерим (показываем приветствие)
		if (!userMessage && !isGenerated && !isGeneratingLyrics) return null

		return (
			<VStack gap={6} w="full">

				{/* Ответ бота (Лоадер или Текст) */}
				{(isGeneratingLyrics || isGenerated) && (
					<Box w="full">
						{isGeneratingLyrics ? (
							<Box pl={2}>
								<TypingIndicator />
							</Box>
						) : (
							<AnimatePresence>
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.4 }}
								>
									<Box w="full" position="relative">
										{/* Header с кнопками действий */}
										<Flex justifyContent="space-between" alignItems="center" mb={4}>
											<Flex alignItems="center" gap={2}>
												<Box
													w={2}
													h={2}
													borderRadius="full"
													bg={isEditing ? "yellow.400" : "green.400"}
													animation={isEditing ? "none" : "pulse 2s infinite"}
												/>
												<Text fontSize="sm" color="gray.400" fontWeight="500">
													{isEditing ? "Редактирование" : "Сгенерированный текст"}
												</Text>
											</Flex>
											<Flex gap={2}>
												<IconButton
													aria-label={isEditing ? "Сохранить" : "Редактировать"}
													size="sm"
													onClick={() => setIsEditing(!isEditing)}
													bg="whiteAlpha.100"
													_hover={{ bg: "whiteAlpha.200", color: "white" }}
													color={isEditing ? "green.400" : "gray.400"}
													borderRadius="lg"
													transition="all 0.2s"
												>
													{isEditing ? <BsCheck2 size={20} /> : <BsPencil size={16} />}
												</IconButton>
												<CopyButton text={generatedText} />
												<IconButton
													aria-label="Закрыть"
													size="sm"
													onClick={handleClearGenerated}
													bg="whiteAlpha.100"
													_hover={{ bg: "red.500", color: "white" }}
													color="gray.400"
													borderRadius="lg"
													transition="all 0.2s"
												>
													<BsX size={20} />
												</IconButton>
											</Flex>
										</Flex>

										{/* Lyrics content */}
										<Box w="full">
											{isEditing ? (
												<EditingTextarea value={generatedText} onChange={setGeneratedText} />
											) : (
												<AnimatedLyrics text={generatedText} />
											)}
										</Box>

										{/* Кнопка "Превратить в трек" */}
										{!isEditing && (
											<Flex w="full" justifyContent="center" mt={6}>
												<Button
													size="lg"
													bg={COLOR.kit.orange}
													color="white"
													_hover={{ bg: COLOR.brand.orange700 }}
													_active={{ transform: "scale(0.98)" }}
													px={8}
													py={6}
													borderRadius="full"
													fontSize="md"
													fontWeight="600"
													transition="all 0.2s"
													onClick={() => setScreen("params")}
												>
													Превратить в трек
												</Button>
											</Flex>
										)}
									</Box>
								</motion.div>
							</AnimatePresence>
						)}
					</Box>
				)}
			</VStack>
		)
	}, [generatedText, isGenerated, handleClearGenerated, userMessage, isGeneratingLyrics, isEditing])

	// Определяем плейсхолдер в зависимости от режима
	const getPlaceholder = () => {
		switch (generationMode) {
			case "trust_trekopes":
				return "Опиши, какой трек тебе нужен…"
			case "custom_text":
				return "Напиши свой текст песни или опиши идею подробно…"
			case "generate":
				return "Опиши тему для генерации текста…"
			default:
				return "Опиши, какой трек тебе нужен…"
		}
	}

	// Определяем maxLength в зависимости от режима и состояния
	const getMaxLength = () => {
		if (isGenerated) return undefined
		if (generationMode === "custom_text") return 5000
		if (generationMode === "trust_trekopes") return 5000
		return 200
	}

	// Обработка отправки
	const handleSubmit = useCallback(() => {
		if (isGeneratingLyrics || screen !== "form") return

		// Для режима "generate":
		// Если введен текст (prompt не пустой), то мы генерируем новый текст (даже если уже есть сгенерированный)
		if (generationMode === "generate" && prompt.trim()) {
			handleGenerateLyrics()
			return
		}

		// Для остальных режимов - сразу на экран параметров
		if (generationMode === "trust_trekopes" || prompt.trim() || isGenerated) {
			setScreen("params")
		}
	}, [generationMode, isGenerated, prompt, isGeneratingLyrics, handleGenerateLyrics, screen])

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

					// Используем generatedText если текст был сгенерирован, иначе prompt
					const textToUse = isGenerated ? generatedText : prompt

					const updatedScenario = {
						...draft.scenario,
						prompt: textToUse,
					}

					const effectiveDraft: GenerationDraft = {
						...draft,
						prompt: textToUse,
						scenario: updatedScenario,
					}

					const basePayload = buildCreateGenerationRequest(effectiveDraft)
					
					// Если текст уже сгенерирован, извлекаем title и lyrics из текста
					// Или если режим "custom_text" - используем введенный текст как lyrics
					let payload: typeof basePayload & { skip_lyrics_generation?: boolean; lyrics?: string; title?: string } = { ...basePayload }
					
					if (generationMode === "custom_text" && prompt.trim()) {
						// Для режима "custom_text" используем введенный текст как lyrics
						payload = {
							...basePayload,
							skip_lyrics_generation: true,
							lyrics: prompt.trim(),
						}
					} else if (isGenerated && generatedText.trim()) {
						const lines = generatedText.trim().split('\n').filter(line => line.trim().length > 0)
						
						if (lines.length > 1) {
							// Первая непустая строка - название песни
							const title = lines[0].trim()
							// Остальной текст - lyrics
							const lyrics = lines.slice(1).join('\n').trim()
							
							payload = {
								...basePayload,
								skip_lyrics_generation: true,
								lyrics: lyrics || generatedText,
								title: title,
							}
						} else {
							// Если нет строк, используем весь текст как lyrics
							payload = {
								...basePayload,
								skip_lyrics_generation: true,
								lyrics: generatedText,
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
					
					// Очищаем localStorage после успешной генерации
					try {
						localStorage.removeItem(STORAGE_KEY_PROMPT)
						localStorage.removeItem(STORAGE_KEY_IS_GENERATED)
						localStorage.removeItem(STORAGE_KEY_GENERATED_TEXT)
					} catch {
						// Ignore localStorage errors
					}
					
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
		<VStack 
			gap={0} 
			w="full" 
			h="full"
			justifyContent="space-between"
		>
			{/* Верхняя часть: заголовок + контент (скроллируемая область) */}
			<VStack 
				gap={4} 
				w="full" 
				alignItems="stretch" 
				flex={1} 
				pb="130px" 
				overflowY="auto"
				css={{
					"&::-webkit-scrollbar": {
						width: "4px",
					},
					"&::-webkit-scrollbar-track": {
						background: "transparent",
					},
					"&::-webkit-scrollbar-thumb": {
						background: "rgba(255,255,255,0.1)",
						borderRadius: "2px",
					},
				}}
			>
				{/* Показываем приветствие только если чат пуст */}
				{!userMessage && !isGenerated && !isGeneratingLyrics && (
					<VStack gap={2} w="full" alignItems="flex-start">
						<Heading size="lg" color={COLOR.kit.white}>Песня по тексту</Heading>
						<Text color={COLOR.kit.smoke}>Опишите идею песни или вставьте готовый текст</Text>
					</VStack>
				)}
				
				{/* Область чата */}
				{ChatArea}
			</VStack>
			
			{/* Нижняя часть: поле ввода прикреплено к низу */}
			<VStack 
				gap={0} 
				w="full" 
				bottom={0}
				pb="env(safe-area-inset-bottom)"
			>
				<PromptInput
					value={prompt}
					onChange={handlePromptChange}
					onSubmit={handleSubmit}
					placeholder={getPlaceholder()}
					maxLength={getMaxLength()}
					mode={generationMode}
					onModeChange={(mode) => {
						setGenerationMode(mode)
						// Сбрасываем сгенерированный текст при смене режима
						if (mode !== "generate") {
							setGeneratedText("")
							setIsGenerated(false)
							setUserMessage("")
						}
					}}
					disabled={isGeneratingLyrics}
					isLoading={isGeneratingLyrics}
					allowEmptySubmit={isGenerated}
				/>
			</VStack>
			<Toaster />
		</VStack>
	);
};