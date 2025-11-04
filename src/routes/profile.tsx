import { setDockActive } from '../store'
import { MusicList } from '../components/MusicList'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Text } from '@chakra-ui/react'
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
        <Text color={COLOR.kit.orangeWhite} fontSize={"2xl"} px={6}>Мои треки</Text>
            <MusicList />
        </>)
}
