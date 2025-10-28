import { Popup } from '../components/Popup'
import { COLOR } from '../components/ui/colors'
import { Box, Flex, Heading, Text, Grid, GridItem, } from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { setDockActive } from '../store'
import { TextGenerateScreen } from '../components/Screens/TextGenerate'
import { LinkGenerate } from '../components/Screens/LinkGenerate'
import { PhotoGenerateScreen } from '../components/Screens/PhotoGenerate'

export const Route = createFileRoute('/generate')({
    component: RouteComponent,
})

// --- Конец компонента Итоги ответов ---
function RouteComponent() {
    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)
    const [ genType, setGenType ] = useState<"text" | "photo"| "link" | "style" | null>("text")


    useEffect(() => {
        setDockActive("center")
    }, [])

    // При закрытии поп-апа, сбрасываем состояние
    const handleClosePopup = () => {
        setIsPopupOpen(false);
    }

    const handleChangeType = (type: "text" | "photo"| "link" | "style" | null) => {
        setIsPopupOpen(true)
        setGenType(type)
    } 


    return (
        <>
            <Flex
                flexDir={"column"}
                w={"full"}
                alignItems={"center"}
                gap={4}>
                <Text w={"11/12"} fontSize={"24px"} color={COLOR.kit.orangeWhite}>Создать трек</Text>
                <Grid templateColumns="1fr"
                    gap={2}
                    w="11/12"
                    overflow={"auto"}>
                    <GridItem
                        bg={COLOR.kit.darkGray}
                        p={"24px"}
                        borderRadius="2xl"
                        onClick={ () => handleChangeType("text")}>
                        <Flex gap={4} alignItems="center">
                            <Box flexShrink={0} w="110px" h="110px" bg="gray.700" borderRadius="md">
                                {/* Placeholder for image */}
                            </Box>
                            <Box>
                                <Heading size="xl">Песня по сценарию</Heading>
                                <Text color={COLOR.kit.smoke} mt={1} fontSize="sm">Выбери сценарий и заполни анкету - получишь персональную песню</Text>

                            </Box>
                        </Flex>
                    </GridItem>

                    <GridItem
                        bg={COLOR.kit.darkGray}
                        p={"24px"}
                        borderRadius="2xl"
                        onClick={() => handleChangeType('photo')}>
                        <Flex gap={4} alignItems="center">
                            <Box flexShrink={0} w="110px" h="110px" bg="gray.700" borderRadius="md">
                                {/* Placeholder for image */}
                            </Box>
                            <Box>
                                <Heading size="xl">Песня по фото</Heading>
                                <Text color={COLOR.kit.smoke} mt={1} fontSize="sm">Сфотографируйте человека, место или предмет - Трекопес напишет трек</Text>
                            </Box>
                        </Flex>
                    </GridItem>

                    <GridItem
                        bg={COLOR.kit.darkGray}
                        p={"24px"}
                        borderRadius="2xl"
                        onClick={() => handleChangeType("link")}>
                        <Flex gap={4} alignItems="center">
                            <Box flexShrink={0} w="110px" h="110px" bg="gray.700" borderRadius="md">
                                {/* Placeholder for image */}
                            </Box>
                            <Box>
                                <Heading size="xl">Песня по ссылке</Heading>
                                <Text color={COLOR.kit.smoke} mt={1} fontSize="sm">Кидай ссылку на свой профиль в ВК или профиль друга - я все изучу и сделаю песню</Text>
                            </Box>
                        </Flex>
                    </GridItem>
                    <GridItem
                        bg={COLOR.kit.darkGray}
                        p={"24px"}
                        borderRadius="2xl"
                        onClick={() => handleChangeType("style")}>
                        <Flex gap={4} alignItems="center">
                            <Box flexShrink={0} w="110px" h="110px" bg="gray.700" borderRadius="md">
                                {/* Placeholder for image */}
                            </Box>
                            <Box>
                                <Heading size="xl">Песня по сценарию</Heading>
                                <Text color={COLOR.kit.smoke} mt={1} fontSize="sm">Выбери сценарий и заполни анкету - получишь персональную песню</Text>

                            </Box>
                        </Flex>
                    </GridItem>
                </Grid>
            </Flex>

            <Popup
                open={isPopupOpen}
                title=""
                onOpenChange={handleClosePopup}
            >
                { genType == 'text' && <TextGenerateScreen /> }
                { genType == 'link' && <LinkGenerate /> }
                { genType == 'photo' && <PhotoGenerateScreen onClose={handleClosePopup} /> }
            </Popup>
        </>
    )
}