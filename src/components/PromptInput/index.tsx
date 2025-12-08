import { useCallback, useRef, useEffect, useState } from "react"
import {
	Box,
	HStack,
	Text,
	Icon,
	Popover as ChakraPopover,
	Portal,
} from "@chakra-ui/react"
import { TbArrowUp, TbSparkles, TbPencil, TbWand, TbInfoCircle } from "react-icons/tb"
import { COLOR } from "../ui/colors"
import { cn } from "@/lib/utils"
import type { IconType } from "react-icons"
import { Settings2 } from "lucide-react"

// Режимы генерации
export type GenerationMode = "trust_trekopes" | "custom_text" | "generate"

export interface GenerationModeOption {
	value: GenerationMode
	label: string
	icon: IconType
	description?: string
}



interface PromptInputProps {
	value: string
	onChange: (value: string) => void
	onSubmit?: () => void
	placeholder?: string
	maxLength?: number
	mode: GenerationMode
	onModeChange: (mode: GenerationMode) => void
	disabled?: boolean
	isLoading?: boolean
	allowEmptySubmit?: boolean
	children?: React.ReactNode
}

export const PromptInput = ({
	value,
	onChange,
	onSubmit,
	placeholder = "Опиши, какой трек тебе нужен…",
	maxLength,
	mode,
	onModeChange,
	disabled = false,
	isLoading = false,
	allowEmptySubmit = false,
	children,
}: PromptInputProps) => {
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const [openPopoverId, setOpenPopoverId] = useState<string | null>(null)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const generationModeOptions: GenerationModeOption[] = [
				{ value: "trust_trekopes", label: "Довериться трекопсу", icon: TbSparkles, description: "ИИ сам придумает текст" },
		{ value: "custom_text", label: "Свой текст", icon: TbPencil, description: "Напишите свой текст песни" },
		{ value: "generate", label: "Сгенерировать текст", icon: TbWand, description: "ИИ сгенерирует по описанию" },
	]
	// Авто-ресайз textarea
	const adjustHeight = useCallback(() => {
		const textarea = textareaRef.current
		if (!textarea) return
		textarea.style.height = "auto"
		const minHeight = 24
		const maxHeight = 160
		const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)
		textarea.style.height = `${newHeight}px`
	}, [])

	useEffect(() => {
		adjustHeight()
	}, [value, adjustHeight])

	// Закрытие дропдауна при клике вне
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false)
			}
		}
		if (isDropdownOpen) {
			document.addEventListener("mousedown", handleClickOutside)
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [isDropdownOpen])

	// Закрываем по Escape
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsDropdownOpen(false)
			}
		}
		document.addEventListener("keydown", handleEscape)
		return () => document.removeEventListener("keydown", handleEscape)
	}, [])

	// Обработка клавиш
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
				e.preventDefault()
				onSubmit?.()
			}
		},
		[onSubmit]
	)

	const handleModeSelect = useCallback(
		(selectedMode: GenerationMode) => {
			onModeChange(selectedMode)
			setIsDropdownOpen(false)
		},
		[onModeChange]
	)

	const currentModeOption = generationModeOptions.find((opt) => opt.value === mode)
	const currentModeLabel = currentModeOption?.label || ""
	const CurrentModeIcon = currentModeOption?.icon

	const canSubmit = mode === "trust_trekopes" || value.trim().length > 0 || allowEmptySubmit

	return (
		<Box
			position="fixed"
			bottom={3}
			left="50%"
			transform="translateX(-50%)"
			zIndex={1000}
			w="95vw"
			maxW="600px"
			bg={COLOR.kit.darkGray}
			borderRadius="24px"
			border="1px solid rgba(115, 115, 115, 0.2)"
			transition="all 0.2s ease"
			_focusWithin={{
				borderColor: "rgba(243, 146, 4, 0.5)",
				boxShadow: "0 0 0 1px rgba(243, 146, 4, 0.3)",
			}}
		>
			{/* Textarea */}
			<Box px={4} pt={3} pb={12} position="relative">
				<textarea
					ref={textareaRef}
					value={value}
					onChange={(e) => {
						const newValue = e.target.value
						if (maxLength && newValue.length > maxLength) {
							onChange(newValue.slice(0, maxLength))
							return
						}
						onChange(newValue)
					}}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					disabled={disabled || isLoading}
					className={cn(
						"w-full resize-none bg-transparent text-white placeholder:text-[#737373]",
						"outline-none border-none",
						"text-[15px] leading-6",
						(disabled || isLoading) && "opacity-50 cursor-not-allowed"
					)}
					style={{
						minHeight: "24px",
						maxHeight: "200px",
						overflowY: "auto",
					}}
				/>
				{children}
			</Box>

			{/* Нижняя панель с кнопками */}
			<HStack
				position="absolute"
				bottom={0}
				left={0}
				right={0}
				px={3}
				py={2}
				justifyContent="space-between"
				alignItems="center"
			>
				{/* Левая часть: плюсик + лейбл */}
				<HStack gap={2} alignItems="center">
					{/* Кнопка настроек */}
					<Box ref={dropdownRef} position="relative">
						<Box
							as="button"
							w="32px"
							h="32px"
							display="flex"
							alignItems="center"
							justifyContent="center"
							bg={isDropdownOpen ? "rgba(243, 146, 4, 0.2)" : "rgba(115, 115, 115, 0.15)"}
							rounded="full"
							cursor="pointer"
							transition="all 0.2s ease"
							_hover={{ bg: "rgba(243, 146, 4, 0.25)" }}
							_active={{ transform: "scale(0.95)" }}
							onClick={() => !disabled && !isLoading && setIsDropdownOpen(!isDropdownOpen)}
							opacity={disabled || isLoading ? 0.5 : 1}
							pointerEvents={disabled || isLoading ? "none" : "auto"}
						>
							<Icon
								as={Settings2}
								boxSize={4}
								color={isDropdownOpen ? COLOR.kit.orange : COLOR.kit.white}
							/>
						</Box>

						{/* Dropdown */}
						{isDropdownOpen && (
							<Box
								position="absolute"
								bottom="calc(100% + 8px)"
								left={0}
								bg="#1c1c1c"
								borderRadius="14px"
								border="1px solid rgba(255, 255, 255, 0.08)"
								boxShadow="0 8px 40px rgba(0, 0, 0, 0.6)"
								minW="240px"
								zIndex={1000}
								overflow="hidden"
								p="6px"
								animation="fadeInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
								css={{
									"@keyframes fadeInUp": {
										from: { opacity: 0, transform: "translateY(8px) scale(0.96)" },
										to: { opacity: 1, transform: "translateY(0) scale(1)" },
									},
								}}
							>
								{generationModeOptions.map((option, index) => (
									<Box key={option.value}>
										<HStack
											as="button"
											w="full"
											gap={3}
											px={3}
											py={1}
											borderRadius="10px"
											bg={mode === option.value ? "rgba(243, 146, 4, 0.12)" : "transparent"}
											cursor="pointer"
											transition="all 0.15s ease"
											_hover={{
												bg: mode === option.value ? "rgba(243, 146, 4, 0.18)" : "rgba(255, 255, 255, 0.06)",
											}}
											onClick={() => handleModeSelect(option.value)}
										>
											<Box w="32px" h="32px" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
												<Icon as={option.icon} boxSize={4} color={mode === option.value ? COLOR.kit.orange : COLOR.kit.smoke} />
											</Box>
											<Text
												fontSize="sm"
												fontWeight="light"
												color={mode === option.value ? COLOR.kit.white : "rgba(255, 255, 255, 0.9)"}
												flex={1}
												textAlign="left"
											>
												{option.label}
											</Text>
											{option.description && (
												<ChakraPopover.Root
													open={openPopoverId === option.value}
													onOpenChange={(details) => setOpenPopoverId(details.open ? option.value : null)}
													positioning={{ placement: "top", gutter: 8 }}
												>
													<ChakraPopover.Trigger asChild>
														<Box
															w="24px"
															h="24px"
															display="flex"
															alignItems="center"
															justifyContent="center"
															rounded="full"
															cursor="pointer"
															onClick={(e) => {
																e.stopPropagation()
																setOpenPopoverId((prev) => (prev === option.value ? null : option.value))
															}}
														>
															<Icon as={TbInfoCircle} boxSize={4} color={COLOR.kit.smoke} />
														</Box>
													</ChakraPopover.Trigger>
													<Portal>
														<ChakraPopover.Positioner>
															<ChakraPopover.Content
																borderRadius="10px"
																border="1px solid rgba(255, 255, 255, 0.1)"
																boxShadow="0 8px 24px rgba(0, 0, 0, 0.5)"
																maxW="220px"
																p={3}
																css={{ "--popover-bg": COLOR.kit.darkGray }}
															>
																<ChakraPopover.Arrow>
																	<ChakraPopover.ArrowTip />
																</ChakraPopover.Arrow>
																<Text fontSize="11px" fontWeight="normal" color={COLOR.kit.smoke} lineHeight="1.4">
																	{option.description}
																</Text>
															</ChakraPopover.Content>
														</ChakraPopover.Positioner>
													</Portal>
												</ChakraPopover.Root>
											)}
										</HStack>
										{index < generationModeOptions.length - 1 && (
											<Box h="1px" bg="rgba(255, 255, 255, 0.06)" mx={3} my={1} />
										)}
									</Box>
								))}
							</Box>
						)}
					</Box>

					{/* Лейбл выбранного режима */}
					<HStack
						gap={1.5}
						px={3}
						py={1.5}
						bg="rgb(44, 19, 5)"
						rounded="full"
						cursor="pointer"
						transition="all 0.2s ease"
						_hover={{ bg: "rgba(115, 115, 115, 0.2)" }}
						onClick={() => !disabled && !isLoading && setIsDropdownOpen(!isDropdownOpen)}
					>
						{CurrentModeIcon && <Icon as={CurrentModeIcon} boxSize={3.5} color={COLOR.kit.orange} />}
						<Text fontSize="xs" fontWeight="medium" color={COLOR.kit.orange} whiteSpace="nowrap">
							{currentModeLabel}
						</Text>
					</HStack>
				</HStack>

				{/* Правая часть: счётчик + кнопка отправки */}
				<HStack gap={2} alignItems="center">
					{maxLength && (
						<Text fontSize="xs" color={value.length >= maxLength ? "red.400" : COLOR.kit.smoke}>
							{value.length}/{maxLength}
						</Text>
					)}
					<Box
						as="button"
						w="32px"
						h="32px"
						display="flex"
						alignItems="center"
						justifyContent="center"
						bg={canSubmit && !disabled && !isLoading ? COLOR.kit.orange : "rgba(115, 115, 115, 0.3)"}
						rounded="full"
						cursor={canSubmit && !disabled && !isLoading ? "pointer" : "not-allowed"}
						transition="all 0.2s ease"
						_hover={{
							bg: canSubmit && !disabled && !isLoading ? COLOR.brand.orange700 : "rgba(115, 115, 115, 0.3)",
							transform: canSubmit && !disabled && !isLoading ? "scale(1.05)" : "none",
						}}
						_active={{ transform: canSubmit && !disabled && !isLoading ? "scale(0.95)" : "none" }}
						onClick={() => canSubmit &&  onSubmit?.()}
						opacity={isLoading ? 0.7 : 1}
					>
						{isLoading ? (
							<Box
								w="14px"
								h="14px"
								borderRadius="full"
								border="2px solid"
								borderColor="white"
								borderTopColor="transparent"
								animation="spin 0.8s linear infinite"
								css={{
									"@keyframes spin": {
										from: { transform: "rotate(0deg)" },
										to: { transform: "rotate(360deg)" },
									},
								}}
							/>
						) : (
							<Icon as={TbArrowUp} boxSize={4} color={canSubmit ? "white" : COLOR.kit.smoke} strokeWidth={2.5} />
						)}
					</Box>
				</HStack>
			</HStack>
		</Box>
	)
}

export default PromptInput
