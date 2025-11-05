import { VStack, Text, Image, Grid } from "@chakra-ui/react"
import { COLOR } from "../../ui/colors"
import { BrandButton, GrayButton } from "../../ui/button"
import logo from "../../../assets/img/pay_img.png"

type ProPayScreenProps = {
    onBack?: () => void
    onPay?: () => void
}

export const ProPayScreen = ({ onBack, onPay }: ProPayScreenProps) => {
    return (
        <VStack gap={3} w="full" alignItems="center" h={"full"} justifyContent={"center"}>
            <Text color={COLOR.kit.orangeWhite} fontSize={"28px"}>🎧 Всё готово!</Text>
            <VStack w={"70vw"} textAlign={"center"} >
            <Text color={COLOR.kit.white}></Text>
            <Text color={COLOR.kit.orangeWhite}>Данные сохранены, пёс в студии🐾<br /> Осталось оплатить PRO-тариф — и трек пойдёт в работу 🎶</Text>
            <Image src={logo} alt="logo" w="280px" h="280px" objectFit={"contain"} bg={"transparent"} />
            <Grid templateRows="1fr 1fr" gap={3} w="full" pt={4}>
                <BrandButton w="full" onClick={onPay}>💳 Оплатить PRO</BrandButton>
                <GrayButton w="full" onClick={onBack}>Назад</GrayButton>
            </Grid>
            </VStack>
        </VStack>
    )
}

