import { Text, Grid, GridItem, VStack, Box, Button, For, HStack, Span } from '@chakra-ui/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import '../style/fonts.css'

import { BsMagic, BsPeople } from "react-icons/bs";
import { LuBaby } from "react-icons/lu";
import { RiHomeHeartLine, RiShieldStarLine } from "react-icons/ri";
import { FaRegFaceSmile } from "react-icons/fa6";
import { TbHeartBroken, TbHeart, TbConfetti } from "react-icons/tb";
import { COLOR } from '../components/ui/colors';
import { PawIcon } from '../assets/svg/paw';

export const Route = createFileRoute('/create')({
    component: RouteComponent,
})

const buttonStyle = {
    py: "22px",
    justifyContent: "flex-start",
    w: 'full',
    className: "font-doloman",
    fontSize: "13pt",
    bg: { _focus: "rgba(220, 155, 75, 0.7)", base: "rgba(57, 139, 216, 0.1)" },
    mixBlendMode: "difference",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    color: "white",
    rounded: "2xl",
    border: "1px solid rgba(255, 255, 255, 0.4)"
}

const ChangeButton = ({ icon, title }: { icon: any, title: string }) => {
    return <Button
        py={buttonStyle.py}
        justifyContent={buttonStyle.justifyContent}
        w={buttonStyle.w}
        className={buttonStyle.className}
        fontSize={buttonStyle.fontSize}
        bg={buttonStyle.bg}
        mixBlendMode={buttonStyle.mixBlendMode}
        backdropFilter={buttonStyle.backdropFilter}
        boxShadow={buttonStyle.boxShadow}
        color={buttonStyle.color}
        rounded={buttonStyle.rounded}
        border={buttonStyle.border}>{icon} {title}</Button>
}

function RouteComponent() {
    const buttonData = [
        { icon: <FaRegFaceSmile style={{ marginRight: "7px" }} />, title: "Про себя" },
        { icon: <BsPeople style={{ marginRight: "7px" }} />, title: "Для друзей и для коллег" },
        { icon: <TbHeartBroken style={{ marginRight: "7px" }} />, title: "Для разбитого сердца" },
        { icon: <TbHeart style={{ marginRight: "7px" }} />, title: "Для любимого человека" },
        { icon: <RiHomeHeartLine style={{ marginRight: "7px" }} />, title: "Для близких" },
        { icon: <LuBaby style={{ marginRight: "7px" }} />, title: "Про ребёнка" },
        { icon: <RiShieldStarLine style={{ marginRight: "7px" }} />, title: "О герое или солдате" },
        { icon: <TbConfetti style={{ marginRight: "7px" }} />, title: "Для поздравления" },
        { icon: <BsMagic style={{ marginRight: "7px" }} />, title: "Другое" },
    ];

    return <>

        <VStack
            p={3}
            alignItems={"start"}
            w={"100vw"}
            overflow={"hidden"}>
            <Box
                mt={12}
                w={"full"}
                textAlign={"center"}>
                <Text
                    fontSize={"2xl"}
                    textTransform={"uppercase"}
                    className='font-bicubic'
                    letterSpacing={3}
                    textShadow={"0 1px 10px rgba(255, 255, 255, 0.92)"}>Создать трек
                </Text>
                <Text
                    textTransform={"uppercase"}
                    letterSpacing={2}
                    className='font-doloman'
                    color={"gray.300"}
                    fontSize={"12pt"}>о чем будет песня
                </Text>
            </Box>
            <Text
                fontSize={"lg"}
                pt={5}
                textTransform={"uppercase"}
                className='font-bicubic'
                letterSpacing={1}
                textAlign={"center"}
                w={"full"}
            >
                Выберите тему трека
            </Text>

            <Grid
                pt={1}
                px={"5"}
                gap={4}
                w={"full"}
            >
                <For each={buttonData}>
                    {(button) => (
                        <GridItem key={button.title}>
                            <ChangeButton icon={button.icon} title={button.title} />
                        </GridItem>
                    )}
                </For>
            </Grid>
            <Grid
            templateColumns={"130px 1fr"}
            justifyContent={"center"}
            w={"full"}
            gap={5}
            px={5}
            pt={4}>
                <Button
                color={COLOR.text.primary}
                bg={COLOR.bg.surface800}
                rounded={buttonStyle.rounded}
                className={buttonStyle.className}
                fontWeight={"bold"}
                letterSpacing={2}
                border={buttonStyle.border}>
                    <Link to="/">Назад</Link>
                </Button>
                <Button
                color={COLOR.text.primary}
                bg={COLOR.brand.orange}
                rounded={buttonStyle.rounded}
                className={buttonStyle.className}
                fontWeight={"bold"}
                letterSpacing={2}
                justifyContent={"flex-center"}>
                    Далее — 1 <Span mb={1} ml={-1}><PawIcon fill={COLOR.text.primary} size={"14"}/></Span>
                </Button>
            </Grid>
        </VStack>



    </>
}
