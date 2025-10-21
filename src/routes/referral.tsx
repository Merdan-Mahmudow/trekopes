import { COLOR } from '../components/ui/colors'
import { Box, Flex, Heading, Text, Clipboard, IconButton, Button, Grid, GridItem } from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'
import { PawIcon } from '../assets/svg/paw'
import { MdLockOpen } from 'react-icons/md'

export const Route = createFileRoute('/referral')({
    component: RouteComponent,
})

function RouteComponent() {
    const refLink = "https://t.me/TPEKOllEC_BOT?start=87968768"
    return (
        <>
            <Flex
                flexDir={"column"}
                w={"full"}
                alignItems={"center"}
                pt={10}>
                <Box
                    bg={COLOR.bg.chakra.blue950}
                    w={"11/12"}
                    p={3}
                    border={"1px solid" + COLOR.stroke.stroke700}
                    textAlign={"center"}>
                    <Heading>Пригласи друга</Heading>
                    <Text>и вы оба получите по бесплатному треку</Text>

                    <Flex
                     px={2}
                     py={1}
                     bg={"whiteAlpha.400"}>
                        <Text>{refLink}</Text>
                        <Clipboard.Root value={refLink}>
                            <Clipboard.Trigger asChild>
                                <IconButton variant="ghost" color={"orange.400"} size="xs">
                                    <Clipboard.Indicator />
                                </IconButton>
                            </Clipboard.Trigger>
                        </Clipboard.Root>
                    </Flex>
                    <Button>Пригласить друга</Button>
                </Box>
                <Grid
                    templateColumns="1fr"
                    gap={4}
                    w="11/12"
                    mt={6}>
                    <GridItem
                        bg={COLOR.bg.chakra.blue950}
                        p={4}
                        borderRadius="md"
                        border={"1px solid" + COLOR.stroke.stroke700}>
                        <Flex alignItems="center" justifyContent="space-between">
                            <Flex alignItems="center" gap={3}>
                                <PawIcon size={24} />
                                <Box>
                                    <Text fontSize="lg">За 1 друга - 1 лапка</Text>
                                    <Text color="gray.500" fontSize="sm">*за последующих в случае оплаты</Text>
                                </Box>
                            </Flex>
                            <MdLockOpen color="gray.500" />
                        </Flex>
                    </GridItem>
                    <GridItem
                        bg={COLOR.bg.chakra.blue950}
                        p={4}
                        borderRadius="md"
                        border={"1px solid" + COLOR.stroke.stroke700}>
                        <Flex alignItems="center" justifyContent="space-between">
                            <Flex alignItems="center" gap={3}>
                                <PawIcon size={24} />
                                <Text fontSize="lg">За 10 друзей - PRO</Text>
                            </Flex>
                            <MdLockOpen color="gray.500" />
                        </Flex>
                    </GridItem>
                    <GridItem
                        bg={COLOR.bg.chakra.blue950}
                        p={4}
                        borderRadius="md"
                        border={"1px solid" + COLOR.stroke.stroke700}>
                        <Flex alignItems="center" justifyContent="space-between">
                            <Flex alignItems="center" gap={3}>
                                <PawIcon size={24} />
                                <Text fontSize="lg">За 20 друзей - 20% с оплат</Text>
                            </Flex>
                            <MdLockOpen color="gray.500" />
                        </Flex>
                    </GridItem>
                    <GridItem
                        bg={COLOR.bg.chakra.blue950}
                        p={4}
                        borderRadius="md"
                        border={"1px solid" + COLOR.stroke.stroke700}>
                        <Flex alignItems="center" justifyContent="space-between">
                            <Flex alignItems="center" gap={3}>
                                <PawIcon size={24} />
                                <Text fontSize="lg">За 50 друзей - Partner PRO</Text>
                            </Flex>
                            <MdLockOpen color="gray.500" />
                        </Flex>
                    </GridItem>
                </Grid>
            </Flex>
            
        </>
    )
}
