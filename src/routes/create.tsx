import { Text, Grid, GridItem, VStack, Box, Button } from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'
import '../style/fonts.css'

export const Route = createFileRoute('/create')({
    component: RouteComponent,
})

function RouteComponent() {
    return <>

        <VStack
            p={3}
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
                pt={8}
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
            columns={2}
            gap={4}
            w={"full"}
            >
            <GridItem>
                <Button
                py={"6"}
                w={'full'}
                className="font-doloman"
                fontSize={"13pt"}
                bg={{_focus: "rgba(220, 155, 75, 0.7)", base: "rgba(255, 255, 255, 0.1)"}}
                mixBlendMode={"difference"}
                backdropFilter={"blur(10px)"}
                boxShadow={"0 4px 12px rgba(0, 0, 0, 0.2)"}
                color={"white"}
                rounded={"full"}
                border={"1px solid rgba(255, 255, 255, 0.4)"}>Про себя</Button>
            </GridItem>
            <GridItem>
                <Button
                py={"6"}
                w={'full'}
                className="font-doloman"
                fontSize={"13pt"}
                bg={{_focus: "rgba(220, 155, 75, 0.7)", base: "rgba(255, 255, 255, 0.1)"}}
                mixBlendMode={"difference"}
                backdropFilter={"blur(10px)"}
                boxShadow={"0 4px 12px rgba(0, 0, 0, 0.2)"}
                color={"white"}
                rounded={"full"}
                border={"1px solid rgba(255, 255, 255, 0.4)"}>Для друзей и для коллег</Button>
            </GridItem>
            <GridItem>
                <Button
                py={"6"}
                w={'full'}
                className="font-doloman"
                fontSize={"13pt"}
                bg={{_focus: "rgba(220, 155, 75, 0.7)", base: "rgba(255, 255, 255, 0.1)"}}
                mixBlendMode={"difference"}
                backdropFilter={"blur(10px)"}
                boxShadow={"0 4px 12px rgba(0, 0, 0, 0.2)"}
                color={"white"}
                rounded={"full"}
                border={"1px solid rgba(255, 255, 255, 0.4)"}>Для разбитого сердца</Button>
            </GridItem>
            <GridItem>
                <Button
                py={"6"}
                w={'full'}
                className="font-doloman"
                fontSize={"13pt"}
                bg={{_focus: "rgba(220, 155, 75, 0.7)", base: "rgba(255, 255, 255, 0.1)"}}
                mixBlendMode={"difference"}
                backdropFilter={"blur(10px)"}
                boxShadow={"0 4px 12px rgba(0, 0, 0, 0.2)"}
                color={"white"}
                rounded={"full"}
                border={"1px solid rgba(255, 255, 255, 0.4)"}>Для любимого человека</Button>
            </GridItem>
            <GridItem>
                <Button
                py={"6"}
                w={'full'}
                className="font-doloman"
                fontSize={"13pt"}
                bg={{_focus: "rgba(220, 155, 75, 0.7)", base: "rgba(255, 255, 255, 0.1)"}}
                mixBlendMode={"difference"}
                backdropFilter={"blur(10px)"}
                boxShadow={"0 4px 12px rgba(0, 0, 0, 0.2)"}
                color={"white"}
                rounded={"full"}
                border={"1px solid rgba(255, 255, 255, 0.4)"}>Для близких</Button>
            </GridItem>
            <GridItem>
                <Button
                py={"6"}
                w={'full'}
                className="font-doloman"
                fontSize={"13pt"}
                bg={{_focus: "rgba(220, 155, 75, 0.7)", base: "rgba(255, 255, 255, 0.1)"}}
                mixBlendMode={"difference"}
                backdropFilter={"blur(10px)"}
                boxShadow={"0 4px 12px rgba(0, 0, 0, 0.2)"}
                color={"white"}
                rounded={"full"}
                border={"1px solid rgba(255, 255, 255, 0.4)"}>Про ребёнка</Button>
            </GridItem>
            <GridItem>
                <Button
                py={"6"}
                w={'full'}
                className="font-doloman"
                fontSize={"13pt"}
                bg={{_focus: "rgba(220, 155, 75, 0.7)", base: "rgba(255, 255, 255, 0.1)"}}
                mixBlendMode={"difference"}
                backdropFilter={"blur(10px)"}
                boxShadow={"0 4px 12px rgba(0, 0, 0, 0.2)"}
                color={"white"}
                rounded={"full"}
                border={"1px solid rgba(255, 255, 255, 0.4)"}>О герое или солдате</Button>
            </GridItem>
            <GridItem>
                <Button
                py={"6"}
                w={'full'}
                className="font-doloman"
                fontSize={"13pt"}
                bg={{_focus: "rgba(220, 155, 75, 0.7)", base: "rgba(255, 255, 255, 0.1)"}}
                mixBlendMode={"difference"}
                backdropFilter={"blur(10px)"}
                boxShadow={"0 4px 12px rgba(0, 0, 0, 0.2)"}
                color={"white"}
                rounded={"full"}
                border={"1px solid rgba(255, 255, 255, 0.4)"}>Для поздравления</Button>
            </GridItem>
            <GridItem
            colSpan={2}>
                <Button
                py={"6"}
                w={'full'}
                className="font-doloman"
                fontSize={"13pt"}
                bg={{_focus: "rgba(220, 155, 75, 0.7)", base: "rgba(255, 255, 255, 0.1)"}}
                mixBlendMode={"difference"}
                backdropFilter={"blur(10px)"}
                boxShadow={"0 4px 12px rgba(0, 0, 0, 0.2)"}
                color={"white"}
                rounded={"full"}
                border={"1px solid rgba(255, 255, 255, 0.4)"}>Другое</Button>
            </GridItem>
        </Grid>
        </VStack>


    </>
}
