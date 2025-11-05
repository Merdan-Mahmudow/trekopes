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
import { StyleGenerateScreen } from '../components/Screens/StyleGenerate'
import { FastGenerateScreen } from '../components/Screens/FastGenerate'




export const Route = createFileRoute('/generate')({
    component: RouteComponent,
})

// --- Конец компонента Итоги ответов ---
function RouteComponent() {
    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)
    const [ genType, setGenType ] = useState<"text" | "photo"| "link" | "style" | "fast" | null>("text")


    useEffect(() => {
        setDockActive("center")
    }, [])

    // При закрытии поп-апа, сбрасываем состояние
    const handleClosePopup = () => {
        setIsPopupOpen(false);
    }

    const handleChangeType = (type: "text" | "photo"| "link" | "style" | "fast" | null) => {
        setIsPopupOpen(true);
        setGenType(type);
    } 
const slides = [
    {id: 1, content: <Box w={"full"} h={"full"} bg={'whiteAlpha.300'} rounded={"2xl"} >Slider 1</Box>},
    {id: 1, content: <Box w={"full"} h={"full"} bg={'whiteAlpha.300'} rounded={"2xl"} >Slider 2</Box>},
    {id: 1, content: <Box w={"full"} h={"full"} bg={'whiteAlpha.300'} rounded={"2xl"} >Slider 3</Box>},
    {id: 1, content: <Box w={"full"} h={"full"} bg={'whiteAlpha.300'} rounded={"2xl"} >Slider 4</Box>},
    {id: 1, content: <Box w={"full"} h={"full"} bg={'whiteAlpha.300'} rounded={"2xl"} >Slider 5</Box>},
]

    const cards = [
        {
            type: 'text' as const,
            title: 'Песня по сценарию',
            description: 'Выбери сценарий и заполни анкету - получишь персональную песню',
            icon: <BsFileText />,
            iconSize: '5xl' as const,
        },
        {
            type: 'photo' as const,
            title: 'Песня по фото',
            description: 'Сфотографируйте человека, место или предмет - Трекопес напишет трек',
            icon: <IoCameraOutline />,
            iconSize: '5xl' as const,
        },
        {
            type: 'link' as const,
            title: 'Песня по ссылке',
            description: 'Кидай ссылку на свой профиль в ВК или профиль друга - я все изучу и сделаю песню',
            icon: <FaLink />,
            iconSize: '4xl' as const,
        },
        {
            type: 'style' as const,
            title: 'Песня по стилю',
            description: 'Выбери сценарий и заполни анкету - получишь персональную песню',
            icon: <GiMusicalNotes />,
            iconSize: '5xl' as const,
        },
        {
            type: 'fast' as const,
            title: 'Песня по тексту',
            description: 'Выбери сценарий и заполни анкету - получишь персональную песню',
            icon: <TbTextSize />,
            iconSize: '5xl' as const,
        },
    ] as const

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
                    {cards.map((card, idx) => (
                        <GridItem
                            key={idx}
                            bg={COLOR.kit.darkGray}
                            p={"24px"}
                            borderRadius="2xl"
                            onClick={() => handleChangeType(card.type)}>
                            <Flex gap={4} alignItems="center">
                                <Flex alignItems={"center"} justifyContent={"center"} flexShrink={0} w="110px" h="110px" bg={COLOR.kit.iconBg} borderRadius="2xl">
                                    <Icon color={COLOR.kit.white} fontSize={card.iconSize} children={card.icon} />
                                </Flex>
                                <Box>
                                    <Heading>{card.title}</Heading>
                                    <Text color={COLOR.kit.smoke} mt={1} fontSize="sm">{card.description}</Text>
                                </Box>
                            </Flex>
                        </GridItem>
                    ))}
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
                { genType == 'style' && <StyleGenerateScreen onClose={handleClosePopup} /> }
                { genType == 'fast' && <FastGenerateScreen onClose={handleClosePopup} /> }
            </Popup>
        </>
    )
}