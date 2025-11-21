import { Popup } from '../components/Popup'
import { COLOR } from '../components/ui/colors'
import { Box, Flex, Heading, Text, Grid, GridItem, Icon, } from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, type ReactNode } from 'react'
import { setDockActive } from '../store'
import { TextGenerateScreen } from '../components/Screens/TextGenerate'
import { LinkGenerate } from '../components/Screens/LinkGenerate'
// import { IoCameraOutline } from 'react-icons/io5'
import { GiMusicalNotes } from "react-icons/gi";
import { BsFileText } from "react-icons/bs";
import { TbTextSize } from "react-icons/tb";
import { PhotoGenerateScreen } from '../components/Screens/PhotoGenerate'
import FMCarousel from '../components/Slider'
import { StyleGenerateScreen } from '../components/Screens/StyleGenerate'
import { FastGenerateScreen } from '../components/Screens/FastGenerate'
import {
    resetGenerationDraft,
    setGenerationScenario,
    setGenerationType,
} from '../store/generation'
import {
    createFastGenerationDraft,
    createLinkGenerationDraft,
    createPhotoGenerationDraft,
    createStyleGenerationDraft,
    createTextGenerationDraft,
} from '../types/generation'
import type { SongGenerationType } from '../types/webapp'
import { useIsPro } from '../store/user'
import { toaster } from '../components/ui/toaster'




export const Route = createFileRoute('/generate')({
    component: RouteComponent,
})

// --- Конец компонента Итоги ответов ---
type GenerationCardType = "scenario" | "photo" | "link" | "style" | "text"

function RouteComponent() {
    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)
    const [ genType, setGenType ] = useState<GenerationCardType | null>("text")
    const isPro = useIsPro()


    useEffect(() => {
        setDockActive("center")
    }, [])

    // При закрытии поп-апа, сбрасываем состояние
    const handleClosePopup = () => {
        setIsPopupOpen(false);
    }

    const handleChangeType = (type: GenerationCardType | null) => {
        if (!type) {
            return;
        }

        if (!isPro && type !== "text") {
            toaster.create({
                type: "info",
                title: "Только для PRO",
                description: "Эта генерация доступна в подписке PRO",
            })
            return;
        }

        const typeToGenerationMap: Record<Exclude<typeof type, null>, SongGenerationType> = {
            scenario: "scenario",
            photo: "photo",
            link: "link",
            style: "style",
            text: "text",
        };

        const scenarioFactory = {
            scenario: createTextGenerationDraft,
            photo: createPhotoGenerationDraft,
            link: createLinkGenerationDraft,
            style: createStyleGenerationDraft,
            text: createFastGenerationDraft,
        } as const;

        resetGenerationDraft();
        setGenerationType(typeToGenerationMap[type]);
        setGenerationScenario(scenarioFactory[type]());

        setGenType(type);
        setIsPopupOpen(true);
    } 
// const slides = [
//     {id: 1, content: <Box w={"full"} h={"full"} bg={'whiteAlpha.300'} rounded={"2xl"} >Slider 1</Box>},
//     {id: 1, content: <Box w={"full"} h={"full"} bg={'whiteAlpha.300'} rounded={"2xl"} >Slider 2</Box>},
//     {id: 1, content: <Box w={"full"} h={"full"} bg={'whiteAlpha.300'} rounded={"2xl"} >Slider 3</Box>},
//     {id: 1, content: <Box w={"full"} h={"full"} bg={'whiteAlpha.300'} rounded={"2xl"} >Slider 4</Box>},
//     {id: 1, content: <Box w={"full"} h={"full"} bg={'whiteAlpha.300'} rounded={"2xl"} >Slider 5</Box>},
// ]

    const cards: Array<{
        type: GenerationCardType;
        title: string;
        description: string;
        icon: ReactNode;
        iconSize: '4xl' | '5xl';
        requiresPro: boolean;
    }> = [
        {
            type: 'text' as const,
            title: 'Песня по тексту',
            description: 'Опиши идею или вставь готовый текст — трек готов!',
            icon: <TbTextSize />,
            iconSize: '5xl' as const,
            requiresPro: false,
        },
        {
            type: 'scenario' as const,
            title: 'Песня по сценарию',
            description: 'Выбери сценарий и заполни анкету - получишь персональную песню',
            icon: <BsFileText />,
            iconSize: '5xl' as const,
            requiresPro: true,
        },
        // {
        //     type: 'photo' as const,
        //     title: 'Песня по фото',
        //     description: 'Сфотографируй человека, место или предмет — получишь уникальный трек',
        //     icon: <IoCameraOutline />,
        //     iconSize: '5xl' as const,
        //     requiresPro: true,
        // },
        // {
        //     type: 'link' as const,
        //     title: 'Песня по ссылке',
        //     description: 'Вставь ссылку на VK-профиль — я изучу и напишу песню',
        //     icon: <FaLink />,
        //     iconSize: '4xl' as const,
        //     requiresPro: true,
        // },
        {
            type: 'style' as const,
            title: 'Песня по артисту',
            description: 'Выбери артиста',
            icon: <GiMusicalNotes />,
            iconSize: '5xl' as const,
            requiresPro: true,
        },
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
                    />
                <Text w={"11/12"} fontSize={"24px"} color={COLOR.kit.orangeWhite}>Создать трек</Text>
                <Grid templateColumns="1fr"
                    gap={2}
                    w="11/12"
                    overflow={"auto"}>
                    {cards.map((card, idx) => {
                        const isLocked = !isPro && card.requiresPro
                        return (
                        <GridItem
                            key={idx}
                            bg={COLOR.kit.darkGray}
                            p={"24px"}
                            borderRadius="2xl"
                            opacity={isLocked ? 0.6 : 1}
                            position="relative"
                            cursor={isLocked ? "not-allowed" : "pointer"}
                            onClick={() => handleChangeType(card.type)}>
                            <Flex gap={4}>
                                <Flex alignItems={"center"} justifyContent={"center"} flexShrink={0} w="110px" h="110px" bg={COLOR.kit.iconBg} borderRadius="2xl">
                                    <Icon color={COLOR.kit.white} fontSize={card.iconSize} children={card.icon} />
                                </Flex>
                                <Box>
                                    <Heading>{card.title}</Heading>
                                    <Text color={COLOR.kit.smoke} mt={1} fontSize="sm">{card.description}</Text>
                                    {isLocked && (
                                        <Text color={COLOR.kit.orange} fontSize="sm" mt={2}>
                                            Доступно только в PRO
                                        </Text>
                                    )}
                                </Box>
                            </Flex>
                        </GridItem>
                        )
                    })}
                </Grid>
            </Flex>

            <Popup
                open={isPopupOpen}
                title=""
                onOpenChange={handleClosePopup}
            >
                { genType == 'scenario' && <TextGenerateScreen /> }
                { genType == 'link' && <LinkGenerate onClose={handleClosePopup} /> }
                { genType == 'photo' && <PhotoGenerateScreen onClose={handleClosePopup} /> }
                { genType == 'style' && <StyleGenerateScreen onClose={handleClosePopup} /> }
                { genType == 'text' && <FastGenerateScreen onClose={handleClosePopup} /> }
            </Popup>
        </>
    )
}