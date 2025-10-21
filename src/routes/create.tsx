import { Text, Grid, GridItem, VStack, Box, Button } from '@chakra-ui/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import '../style/fonts.css'

import {  BsMagic, BsPeople } from "react-icons/bs";
import { LuBaby } from "react-icons/lu";
import { RiHomeHeartLine, RiShieldStarLine } from "react-icons/ri";
import { FaRegFaceSmile } from "react-icons/fa6";
import { TbHeartBroken, TbHeart, TbConfetti} from "react-icons/tb";
import { COLOR } from '../components/ui/colors';
import { PawIcon } from '../assets/svg/paw';
import { useState } from 'react';

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
type ChangeButtonProps = {
    icon: any,
    title: string,
    category: 'self' | 'friend' | 'broken-heart' | 'love' | 'relation' | 'baby' | 'hero' | 'congrats' | 'others',
    onClick?: () => void,
    isSelected?: boolean
}
const ChangeButton = ({ icon, title, category, onClick, isSelected }: ChangeButtonProps) => {
    return (
        <Button
            py={buttonStyle.py}
            justifyContent={buttonStyle.justifyContent}
            w={buttonStyle.w}
            className={buttonStyle.className}
            fontSize={buttonStyle.fontSize}
            bg={isSelected ? "rgba(57,139,216,0.35)" : buttonStyle.bg}
            mixBlendMode={buttonStyle.mixBlendMode}
            backdropFilter={buttonStyle.backdropFilter}
            boxShadow={buttonStyle.boxShadow}
            color={buttonStyle.color}
            rounded={buttonStyle.rounded}
            border={buttonStyle.border}
            onClick={onClick}
        >
            {icon} {title} {category}
        </Button>
    )
}

function RouteComponent() {
    // const categories = ['self', 'friend', 'broken-heart', 'love', 'relation', 'baby', 'hero', 'congrats', 'others']
    const [selectedCategory, setSelectedCategory] = useState< 'self' | 'friend' | 'broken-heart' | 'love' | 'relation' | 'baby' | 'hero' | 'congrats' | 'others' | null>(null);
    
    const buttonData: ChangeButtonProps[] = [
        { icon: <FaRegFaceSmile style={{ marginRight: "7px" }} />, title: "Про себя", category: 'self' },
        { icon: <BsPeople style={{ marginRight: "7px" }} />, title: "Для друзей и для коллег", category: 'friend' },
        { icon: <TbHeartBroken style={{ marginRight: "7px" }} />, title: "Для разбитого сердца", category: 'broken-heart' },
        { icon: <TbHeart style={{ marginRight: "7px" }} />, title: "Для любимого человека", category: 'love' },
        { icon: <RiHomeHeartLine style={{ marginRight: "7px" }} />, title: "Для близких", category: 'relation' },
        { icon: <LuBaby style={{ marginRight: "7px" }} />, title: "Про ребёнка", category: 'baby' },
        { icon: <RiShieldStarLine style={{ marginRight: "7px" }} />, title: "О герое или солдате", category: 'hero' },
        { icon: <TbConfetti style={{ marginRight: "7px" }} />, title: "Для поздравления", category: 'congrats' },
        { icon: <BsMagic style={{ marginRight: "7px" }} />, title: "Другое", category: 'others' },
    ];

    return <>

        <VStack
            p={3}
            pb={10}
            alignItems={"start"}
            w={"100vw"}>
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
                {buttonData.map((button) => (
                    <GridItem key={button.title}>
                        <ChangeButton
                            icon={button.icon}
                            title={button.title}
                            category={button.category}
                            isSelected={selectedCategory === button.category}
                            onClick={() => setSelectedCategory(button.category)}
                        />
                    </GridItem>
                ))}
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
                rounded={buttonStyle.rounded}
                className={buttonStyle.className}
                fontWeight={"bold"}
                letterSpacing={2}
                border={buttonStyle.border}>
                    <Link to="/generate">Назад</Link>
                </Button>
                <Button
                color={COLOR.text.primary}
                bg={COLOR.brand.orange}
                rounded={buttonStyle.rounded}
                className={buttonStyle.className}
                fontWeight={"bold"}
                letterSpacing={2}
                justifyContent={"center"}
                disabled={selectedCategory === null}>
                    {selectedCategory ? (
                        <Link to="/question" search={{ category: selectedCategory }}>
                            Далее — 1 <Box as="span" mb={1} ml={-1}><PawIcon fill={COLOR.text.primary} size={"14"}/></Box>
                        </Link>
                    ) : (
                        <>Далее — 1 <Box as="span" mb={1} ml={-1}><PawIcon fill={COLOR.text.primary} size={"14"}/></Box></>
                    )}
                </Button>
            </Grid>
        </VStack>



    </>
}
