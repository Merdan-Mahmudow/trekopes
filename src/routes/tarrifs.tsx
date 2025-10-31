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
    Image,
    Float,
} from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tarrifs')({
    component: RouteComponent,
})

type Tariff = {
    id: string
    title: string
    features: string[]
    price: number
    isActive: boolean
    image?: string
    isPopular?: boolean
}

function formatPriceRUB(value: number) {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value)
}

function TariffCard({ tariff }: { tariff: Tariff }) {
    const { title, features, price, isActive, isPopular, image } = tariff
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
        >
            {isPopular && (
                <Float placement={"top-start"} offsetX={10}>
                    <Badge
                        colorScheme="orange"
                    >
                        Хит
                    </Badge>
                </Float>
            )}

            <Flex gap={4} align="center">
                <Box flexShrink={0} w="110px" h="110px" bg="gray.700" borderRadius="md" overflow="hidden">
                    {image ? (
                        <Image src={image} alt={title} w="100%" h="100%" objectFit="cover" />
                    ) : (
                        <Box w="100%" h="100%" />
                    )}
                </Box>

                <Stack w="full">
                    <Flex justifyContent={"space-between"}>
                        <Heading size="lg">{title}</Heading>
                        <Text fontSize="lg" fontWeight="semibold" bg={"orange.600"} p={"2px 14px"} rounded={"full"}>{formatPriceRUB(price)}</Text>
                    </Flex>
                    <List.Root>
                        {features.map((feature) => (
                            <List.Item key={feature}>
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
            id: 'track-1',
            title: '1 трек',
            features: [
                '1 генерация только в Telegram-боте',
                'Ввод: голос, голосовое сообщение или текст',
                'Свободный формат: стиль, настроение; автонаписание текста',
            ],
            price: 250,
            isActive: false,
            image: '',
            isPopular: false,
        },
        {
            id: 'pro',
            title: 'PRO',
            features: [
                '10 PRO-треков, открыт весь функционал',
                'По стилю/жанрам/исполнителю, по фото и ссылке VK',
                'Подробные сценарии; голос/BPM/настроение',
            ],
            price: 999,
            isActive: true,
            image: '',
            isPopular: true,
        },
        {
            id: 'ultra',
            title: 'ULTRA',
            features: [
                '1 премиум-трек с менеджером (гарантия результата)',
                'Обложка + оживление обложки',
                '+20 PRO-генераций',
            ],
            price: 5000,
            isActive: false,
            image: '',
            isPopular: false,
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
