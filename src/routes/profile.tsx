import { setDockActive } from '../store'
import { MusicList } from '../components/MusicList'
import { Tabs, VStack } from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { HiOutlineLightBulb } from 'react-icons/hi'
import { LuUser } from 'react-icons/lu'

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
                            <LuUser/>
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
                <Tabs.Content value="examples">Manage your projects</Tabs.Content>
            </Tabs.Root>
        </>)
}
