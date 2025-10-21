import { COLOR } from '../components/ui/colors'
import { Box, Flex, Heading, Text, Button, Grid, GridItem } from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/generate')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <Flex
            flexDir={"column"}
            w={"full"}
            alignItems={"center"}
            pt={10}
            gap={4}>
            <Box
                bg={COLOR.bg.chakra.blue950}
                w={"11/12"}
                p={10}
                border={"1px solid" + COLOR.stroke.stroke700}
                textAlign={"center"}
                borderRadius="md">
                <Heading size="2xl">СОЗДАЙТЕ ПЕСНЮ ЗА 60</Heading>
                <Text fontSize="2xl" mt={4}>(слайдер)</Text>
            </Box>

            <Grid
                templateColumns="1fr"
                gap={4}
                w="11/12">
                <GridItem
                    bg={COLOR.bg.chakra.blue950}
                    p={4}
                    borderRadius="md"
                    border={"1px solid" + COLOR.stroke.stroke700}>
                    <Link 
                        to="/create"
                        style={{ textDecoration: 'none', display: 'block' }}>
                        <Flex gap={4} alignItems="center">
                            <Box flexShrink={0} w="80px" h="80px" bg="gray.700" borderRadius="md">
                                {/* Placeholder for image */}
                            </Box>
                            <Box>
                                <Heading size="md">Песня по сценарию</Heading>
                                <Text mt={1} fontSize="sm">Выбери сценарий и заполни анкету - получишь персональную песню</Text>
                                <Button
                                    mt={3}
                                    size="sm"
                                    colorScheme="purple"
                                    variant="solid">
                                    Выбрать сценарий
                                </Button>
                            </Box>
                        </Flex>
                    </Link>
                </GridItem>

                <GridItem
                    bg={COLOR.bg.chakra.blue950}
                    p={4}
                    borderRadius="md"
                    border={"1px solid" + COLOR.stroke.stroke700}
                    _hover={{ borderColor: "purple.500", cursor: "pointer" }}>
                    <Flex gap={4} alignItems="center">
                        <Box flexShrink={0} w="80px" h="80px" bg="gray.700" borderRadius="md">
                            {/* Placeholder for image */}
                        </Box>
                        <Box>
                            <Heading size="md">Песня по фото</Heading>
                            <Text mt={1} fontSize="sm">Сфотографируйте человека, место или предмет - Трекопес напишет трек</Text>
                            <Button
                                mt={3}
                                size="sm"
                                colorScheme="purple"
                                variant="solid">
                                Загрузить фото
                            </Button>
                        </Box>
                    </Flex>
                </GridItem>

                <GridItem
                    bg={COLOR.bg.chakra.blue950}
                    p={4}
                    borderRadius="md"
                    border={"1px solid" + COLOR.stroke.stroke700}
                    _hover={{ borderColor: "purple.500", cursor: "pointer" }}>
                    <Flex gap={4} alignItems="center">
                        <Box flexShrink={0} w="80px" h="80px" bg="gray.700" borderRadius="md">
                            {/* Placeholder for image */}
                        </Box>
                        <Box>
                            <Heading size="md">Песня по ссылке</Heading>
                            <Text mt={1} fontSize="sm">Кидай ссылку на свой профиль в ВК или профиль друга - я все изучу и сделаю песню</Text>
                            <Button
                                mt={3}
                                size="sm"
                                colorScheme="purple"
                                variant="solid">
                                Указать ссылку
                            </Button>
                        </Box>
                    </Flex>
                </GridItem>
            </Grid>
        </Flex>
    )
}
