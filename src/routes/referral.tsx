import { COLOR } from '../components/ui/colors'
import { Box, Flex, Text, Clipboard, IconButton, Grid, GridItem} from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'
import { BrandButton } from '../components/ui/button'
import type { Telegram } from 'telegram-web-app'
import { RiTelegram2Line } from 'react-icons/ri'
import { useEffect } from 'react'
import { setDockActive } from '../store'
import { BsPeople } from 'react-icons/bs'
import { FaRegCircle } from "react-icons/fa";
import { FaRegCheckCircle } from "react-icons/fa";



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

    // JSON-список карточек (можно вынести в отдельный файл/источник при необходимости)
    const REWARDS = [
        {
            id: 'r1',
            title: 'За 1 друга - 1 лапка',
            subtitle: '*за последующих в случае оплаты',
            bg: COLOR.kit.smoke,
            unlocked: true,
        },
        {
            id: 'r10',
            title: 'За 10 друзей - PRO',
            subtitle: '',
            bg: COLOR.kit.darkGray,
            unlocked: false,
        },
        {
            id: 'r20',
            title: 'За 20 друзей - 20% с оплат',
            subtitle: '',
            bg: COLOR.kit.darkGray,
            unlocked: false,
        },
        {
            id: 'r50',
            title: 'За 50 друзей - Partner PRO',
            subtitle: '',
            bg: COLOR.kit.darkGray,
            unlocked: false,
        },
    ] as const

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
                    py={5}
                    textAlign={"center"}
                    borderRadius="3xl"

                    gap={3}>
                    <Box>
                        <Text color={COLOR.kit.orangeWhite} fontSize={"24px"}>Пригласи друга</Text>
                        <Text>и вы оба получите по бесплатному треку</Text>
                    </Box>

                    <Flex
                        pl={5}
                        pr={3}
                        py={1}
                        bg={COLOR.kit.smoke}
                        rounded={"2xl"}
                        alignItems={"center"}
                        textAlign={"start"}
                        justifyItems={"space-beateen"}>
                        <Text lineClamp={1}>{refLink}</Text>
                        <Clipboard.Root value={refLink}>
                            <Clipboard.Trigger asChild>
                                <IconButton variant="ghost" size="sm">
                                    <Clipboard.Indicator />
                                </IconButton>
                            </Clipboard.Trigger>
                        </Clipboard.Root>
                    </Flex>

                    <BrandButton h={"50px"} onClick={handleSend}><RiTelegram2Line />Пригласить друга</BrandButton>

                </Flex>
                <Grid
                    templateColumns="1fr"
                    gap={2}
                    w="11/12"
                    mt={6}>
                    {REWARDS.map((item) => (
                        <GridItem
                            key={item.id}
                            bg={item.bg}
                            px={4}
                            py={2}
                            borderRadius="2xl">
                            <Flex alignItems="center" justifyContent="space-between">
                                <Flex alignItems="center" gap={3}>
                                    <BsPeople size={"24px"} style={{ boxSizing: "content-box", padding: "7px", borderRadius: "50%", background: COLOR.kit.iconBg }} />
                                    <Box>
                                        <Text fontSize="lg">{item.title}</Text>
                                        {item.subtitle ? (
                                            <Text color="gray.200" fontSize="sm">{item.subtitle}</Text>
                                        ) : null}
                                    </Box>
                                </Flex>
                                {item.unlocked ? (
                                    <FaRegCheckCircle size={20} color="#22c55e" />
                                ) : (
                                    <FaRegCircle size={20} color="white" />
                                )}
                            </Flex>
                        </GridItem>
                    ))}
                </Grid>
            </Flex>


        </>
    )
}
