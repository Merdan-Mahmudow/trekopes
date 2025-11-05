import { VStack, Text } from "@chakra-ui/react"
import { COLOR } from "./ui/colors"
import { BrandButton } from "./ui/button"
import { useIsPro } from "../store/user"

export const ProPayFooter = () => {
    const isPro = useIsPro()
    if (isPro) return null

    return (
        <VStack gap={3} w="full" alignItems="stretch" mt={4} textAlign="center">
            <Text fontSize="20px" color={COLOR.kit.orangeWhite}>🎧 Всё готово!</Text>
            <Text color={COLOR.kit.white}>Данные сохранены, пёс в студии, хвост на микшере 🐾</Text>
            <Text color={COLOR.kit.orangeWhite}>Осталось оплатить PRO-тариф — и трек пойдёт в работу 🎶</Text>
            <BrandButton w="full">💳 Оплатить PRO</BrandButton>
        </VStack>
    )
}

