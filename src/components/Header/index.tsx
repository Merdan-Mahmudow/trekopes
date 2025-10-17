import { Image, Grid, Box, Text, Flex, Clipboard, IconButton } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function Header() {
    const [chatID, setChatID] = useState<string>()
    useEffect(() => {
        setChatID("735673465")
    })
    return <>
        <Grid
            templateColumns={"repeat(3, 1fr)"}
            alignItems={"center"}
            justifyItems={"center"}>
            <Box></Box>
            <Image
                src={"https://storage.yandexcloud.net/trekopes/logo.PNG"}
                w={"80px"}
            />
            <Flex
                flexDir={"column"}
                justifyContent={"space-arond"}
                pt={"9px"}
                alignItems={"center"}>
                <Flex
                    w={"fit"}
                    border={"rgb(245, 118, 7) solid 2px"}
                    borderRadius={"full"}
                    p={"5px 7px"}
                    boxShadow={"rgb(245, 118, 7) 0 0 13px"}>
                    <Image
                        w={"25px"}
                        src="https://storage.yandexcloud.net/trekopes/paw.svg" />
                    <Text pl={"10px"}>18</Text>
                </Flex>
                <Flex>
                    <Text
                        color={"gray"}
                        fontSize={"10pt"}
                        mt={"8px"}>ID: {chatID}
                    </Text>
                    <Clipboard.Root value={chatID}>
                        <Clipboard.Trigger asChild>
                            <IconButton variant="ghost" color={"orange.400"} size="xs">
                                <Clipboard.Indicator />
                            </IconButton>
                        </Clipboard.Trigger>
                    </Clipboard.Root>
                </Flex>
            </Flex>
        </Grid>

    </>
}