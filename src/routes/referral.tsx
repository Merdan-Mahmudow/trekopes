import { COLOR } from '../components/ui/colors'
import { Box, Flex, Text, Clipboard, IconButton, Grid, GridItem} from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'
import { SiGoogletasks } from "react-icons/si";
import { BrandButton } from '../components/ui/button'
import type { Telegram } from 'telegram-web-app'
import { RiTelegram2Line } from 'react-icons/ri'
import { useEffect } from 'react'
import { setDockActive } from '../store'
import { BsPeople } from 'react-icons/bs'
import { LuLockKeyhole } from "react-icons/lu";



export const Route = createFileRoute('/referral')({
    component: RouteComponent,
})

function RouteComponent() {

    const tg: Telegram = window.Telegram;
    const refLink = `https://t.me/TPEKOllEC_BOT?start=${tg.WebApp.initDataUnsafe.user?.id}`
    useEffect(() => {
        setDockActive("left")
    }, [])
    const handleSend = () => {
        const sendLink = `https://t.me/share/url?url=${encodeURIComponent(refLink)}`
        tg.WebApp.openTelegramLink(sendLink)

    }

    return (
        <>
            <Flex
                flexDir={"column"}
                w={"full"}
                alignItems={"center"}
                py={10}
                pb={"11vh"}
            >
                <Flex
                    flexDir={"column"}
                    bg={COLOR.kit.darkGray}
                    w={"11/12"}
                    px={6}
                    py={7}
                    textAlign={"center"}
                    borderRadius="2xl"

                    gap={3}>
                    <Box>
                        <Text color={COLOR.kit.orangeWhite} fontSize={"24px"}>Пригласи друга</Text>
                        <Text>и вы оба получите по бесплатному треку</Text>
                    </Box>

                    <Flex
                        px={4}
                        py={2}
                        bg={COLOR.kit.smoke}
                        rounded={"2xl"}
                        alignItems={"center"}>
                        <Text lineClamp={1}>{refLink}</Text>
                        <Clipboard.Root value={refLink}>
                            <Clipboard.Trigger asChild>
                                <IconButton variant="ghost" size="sm">
                                    <Clipboard.Indicator />
                                </IconButton>
                            </Clipboard.Trigger>
                        </Clipboard.Root>
                    </Flex>

                    <BrandButton onClick={handleSend}><RiTelegram2Line />Пригласить друга</BrandButton>

                </Flex>
                <Grid
                    templateColumns="1fr"
                    gap={2}
                    w="11/12"
                    mt={6}>
                    <GridItem
                        bg={COLOR.kit.smoke}
                        p={4}
                        borderRadius="2xl">
                        <Flex alignItems="center" justifyContent="space-between">
                            <Flex alignItems="center" gap={3}>
                                <BsPeople size={"20"} style={{ boxSizing: "content-box", padding: "16px", borderRadius: "50%", background: COLOR.kit.iconBg }} />
                                <Box>
                                    <Text fontSize="lg">За 1 друга - 1 лапка</Text>
                                    <Text color="gray.200" fontSize="sm">*за последующих в случае оплаты</Text>
                                </Box>
                            </Flex>
                           <SiGoogletasks size={20} fill="#25d130ff" />
                        </Flex>
                    </GridItem>
                    <GridItem
                        bg={COLOR.kit.darkGray}
                        p={4}
                        borderRadius="2xl">
                        <Flex alignItems="center" justifyContent="space-between">
                            <Flex alignItems="center" gap={3}>
                                <BsPeople size={"20"} style={{ boxSizing: "content-box", padding: "16px", borderRadius: "50%", background: COLOR.kit.iconBg }} />
                                <Text fontSize="lg">За 10 друзей - PRO</Text>
                            </Flex>
                            <LuLockKeyhole size={20} color="white" />
                        </Flex>
                    </GridItem>
                    <GridItem
                        bg={COLOR.kit.darkGray}
                        p={4}
                        borderRadius="2xl">
                        <Flex alignItems="center" justifyContent="space-between">
                            <Flex alignItems="center" gap={3}>
                                <BsPeople size={"20"} style={{ boxSizing: "content-box", padding: "16px", borderRadius: "50%", background: COLOR.kit.iconBg }} />                                <Text fontSize="lg">За 20 друзей - 20% с оплат</Text>
                            </Flex>
                            <LuLockKeyhole size={20} color="white" />
                        </Flex>
                    </GridItem>
                    <GridItem
                        bg={COLOR.kit.darkGray}
                        p={4}
                        borderRadius="2xl">
                        <Flex alignItems="center" justifyContent="space-between">
                            <Flex alignItems="center" gap={3}>
                                <BsPeople size={"20"} style={{ boxSizing: "content-box", padding: "16px", borderRadius: "50%", background: COLOR.kit.iconBg }} />                                <Text fontSize="lg">За 50 друзей - Partner PRO</Text>
                            </Flex>
                            <LuLockKeyhole size={20} color="white" />
                        </Flex>
                    </GridItem>
                </Grid>
            </Flex>


        </>
    )
}
