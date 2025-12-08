import { COLOR } from '../components/ui/colors'
import { Box, Flex, Text, Clipboard, IconButton, Grid, GridItem, Avatar } from '@chakra-ui/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { BrandButton } from '../components/ui/custom-button'
import type { Telegram } from 'telegram-web-app'
import { RiTelegram2Line } from 'react-icons/ri'
import { useEffect } from 'react'
import store, { setDockActive } from '../store'
import { BsPeople } from 'react-icons/bs'
import { FaRegCircle } from "react-icons/fa";
import { FaRegCheckCircle } from "react-icons/fa";
import { useStore } from '@tanstack/react-store'
import { logError } from '../utils/logger'
import { LuGift } from "react-icons/lu";

export const Route = createFileRoute('/referral')({
    component: RouteComponent,
})

function RouteComponent() {
    const navigate = useNavigate()
    const tg: Telegram | undefined = window.Telegram;

    const user = useStore(store, (state) => state.user);
    const payments = useStore(store, (state) => state.payments);
    const userId = tg?.WebApp?.initDataUnsafe?.user?.id;
    const refLink = `https://t.me/TPEKOllEC_BOT?start=${userId || ''}`
    const hasPayments = payments.hasPayments;
    const MAX_FRIENDS = 5;

    useEffect(() => {
        setDockActive("left")
    }, [])

    const handleSend = () => {
        if (!tg?.WebApp) {
            logError("Telegram WebApp not available", undefined, { hasTg: !!tg });
            return;
        }
        const sendLink = `https://t.me/share/url?url=${encodeURIComponent(refLink)}`
        tg.WebApp.openTelegramLink(sendLink)
    }

    const REWARDS = [
        {
            id: 'r1',
            title: '1 друг = 1 трек',
            subtitle: 'Оба получаете по треку.',
            unlocked: user.referrals_signup_count >= 1,
        },
        {
            id: 'r2_5',
            title: '2–5 друзей = ещё по треку',
            subtitle: 'Другу сразу, тебе — когда он оплатит.',
            unlocked: user.referrals_purchase_count >= 2,
        },
        {
            id: 'r5',
            title: '5 друзей = PRO + трек',
            subtitle: 'PRO-режим + PRO-трек.',
            unlocked: user.referrals_purchase_count >= 5,
        },
    ].map((reward) => ({
        ...reward,
        bg: reward.unlocked ? COLOR.kit.smoke : COLOR.kit.darkGray,
    }));

    return (
        <>
            <Flex
                flexDir={"column"}
                w={"full"}
                alignItems={"center"}
                py={10}
                gap={5}
                pb={"11vh"}
            >


                <Box textAlign="center" w={"11/12"}>
                    <Text color={COLOR.kit.orangeWhite} fontSize={"24px"}>
                        {hasPayments ? "Пригласи друга" : "Пригласить друга"}
                    </Text>
                    <Text color={"gray.200"}>
                        {hasPayments
                            ? "Дари треки — получай треки."
                            : "Оплати трек — дари треки друзьям и получай бонусы."}
                    </Text>
                </Box>

                {hasPayments && (
                    <Flex
                        flexDir={"column"}
                        bg={COLOR.kit.darkGray}
                        w={"11/12"}
                        px={6}
                        py={5}
                        textAlign={"center"}
                        borderRadius="3xl"
                        gap={3}>
                        {true && (
                            <Flex alignItems={"center"} gap={3} w={"90vw"}>
                                <Avatar.Root variant="subtle" size={"lg"}>
                                    <Avatar.Fallback name={`${user.first_name} ${user.last_name}`} />
                                    <Avatar.Image src={tg.WebApp.initDataUnsafe.user?.photo_url} />
                                </Avatar.Root>
                                <Box textAlign={"start"}>
                                    <Text lineHeight={"15px"}>{user.first_name} {user.last_name}</Text>
                                    <Text color={"gray.400"} fontSize={"sm"}>Приглашено: {user.referrals_signup_count}</Text>
                                </Box>
                            </Flex>
                        )}
                        <Flex
                            pl={5}
                            pr={3}
                            py={1}
                            bg={COLOR.kit.smoke}
                            rounded={"2xl"}
                            alignItems={"center"}
                            textAlign={"start"}
                            justifyContent={"space-between"}>
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
                )}

                {hasPayments ? (
                    <>
                        <Grid
                            templateColumns="1fr"
                            gap={2}
                            w="11/12">
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
                        <Text color="gray.400" fontSize="xs" textAlign="center" w="10/12">
                            <span style={{ color: COLOR.kit.orange }}>*</span>Работает после оплаты, максимум {MAX_FRIENDS} друзей.
                        </Text>
                    </>
                ) : (
                    <>
                        <Grid templateColumns="1fr" gap={2} w="11/12">
                            <GridItem
                                bg={COLOR.kit.darkGray}
                                px={4}
                                py={3}
                                borderRadius="2xl">
                                <Flex alignItems="center" gap={3}>
                                    <Box
                                        bg={COLOR.kit.iconBg}
                                        color="white"
                                        borderRadius="full"
                                        w="36px"
                                        h="36px"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        fontWeight="bold">
                                        <LuGift size={20} />
                                    </Box>
                                    <Box>
                                        <Text fontSize="lg">Оплати — дари</Text>
                                        <Text color="gray.200" fontSize="sm">До {MAX_FRIENDS} подарочных треков для друзей.</Text>
                                    </Box>
                                </Flex>
                            </GridItem>
                        </Grid>
                        <BrandButton h={"50px"} w={"11/12"} onClick={() => navigate({ to: '/tarrifs' })}>
                            К тарифам
                        </BrandButton>
                    </>
                )}
            </Flex>


        </>
    )
}
