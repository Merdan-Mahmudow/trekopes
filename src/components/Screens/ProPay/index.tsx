import { VStack, Text, Image, Grid, Box, Heading, Icon } from "@chakra-ui/react"
import { COLOR } from "../../ui/colors"
import { BrandButton, GrayButton } from "../../ui/custom-button"
import { Container } from "../../ui/container"
import { FaArrowRight } from "react-icons/fa"

type ProPayScreenProps = {
    onBack?: () => void
    onPay?: () => void
}

export const ProPayScreen = ({ onBack, onPay }: ProPayScreenProps) => {
    return (
        <Container 
            maxW="lg" 
            centerContent 
            h="full" 
            py={{ base: 6, md: 8, lg: 10 }}
            px={{ base: 4, md: 6 }}
        >
            <VStack 
                gap={{ base: 4, md: 6 }} 
                w="full" 
                alignItems="center" 
                justifyContent="center"
                maxW={{ base: "100%", md: "600px" }}
            >
                {/* Заголовок с адаптивным размером */}
                <Heading
                    as="h1"
                    color={COLOR.kit.orangeWhite}
                    fontSize={{ base: "1.75rem", md: "2rem", lg: "2.25rem" }}
                    fontWeight={600}
                    lineHeight={1.25}
                    textAlign="center"
                    wordBreak="break-word"
                    overflowWrap="break-word"
                >
                    🎧 Всё готово!
                </Heading>

                {/* Контент с адаптивной шириной */}
                <VStack 
                    w="full"
                    maxW={{ base: "90vw", sm: "80vw", md: "70vw", lg: "600px" }}
                    textAlign="center"
                    gap={{ base: 4, md: 5 }}
                >
                    {/* Описание с адаптивным размером и переносами */}
                    <Text 
                        color={COLOR.kit.orangeWhite}
                        fontSize={{ base: "0.9375rem", md: "1.0625rem", lg: "1.125rem" }}
                        lineHeight={1.6}
                        maxW="65ch"
                        mx="auto"
                        wordBreak="break-word"
                        overflowWrap="break-word"
                    >
                        Данные сохранены, пёс в студии🐾
                        <br />
                        Осталось оплатить PRO-тариф — и трек пойдёт в работу 🎶
                    </Text>

                    {/* Изображение с адаптивными размерами */}
                    <Box
                        w="full"
                        maxW={{ base: "240px", sm: "280px", md: "320px" }}
                        aspectRatio="1/1"
                        position="relative"
                    >
                        <Image 
                            src={"/pay_img.PNG"} 
                            alt="Иллюстрация оплаты PRO-тарифа" 
                            w="100%"
                            h="100%"
                            objectFit="contain"
                            bg="transparent"
                            loading="eager"
                            decoding="async"
                        />
                    </Box>

                    {/* Кнопки с адаптивной сеткой */}
                    <Grid 
                        templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
                        gap={{ base: 3, md: 4 }}
                        w="full"
                        pt={{ base: 2, md: 4 }}
                    >
                        <BrandButton 
                            w="full" 
                            onClick={onPay}
                        >
                            К тарифам <Icon as={FaArrowRight} size={"sm"} pos={"relative"} top={"2px"} />
                        </BrandButton>
                        <GrayButton 
                            w="full" 
                            onClick={onBack}
                        >
                            Назад
                        </GrayButton>
                    </Grid>
                </VStack>
            </VStack>
        </Container>
    )
}

