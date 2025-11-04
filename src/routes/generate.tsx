import { Popup } from '../components/Popup'
import { COLOR } from '../components/ui/colors'
import { Box, Flex, Heading, Text, Grid, GridItem, Icon, } from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { setDockActive } from '../store'
import { TextGenerateScreen } from '../components/Screens/TextGenerate'
import { LinkGenerate } from '../components/Screens/LinkGenerate'
import { IoCameraOutline } from 'react-icons/io5'
import { FaLink } from 'react-icons/fa'
import { BsFileText } from "react-icons/bs";
import { TbTextSize } from "react-icons/tb";
import { GiMusicalNotes } from "react-icons/gi";
import { PhotoGenerateScreen } from '../components/Screens/PhotoGenerate'
import { FMCarousel } from '../components/Slider'




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
const slides = [
    {id: 1, content: <Box w={"full"} h={"full"} bg={'whiteAlpha.300'} rounded={"2xl"} >Slider 1</Box>},
    {id: 1, content: <Box w={"full"} h={"full"} bg={'whiteAlpha.300'} rounded={"2xl"} >Slider 2</Box>},
    {id: 1, content: <Box w={"full"} h={"full"} bg={'whiteAlpha.300'} rounded={"2xl"} >Slider 3</Box>},
    {id: 1, content: <Box w={"full"} h={"full"} bg={'whiteAlpha.300'} rounded={"2xl"} >Slider 4</Box>},
    {id: 1, content: <Box w={"full"} h={"full"} bg={'whiteAlpha.300'} rounded={"2xl"} >Slider 5</Box>},
]

    return (
        <>
            <Flex
                flexDir={"column"}
                w={"full"}
                alignItems={"center"}
                gap={4}
                pt={4}
                pb={"11vh"}>
                    <FMCarousel 
                    height={200}
                    autoPlay
                    showArrows={false}
                    showDots={true}
                    slides={slides}
                    />
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
                            <Flex alignItems={"center"} justifyContent={"center"} flexShrink={0} w="110px" h="110px" bg={COLOR.kit.iconBg} borderRadius="2xl">
                                <Icon color={COLOR.kit.white} fontSize={"5xl"} children={<BsFileText />} />
                            </Flex>
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
                            <Flex alignItems={"center"} justifyContent={"center"} flexShrink={0} w="110px" h="110px" bg={COLOR.kit.iconBg} borderRadius="2xl">
                                <Icon color={COLOR.kit.white} fontSize={"5xl"} children={<IoCameraOutline />} />
                            </Flex>
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
                            <Flex alignItems={"center"} justifyContent={"center"} flexShrink={0} w="110px" h="110px" bg={COLOR.kit.iconBg} borderRadius="2xl">
                               <Icon color={COLOR.kit.white} fontSize={"4xl"} children={<FaLink />} />
                            </Flex>
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
                            <Flex alignItems={"center"} justifyContent={"center"} flexShrink={0} w="110px" h="110px" bg={COLOR.kit.iconBg} borderRadius="2xl">
                                <Icon color={COLOR.kit.white} fontSize={"5xl"} children={<GiMusicalNotes />} />
                            </Flex>
                            <Box>
                                <Heading size="xl">Песня по стилю</Heading>
                                <Text color={COLOR.kit.smoke} mt={1} fontSize="sm">Выбери сценарий и заполни анкету - получишь персональную песню</Text>

                            </Box>
                        </Flex>
                    </GridItem>
                    <GridItem
                        bg={COLOR.kit.darkGray}
                        p={"24px"}
                        borderRadius="2xl"
                        onClick={() => handleChangeType("style")}>
                        <Flex gap={4} alignItems="center">
                            <Flex alignItems={"center"} justifyContent={"center"} flexShrink={0} w="110px" h="110px" bg={COLOR.kit.iconBg} borderRadius="2xl">
                                <Icon color={COLOR.kit.white} fontSize={"5xl"} children={<TbTextSize />} />
                            </Flex>
                            <Box>
                                <Heading size="xl">Песня по тексту</Heading>
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
                { genType == 'link' && <LinkGenerate onClose={handleClosePopup} /> }
                { genType == 'photo' && <PhotoGenerateScreen onClose={handleClosePopup} /> }
            </Popup>
        </>
    )
}