import IconMicrophone from '../assets/svg/microphone'
import IconKorona from '../assets/svg/korona'
import { COLOR } from '../components/ui/colors'
import {
    Box,
    Flex,
    Heading,
    Text,
    Grid,
    GridItem,
    Badge,
    Stack,
    List,
    Float,
} from '@chakra-ui/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import IconNote from '../assets/svg/music1'

export const Route = createFileRoute('/tarrifs')({
    component: RouteComponent,
})

type Tariff = {
    id: string
    title: string
    features: string[]
    price: number
    isActive: boolean
    image?: ReactNode
    isPopular?: boolean
    personal?: boolean
}

function formatPriceRUB(value: number) {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value)
}

function TariffCard({ tariff }: { tariff: Tariff }) {
    const navigate = useNavigate()
    const { title, features, price, isActive, isPopular, image, personal } = tariff
    return (
        <GridItem
            bg={COLOR.kit.darkGray}
            p="24px"
            borderRadius="2xl"
            border="1px solid"
            borderColor={isActive ? COLOR.kit.orangeWhite : 'whiteAlpha.100'}
            boxShadow={isActive ? 'md' : 'sm'}
            position="relative"
            transition="all 0.2s ease"
            _hover={{ transform: 'translateY(-2px)' }}
            cursor="pointer"
            onClick={() => {
                const id = title.toLowerCase() === 'track' ? 'track' : title.toLowerCase()
                navigate({ to: '/subscription', search: { tarrif: id, source: ""} })
            }}
        >
            {isPopular && (
                <Float placement={"top-start"} offsetX={20}>
                    <Badge
                        colorScheme="orange"
                        bg={"red.500"}
                    >
                        Популярное
                    </Badge>
                </Float>
            )}
            {personal && (
                <Float placement={"top-start"} offsetX={20}>
                    <Badge
                        colorScheme="orange"
                    >
                        Перcональный менеджер
                    </Badge>
                </Float>
            )}
            <Flex gap={4} align="center">
                <Flex alignItems={"center"} justifyContent={"center"} flexShrink={0} w="110px" h="110px" bg={'orange.600'} borderRadius="2xl" overflow="hidden">
                    {image ? (
                        image
                    ) : (
                        <Box w="100%" h="100%" />
                    )}
                </Flex>

                <Stack w="full">
                    <Flex justifyContent={"space-between"}>
                        <Heading size="lg">{title}</Heading>
                        <Text fontSize="lg" fontWeight="semibold" bg={"orange.600"} p={"2px 14px"} rounded={"full"}>{formatPriceRUB(price)}</Text>
                    </Flex>
                    <List.Root>
                        {features.map((feature) => (
                            <List.Item key={feature} _marker={{ color: "transparent" }}>
                                <Text color={COLOR.kit.smoke} fontSize="sm">{feature}</Text>
                            </List.Item>
                        ))}
                    </List.Root>
                </Stack>
            </Flex>
        </GridItem>
    )
}

function RouteComponent() {
    const TARIFFS: Tariff[] = [
        {
            id: 'track',
            title: 'TRACK',
            features: [
                '1 генерация в боте',
                'Выбирай стиль/настроение, говори трекопсу - он сделает',
                'голосовым или текстом',
                'Трекопес напишет текст',
            ],
            price: 250,
            isActive: false,
            image: <IconNote width={67.5} />,
            isPopular: false,
        },
        {
            id: 'pro',
            title: 'PRO',
            features: [
                '10 PRO-треков',
                'Подробные сценарии на все случаи жизни: от поздравлений до личной мотивации',
                'По артисту/жанру/фото/ссылке',
            ],
            price: 999,
            isActive: true,
            image: <IconMicrophone width={85} />,
            isPopular: true,
        },
        {
            id: 'ultra',
            title: 'ULTRA',
            features: [
                '1 PREMIUM-трек',
                'Гарантия результата',
                '20 PRO-генераций',
                'Обложка к треку + оживление',
            ],
            price: 5000,
            isActive: false,
            image: <IconKorona width={85} />,
            isPopular: false,
            personal: true
        },
    ]

    return (
        <Flex flexDir="column" w="full" align="center" gap={4} pb={"11vh"}>
            <Text w="11/12" fontSize="24px" color={COLOR.kit.orangeWhite}>Создать трек</Text>

            <Grid
                templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
                gap={3}
                w="11/12"
            >
                {TARIFFS.map((tariff) => (
                    <TariffCard key={tariff.id} tariff={tariff} />
                ))}
            </Grid>
        </Flex>
    )
}

export default RouteComponent
