import { setDockActive } from '../store'
import { MusicList } from '../components/MusicList'
import { Grid, GridItem, Text, Icon, Tabs, VStack } from '@chakra-ui/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { HiOutlineLightBulb } from 'react-icons/hi'
import { LuCopyPlus, LuUser } from 'react-icons/lu'
import { COLOR } from '../components/ui/colors'

export const Route = createFileRoute('/profile')({
    component: RouteComponent,
})

function RouteComponent() {

    useEffect(() => {
        setDockActive("left")
    }, [])
    return (
        <>
            <Tabs.Root defaultValue="examples" variant={'enclosed'}>
                <VStack pt={4}>
                    <Tabs.List
                        boxShadowColor={"transparent"}
                        rounded={"2xl"}
                        w={'80%'}
                        justifyContent={"space-around"}
                        mb={4}
                        borderColor={'transparent'}>

                        <Tabs.Trigger
                            w={"full"}
                            value="mytracks"
                            rounded={"2xl"}>
                            <LuUser />
                            Мои треки
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            value="examples"
                            rounded={"2xl"}
                            w={"full"}>
                            <HiOutlineLightBulb size={"16px"} />
                            Идеи
                        </Tabs.Trigger>
                    </Tabs.List>
                </VStack>

                <Tabs.Content value="mytracks">
                    <MusicList listType='mytracks' />
                </Tabs.Content>
                <Tabs.Content value="examples">
                    <Grid gridTemplateColumns={"repeat(3, 1fr)"} gridTemplateRows={"repeat(3, 1fr)"} h={"80dvh"}>
                        <GridItem></GridItem>
                        <GridItem display={"flex"} color={COLOR.kit.orange} alignItems={"end"} justifyContent={"center"}>
                            <Link to='/generate'>
                            <Icon fontSize={"6xl"} children={<LuCopyPlus />} />
                            
                            </Link>
                        </GridItem>
                        <GridItem></GridItem>
                        <GridItem></GridItem>
                        <GridItem textAlign={"center"} pt="3"><Text color={COLOR.kit.orange} fontSize={"xl"} fontWeight={"bolder"}>Создать трек</Text></GridItem>
                        <GridItem></GridItem>
                        <GridItem></GridItem>
                        <GridItem></GridItem>
                        <GridItem></GridItem>
                    </Grid>
                </Tabs.Content>
            </Tabs.Root>
        </>)
}
