import { Button, Heading, Text, Textarea, VStack } from "@chakra-ui/react"
import { useState } from "react"
import { COLOR } from "../../../components/ui/colors"
import { ProPayScreen } from "../ProPay"
import { useIsPro } from "../../../store/user"

export const FastGenerateScreen = ({ onClose: _onClose }: { onClose: () => void }) => {
	const [prompt, setPrompt] = useState("")
	const [screen, setScreen] = useState<"form" | "pro">("form")
	const isPro = useIsPro()

	if (screen === "pro" && !isPro) {
		return <ProPayScreen onBack={() => setScreen("form")} onPay={_onClose} />
	}

	return (
		<VStack gap={4} w="full" alignItems="stretch">
			<Heading size="lg" color={COLOR.kit.white}>Песня по тексту</Heading>
			<Text color={COLOR.kit.smoke}>Опишите идею песни или вставьте готовый текст</Text>
			<Textarea
				value={prompt}
				onChange={(e) => setPrompt(e.target.value)}
				placeholder="Например: лирический трек о ночном городе и надежде"
				minH="160px"
				bg={COLOR.kit.darkGray}
				color={COLOR.kit.white}
				borderRadius="2xl"
				resize="vertical"
				border="1px solid transparent"
				_focus={{ borderColor: COLOR.kit.orange, boxShadow: "none" }}
				_placeholder={{ color: COLOR.kit.smoke }}
			/>
			<Button
				w="full"
				h={12}
				borderRadius="xl"
				bg={COLOR.kit.orange}
				color={COLOR.kit.white}
				_disabled={{ opacity: 0.5, cursor: "not-allowed" }}
				_hover={{ bg: COLOR.brand.orange700 }}
				disabled={!prompt.trim()}
				onClick={() => {
					if (isPro) {
						_onClose()
					} else {
						setScreen("pro")
					}
				}}
			>
				Сгенерировать
			</Button>
		</VStack>
	);
};