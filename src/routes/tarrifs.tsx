import { motion, LayoutGroup, useSpring, useTransform, useVelocity } from 'framer-motion'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Badge, Box, Flex, Float, Grid, GridItem, Heading, Stack, Text, List, chakra, Image } from '@chakra-ui/react'
import IconMicrophone from '../assets/svg/microphone'
import IconKorona from '../assets/svg/korona'
import IconNote from '../assets/svg/music1'
import { COLOR } from '../components/ui/colors'

export const Route = createFileRoute('/tarrifs')({
    component: RouteComponent,
})

const ACCENTS = {
    tariffs: 'var(--accent-1, #F39204)',
    subscription: 'var(--accent-2, #E64763)',
}

const ACCENT_SURFACE = {
    tariffs: 'rgba(243, 146, 4, 0.18)',
    subscription: 'rgba(230, 71, 99, 0.24)',
}

const TabButton = chakra('button')

type AccentKey = keyof typeof ACCENTS

type TabConfig = {
    id: string
    title: string
    accent: string
    icons?: string[]
}

type Tariff = {
    id: string
    title: string
    features: string[]
    priceLabel: string
    accent: AccentKey
    image?: ReactNode
    badge?: { label: string; color: string }
    secondaryBadge?: { label: string; accent?: AccentKey; color?: string }
}

type Subscription = {
    id: string
    title: string
    emoji: ReactNode
    priceLabel: string
    accent: AccentKey
    features: string[]
    bonus: string
    info: string
}

const indicatorTransition = { type: 'spring', stiffness: 300, damping: 30 } as const
const sliderTransition = { stiffness: 200, damping: 30 }

function TariffCard({ tariff }: { tariff: Tariff }) {
    const navigate = useNavigate()
    const accentColor = ACCENTS[tariff.accent]
    const accentSurface = ACCENT_SURFACE[tariff.accent]
    const secondaryAccentColor =
        tariff.secondaryBadge?.color ??
        (tariff.secondaryBadge?.accent ? ACCENTS[tariff.secondaryBadge.accent] : accentColor)
    return (
        <GridItem
            bg="var(--layer-transparent, rgba(24,24,24,0.72))"
            border="1px solid var(--border, rgba(255,255,255,0.12))"
            p={{ base: 6, md: 7 }}
            borderRadius="24px"
            position="relative"
            role="button"
            tabIndex={0}
            aria-label={`Тариф ${tariff.title}`}
            transition="transform 0.1s ease, box-shadow 0.1s ease"
            _hover={{ transform: 'translateY(-6px)', boxShadow: '0 24px 48px rgba(0,0,0,0.35)' }}
            _focusVisible={{
                outline: `2px solid ${accentColor}`,
                outlineOffset: '4px',
            }}
            onClick={() => {
                const id = tariff.id === 'track' ? 'track' : tariff.id
                navigate({ to: '/subscription', search: { tarrif: id, source: '' } })
            }}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    const id = tariff.id === 'track' ? 'track' : tariff.id
                    navigate({ to: '/subscription', search: { tarrif: id, source: '' } })
                }
            }}
        >
            {tariff.badge && (
                <Float placement="top-start" offsetX={70}>
                    <Badge
                        variant="solid"
                        bg={tariff.badge.color}
                        color="white"
                        borderRadius="full"
                        px={3}
                        py={1}
                        fontSize="xs"
                        textTransform="none"
                    >
                        {tariff.badge.label}
                    </Badge>
                </Float>
            )}
            {tariff.secondaryBadge && (
                <Float placement="top-start" offsetX={105}>
                    <Badge
                        variant="subtle"
                        bg={ACCENT_SURFACE[tariff.secondaryBadge?.accent ?? tariff.accent]}
                        color={secondaryAccentColor}
                        borderRadius="full"
                        px={3}
                        py={1}
                        fontSize="xs"
                        textTransform="none"
                    >
                        {tariff.secondaryBadge.label}
                    </Badge>
                </Float>
            )}
            <Flex gap={4} align="center">
                <Flex
                    top={5}
                    position="relative"
                    justifyContent="center"
                    flexShrink={0}
                    w="110px"
                    h="110px"
                    bg="linear-gradient(215.54deg, rgba(237, 143, 2, 1) 10.1%, rgba(242, 97, 0, 1) 89.06%)"
                    borderRadius="24px"
                    overflow="hidden"
                >
                    {tariff.image ? tariff.image : <Box w="100%" h="100%" />}
                </Flex>

                <Stack w="full">
                    <Flex justifyContent="space-between">
                        <Heading size="lg" color={COLOR.kit.white} letterSpacing="0.04em">
                            {tariff.title}
                        </Heading>
                        <Text
                            fontSize="lg"
                            fontWeight="semibold"
                            bg={accentSurface}
                            color={accentColor}
                            px={4}
                            py={1}
                            borderRadius="full"
                        >
                            {tariff.priceLabel}
                        </Text>
                    </Flex>
                    <List.Root>
                        {tariff.features.map((feature) => (
                            <List.Item key={feature} _marker={{ color: 'transparent' }}>
                                <Text color={COLOR.kit.smoke} fontSize="sm" lineHeight="1.5">
                                    {feature}
                                </Text>
                            </List.Item>
                        ))}
                    </List.Root>
                </Stack>
            </Flex>
        </GridItem>
    )
}

function SubscriptionCard({ subscription }: { subscription: Subscription }) {
    const navigate = useNavigate()
    const accentColor = ACCENTS[subscription.accent]
    const accentSurface = ACCENT_SURFACE[subscription.accent]
    
    // Маппинг ID подписок на тарифы для страницы оформления
    const getTariffId = (subscriptionId: string) => {
        if (subscriptionId === 'pro-monthly') return 'pro'
        if (subscriptionId === 'ultra-monthly') return 'ultra'
        return 'pro'
    }
    
    return (
        <GridItem
            bg="var(--layer-transparent, rgba(24,24,24,0.72))"
            border="1px solid var(--border, rgba(255,255,255,0.12))"
            p={{ base: 6, md: 7 }}
            borderRadius="24px"
            display="flex"
            flexDirection="column"
            gap={5}
            aria-label={`Подписка ${subscription.title}`}
            transition="transform 0.1s ease, box-shadow 0.1s ease"
            _hover={{ transform: 'translateY(-6px)', boxShadow: '0 24px 48px rgba(0,0,0,0.35)' }}
            _focusVisible={{
                outline: `2px solid ${accentColor}`,
                outlineOffset: '4px',
            }}
            onClick={() => {
                const tariffId = getTariffId(subscription.id)
                navigate({ to: '/subscription', search: { tarrif: tariffId, source: 'subscription' } })
            }}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    const tariffId = getTariffId(subscription.id)
                    navigate({ to: '/subscription', search: { tarrif: tariffId, source: 'subscription' } })
                }
            }}
        >
            <Flex align="flex-start" gap={4}>
                <Flex
                    w="72px"
                    h="72px"
                    borderRadius="20px"
                    bg={accentSurface}
                    justify="center"
                    align="center"
                    fontSize="36px"
                    aria-hidden
                >
                    {subscription.emoji}
                </Flex>
                <Stack gap={2}>
                    <Heading size="lg" color={COLOR.kit.white} letterSpacing="0.04em">
                        {subscription.title}
                    </Heading>
                    <Text
                        fontSize="md"
                        fontWeight="semibold"
                        color={accentColor}
                        bg={accentSurface}
                        px={4}
                        py={1}
                        borderRadius="full"
                        width="fit-content"
                    >
                        {subscription.priceLabel}
                    </Text>
                </Stack>
            </Flex>

            <Stack gap={3}>
                <List.Root gap={3}>
                    {subscription.features.map((feature) => (
                        <List.Item key={feature} _marker={{ color: 'transparent' }}>
                            <Text color={COLOR.kit.smoke} fontSize="sm" lineHeight="1.6">
                                {feature}
                            </Text>
                        </List.Item>
                    ))}
                </List.Root>
                <Box borderTop="1px solid rgba(255,255,255,0.08)" pt={3}>
                    <Text color={accentColor} fontSize="sm" fontWeight="medium">
                        {subscription.bonus}
                    </Text>
                    <Text color={COLOR.kit.smoke} fontSize="sm" mt={2}>
                        {subscription.info}
                    </Text>
                </Box>
            </Stack>
        </GridItem>
    )
}

type SmoothViewProps = {
    index: number
    active: boolean
    containerWidth: number
    baseX: ReturnType<typeof useSpring>
    children: ReactNode
}

const SafeWidth = (width: number) => (Number.isFinite(width) && width > 0 ? width : 360)

const SmoothView = forwardRef<HTMLDivElement, SmoothViewProps>(
    ({ index, active, containerWidth, baseX, children }, ref) => {
        const width = SafeWidth(containerWidth)
        const viewX = useTransform(baseX, (value) => value + 0.75 * width * index)
        const opacity = useTransform(viewX, [-0.6 * width, 0, 0.6 * width], [0, 1, 0])
        const velocity = useVelocity(viewX)
        const blur = useTransform(velocity, (v) => {
            const normalized = Math.min(Math.abs(v) / width, 1)
            const blurValue = normalized * 2
            return `blur(${blurValue.toFixed(2)}px)`
        })

        return (
            <motion.div
                ref={ref}
                role="tabpanel"
                aria-hidden={!active}
                style={{
                    x: viewX,
                    opacity,
                    filter: blur,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    pointerEvents: active ? 'auto' : 'none',
                }}
            >
                {children}
            </motion.div>
        )
    },
)

SmoothView.displayName = 'SmoothView'

function RouteComponent() {
    const tabs = useMemo<TabConfig[]>(
        () => [ 
            {
                id: 'subscription',
                title: 'Подписка',
                accent: ACCENTS.subscription,
            },
            {
                id: 'tariffs',
                title: 'Тарифы',
                accent: ACCENTS.tariffs,
            },
           
        ],
        [],
    )

    const tariffs: Tariff[] = useMemo(
        () => [
            {
                id: 'track',
                title: 'TRACK',
                features: [
                    '1 генерация в боте',
                    'Выбор стиля, настроения и референсов до запуска',
                    'Запрос голосом или текстом',
                    'Трекопёс пишет текст песни',
                ],
                priceLabel: '250 ₽',
                accent: 'tariffs',
                image: <IconNote width={67.5} />,
            },
            {
                id: 'pro',
                title: 'PRO',
                features: [
                    '10 PRO‑треков',
                    'Подробные сценарии на все случаи: поздравления, мотивация и многое другое',
                    'Референсы по артисту, жанру, фото или ссылке',
                ],
                priceLabel: '999 ₽',
                accent: 'tariffs',
                image: <IconMicrophone width={85} />,
                badge: { label: 'Популярное', color: ACCENTS.subscription },
            },
            {
                id: 'ultra',
                title: 'ULTRA',
                features: [
                    '1 PREMIUM‑трек с гарантией результата',
                    '20 PRO‑генераций',
                    'Персональный менеджер до финала релиза',
                    'Обложка и её оживление в подарок',
                ],
                priceLabel: '5 000 ₽',
                accent: 'tariffs',
                image: <IconKorona width={85} />,
                secondaryBadge: { label: 'Персональный менеджер', accent: 'tariffs' },
            },
        ],
        [],
    )

    const subscriptions: Subscription[] = useMemo(
        () => [
            {
                id: 'pro-monthly',
                title: '20 PRO‑треков',
                emoji: '❤️',
                priceLabel: '990 ₽/мес',
                accent: 'subscription',
                features: [
                    'Весь PRO‑функционал: сценарии, референс артиста, параметры трека',
                    'Голос, BPM и настроение настраиваются перед запуском',
                    'Правило: 1 трек = 1 генерация, платите только за факт запуска',
                ],
                bonus: 'Бонус 48 ч — вторая версия каждого трека бесплатно',
                info: 'В течение 48 часов после заказа вы получаете бесплатный дубль при каждом запуске генерации.',
            },
            {
                id: 'ultra-monthly',
                title: '1 Premium + 50 PRO',
                emoji: <Image src="/gem.png" alt="gem" width={10} height={10} />,
                priceLabel: '4 990 ₽/мес',
                accent: 'tariffs',
                features: [
                    'Премиум‑трек с персональным менеджером (до 5 итераций) — доведём до результата',
                    '50 PRO‑генераций в месяц',
                    'Обложка и её оживление входят в подписку',
                ],
                bonus: 'Бонус 48 ч — бесплатная вторая версия всех генераций',
                info: 'Любая PRO или Premium генерация, запущенная в течение 48 часов, получает вторую версию без доплат.',
            },
        ],
        [],
    )

    const [activeIndex, setActiveIndex] = useState(0)
    const tabContainerRef = useRef<HTMLDivElement | null>(null)
    const [containerWidth, setContainerWidth] = useState(0)
    const [contentHeight, setContentHeight] = useState(0)
    const activeContentRef = useRef<HTMLDivElement | null>(null)
    const baseX = useSpring(0, sliderTransition)

    const measureWidth = useCallback(() => {
        if (!tabContainerRef.current) return
        const rect = tabContainerRef.current.getBoundingClientRect()
        setContainerWidth(rect.width)
    }, [])

    const measureContent = useCallback(() => {
        if (!activeContentRef.current) return
        setContentHeight(activeContentRef.current.getBoundingClientRect().height)
    }, [])

    useEffect(() => {
        measureWidth()
        window.addEventListener('resize', measureWidth)
        return () => window.removeEventListener('resize', measureWidth)
    }, [measureWidth])

    useEffect(() => {
        baseX.set(-0.75 * SafeWidth(containerWidth) * activeIndex)
        const timeout = requestAnimationFrame(measureContent)
        return () => cancelAnimationFrame(timeout)
    }, [activeIndex, containerWidth, baseX, measureContent])

    useEffect(() => {
        measureContent()
        window.addEventListener('resize', measureContent)
        return () => window.removeEventListener('resize', measureContent)
    }, [measureContent])

    const handleTabChange = (index: number) => {
        setActiveIndex(index)
    }

    const views = useMemo(
        () => [
            {
                id: 'subscription-panel',
                content: (
                    <Grid
                        templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }}
                        gap={6}
                        w="11/12"
                        mx="auto"
                    >
                        {subscriptions.map((subscription) => (
                            <SubscriptionCard key={subscription.id} subscription={subscription} />
                        ))}
                        <Box w="100%" h="10vh" />
                    </Grid>
                ),
            },
            {
                id: 'tariffs-panel',
                content: (
                    <Grid
                        templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' }}
                        gap={6}
                        w="11/12"
                        mx="auto"
                    >
                        {tariffs.map((tariff) => (
                            <TariffCard key={tariff.id} tariff={tariff} />
                        ))}
                    </Grid>
                ),
            },
            
        ],
        [tariffs, subscriptions],
    )

    return (
        <Flex flexDir="column" w="full" align="center" gap={6}>
            <Text w="11/12" fontSize="24px" color={COLOR.kit.orangeWhite}>
                Создать трек
            </Text>

            <LayoutGroup>
                <Flex
                    ref={tabContainerRef}
                    w="11/12"
                    bg="var(--layer-transparent, rgba(24,24,24,0.72))"
                    border="1px solid var(--border, rgba(255,255,255,0.12))"
                    borderRadius="20px"
                    p="6px"
                    gap={2}
                    justify="center"
                    role="tablist"
                    aria-label="Переключение между тарифами и подписками"
                >
                    {tabs.map((tab, index) => {
                        const isActive = index === activeIndex
                        return (
                            <TabButton
                                type="button"
                                key={tab.id}
                                position="relative"
                                flex={1}
                                px={6}
                                py={3}
                                borderRadius="16px"
                                background="transparent"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                fontSize="16px"
                                fontWeight={600}
                                color={isActive ? COLOR.kit.white : 'rgba(255,255,255,0.56)'}
                                textTransform="uppercase"
                                letterSpacing="0.08em"
                                cursor="pointer"
                                outline="none"
                                overflow="hidden"
                                onClick={() => handleTabChange(index)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault()
                                        handleTabChange(index)
                                    }
                                }}
                                tabIndex={0}
                                aria-selected={isActive}
                                aria-controls={views[index]?.id}
                                id={`${tab.id}-tab`}
                                _focusVisible={{ outline: `2px solid ${tab.accent}`, outlineOffset: '4px' }}
                            >
                                {isActive && (
                                    <motion.span
                                        layoutId="activeTab"
                                        transition={indicatorTransition}
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            borderRadius: '16px',
                                            backgroundColor: tab.accent,
                                            opacity: 0.28,
                                        }}
                                    />
                                )}
                                <Flex position="relative" zIndex={1} align="center" gap={2}>
                                    <Text as="span">{tab.title}</Text>
                                </Flex>
                            </TabButton>
                        )
                    })}
                </Flex>
            </LayoutGroup>

            <Box
                position="relative"
                w="full"
                maxW="1440px"
                mt={2}
                style={{ height: contentHeight ? `${contentHeight}px` : 'auto' }}
            >
                {views.map((view, index) => (
                    <SmoothView
                        key={view.id}
                        index={index}
                        active={activeIndex === index}
                        containerWidth={containerWidth}
                        baseX={baseX}
                        ref={activeIndex === index ? activeContentRef : null}
                    >
                        <Box id={view.id} aria-labelledby={`${tabs[index].id}-tab`}>
                            {view.content}
                        </Box>
                    </SmoothView>
                ))}
            </Box>
        </Flex>
    )
}

export default RouteComponent
